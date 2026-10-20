<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\CertificateModel;
use App\Models\MissingRecordModel;
use App\Models\SchoolYear;
use App\Models\TermMarkModel;
use App\Services\AccountClosing;
use App\Services\CertificateDraft;
use App\Services\Notify;
use App\Services\CertificatePdf;
use App\Services\RequestCards;
use Core\Controller;
use Core\Validator;

// Character Certificates
// Every student has a live draft built from their records
// Management edits the wording, finalises it with a number so it stops changing, or reopens it
// Students and parents can only download it once it is issued
// Missing records are answered in AchievementController::answer()
class CertificateController extends Controller
{
    private ?int $year = null;

    // GET /{role}/character-certificate
    // Shows the list, or one certificate when the link names a student
    public function management(string $role): void
    {
        $user = $this->requireRole($role);
        $code = $this->queryText('student');

        if ($code !== '')
        {
            $this->page('management/character_certificate', $user, $this->one($role, $this->certificate($code, "/{$role}/character-certificate")));

            return;
        }

        $all     = array_map([$this, 'card'], (new CertificateModel())->roster((int) config('white_label.academic.grade_numbers.last')));
        $filters = [
            'q'       => $this->queryText('q'),
            'status'  => array_key_exists($this->queryText('status'), config('certificates.statuses')) ? $this->queryText('status') : '',
            'pathway' => array_key_exists($this->queryText('pathway'), config('certificates.pathways')) ? $this->queryText('pathway') : '',
        ];
        $search  = mb_strtolower($filters['q']);
        $shown   = array_filter($all, fn (array $c): bool =>
            ($filters['status'] === '' || $c['status'] === $filters['status'])
            && ($filters['pathway'] === '' || $c['pathway'] === $filters['pathway'])
            && ($search === '' || str_contains(mb_strtolower("{$c['name']} {$c['id']} {$c['class']}"), $search)));

        // The tab counts include every certificate, but the groups hold only the ones shown
        $counts = ['' => count($all)];
        $groups = ['left' => array_values(array_filter($shown, fn (array $c): bool => $c['left']))];

        foreach (array_keys(config('certificates.statuses')) as $status)
        {
            $counts[$status] = count(array_filter($all, fn (array $c): bool => $c['status'] === $status));
            $groups[$status] = array_values(array_filter($shown, fn (array $c): bool => $c['status'] === $status && !$c['left']));
        }

        $this->page('management/character_certificate', $user, [
            'role'        => $role,
            'certificate' => null,
            'filters'     => $filters,
            'counts'      => $counts,
            'groups'      => $groups,
            // Leavers with something still waiting come first, because their accounts are closing
            'closingWaiting' => count(array_filter($all, fn (array $c): bool => $c['closing'])),
        ]);
    }

    // GET /student/certificates
    public function student(): void
    {
        $user     = $this->requireRole('student');
        $sheet    = CertificateDraft::of($user['id']);
        $requests = new MissingRecordModel();

        $this->page('student/certificates', $user, [
            'certificate'  => $sheet,
            'requests'     => RequestCards::ofStudent($user['id'], $sheet['name']),
            'classTeacher' => $requests->classTeacherOf($user['id']),
            'programmes'   => $requests->programmesOf($user['id']),
        ]);
    }

    // GET /{role}/.../pdf
    // A student gets their own and a parent their child's, only once it is issued
    // Management can get any student's, drafts too
    public function pdf(string $role): never
    {
        $user = $this->requireRole($role);
        $back = match ($role)
        {
            'student' => '/student/certificates',
            'parent'  => '/parent/child-profile?tab=certificate',
            default   => "/{$role}/character-certificate",
        };
        $certificate = match ($role)
        {
            'student' => CertificateDraft::of($user['id']),
            'parent'  => $user['child'] === null ? null : CertificateDraft::of($user['child']),
            default   => $this->certificate($this->queryText('student'), $back),
        };

        ob_start();
        $this->view('print/certificate', ['certificate' => $certificate]);

        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="character-certificate-' . $certificate['id'] . '.pdf"');
        header('Cache-Control: private, no-store');   // A private document, so a shared computer must not keep a copy
        echo CertificatePdf::make(ob_get_clean());
        exit;
    }

    // POST /{role}/character-certificate/wording. Only while it isn't issued
    public function wording(string $role): never
    {
        $user        = $this->requireRole($role);
        $certificate = $this->certificate($this->postText('student', 20), "/{$role}/character-certificate");
        $back        = $this->oneUrl($role, $certificate);
        $models      = new CertificateModel();
        $sections    = array_values(array_intersect(array_keys(config('certificates.sections')), $this->postList('sections')));

        
        foreach ($sections as $section)
        {
            // At most 20 points of up to 300 characters each, leaving out empty ones
            $points = array_slice(array_values(array_filter(array_map(fn (string $point): string => trim(mb_substr($point, 0, 300)), $this->postList($section)))), 0, 20);
        }

        $this->log($user, 'CERTIFICATE_WORDING_SAVED', "{$certificate['name']} ({$certificate['id']}): " . implode(', ', $sections));
        $this->setFlash('notice', 'Wording saved.');
        $this->redirect($back);
    }

    // POST /student/certificates/request. Only one request may wait at a time
    public function requestCopy(): never
    {
        $user = $this->requireRole('student');
        $back = '/student/certificates';
        $sent = ['purpose' => $this->postText('purpose', 100), 'copies' => $this->postText('copies', 2), 'delivery' => $this->postText('delivery', 60),
                 'notes' => $this->postText('notes', 500)];

        $errors = Validator::check($sent, [
            'purpose'  => 'required|in:' . implode(',', config('certificates.purposes')),
            'copies'   => 'required|between:1,' . config('certificates.max_copies'),
            'delivery' => 'required|in:' . implode(',', config('certificates.deliveries')),
        ], ['purpose' => 'Purpose', 'copies' => 'Number of copies', 'delivery' => 'Delivery method']);
 
        $this->setFlash('notice', 'Certificate requested.');
        $this->redirect($back);
    }

    // Same message for any code that isn't a student
    private function certificate(string $code, string $back): array
    {
        $id = (new CertificateModel())->studentId($code);

        return ($id === null ? null : CertificateDraft::of($id)) ?? $this->refuse('That certificate does not exist.', $back, 404);
    }

    private function oneUrl(string $role, array $certificate): string
    {
        return "/{$role}/character-certificate?student=" . rawurlencode($certificate['id']);
    }

    private function one(string $role, array $certificate): array
    {
        $copies    = (new CertificateModel())->requestsOf($certificate['studentId']);
        $records   = (new MissingRecordModel())->ofStudent($certificate['studentId']);
        $row       = $certificate['row'];
        $canReview = feature('achievements') && can('achievements.answer_any');   // Missing records are answered on this page

        // The activity list is built from dates already saved, oldest first
        $activity = array_filter([
            $certificate['leaving'] === null ? null : [$certificate['leaving']['answered_at'], 'Leaving approved: ' . date(country('date_format'), strtotime($certificate['leaving']['leaving_on'])), $certificate['name']],
            ($row['edited_at'] ?? null) === null ? null : [$row['edited_at'], 'Wording edited', word('management')],
            ($row['issued_at'] ?? null) === null ? null : [$row['issued_at'], "Issued (no. {$certificate['id']}/{$row['issue_number']})", word('management')],
            ($row['reopened_at'] ?? null) === null ? null : [$row['reopened_at'], 'Reopened', word('management')],
            ...array_map(fn (array $r): array => [$r['created_at'], "Asked for copies: {$r['purpose']}", $certificate['name']], $copies),
            ...array_map(fn (array $r): array => [$r['created_at'], "Missing record sent: {$r['title']}", $certificate['name']], $records),
        ]);
        usort($activity, fn (array $a, array $b): int => $a[0] <=> $b[0]);

        return [
            'role'          => $role,
            'certificate'   => $certificate,
            'waitingCount'  => count(array_filter($copies, fn (array $r): bool => $r['status'] === 'pending'))
                             + count(array_filter($records, fn (array $r): bool => $r['status'] === 'pending')),
            'requests'      => [
                'copy'   => array_map(fn (array $r): array => RequestCards::copy($r, $certificate['name']), $copies),
                'record' => array_map(fn (array $r): array => RequestCards::record($r, $certificate['name']), $records),
            ],
            'requestsStaff' => ['role' => $role, 'code' => $certificate['id'], 'canApprove' => $certificate['status'] === 'issued', 'canReview' => $canReview],
            'reviews'       => $canReview ? array_map(fn (array $r): array => RequestCards::review($r, $role), array_filter($records, fn (array $r): bool => $r['status'] === 'pending')) : [],
            'reviewStudent' => ['name' => $certificate['name'], 'code' => $certificate['id'], 'from' => $certificate['class']],
            'comments'      => array_map(fn (array $c): array => [word('term') . " {$c['term']}, {$c['year']}", $c['comment'], $c['teacher'] ?? '—'],
                (new TermMarkModel())->commentsOf($certificate['studentId'])),
            'activity'      => $activity,
        ];
    }

    // A student has left if their account is off, their leaving date has passed, or they graduated
    // Graduated means their latest class is from an earlier year
    private function card(array $row): array
    {
        $this->year ??= (new SchoolYear())->current();

        return [
            'id'         => $row['code'],
            'name'       => $row['name'],
            'class'      => $row['class_name'] ?? '—',
            'tone'       => card_tone($row['code']),
            'status'     => $row['status'] ?? 'draft',
            'pathway'    => $row['leaving_on'] !== null ? 'leaving' : 'graduating',
            'left'       => $row['activation_status'] === 'INACTIVE' || ($row['leaving_on'] !== null && $row['leaving_on'] <= date('Y-m-d'))
                || ($row['class_year'] !== null && (int) $row['class_year'] < $this->year),
            'hasWaiting' => ($row['status'] ?? 'draft') !== 'issued' || $row['waiting_requests'] > 0 || $row['waiting_records'] > 0,
            'closing'    => AccountClosing::waitingBeforeClosing($row),
        ];
    }
}