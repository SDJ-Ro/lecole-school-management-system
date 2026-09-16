<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CertificateModel;
use App\Models\MissingRecordModel;
use Core\Upload;

// Turns certificate copy requests and missing record requests into request cards
final class RequestCards
{
    // Waiting requests first, then newest first
    public static function ofStudent(int $studentId, string $studentName): array
    {
        $waitingFirst = function (array $cards): array
        {
            usort($cards, fn (array $a, array $b): int => ($b['status'] === 'pending') <=> ($a['status'] === 'pending'));

            return $cards;
        };

        return [
            'copy'   => $waitingFirst(array_map(fn (array $row): array => self::copy($row, $studentName), (new CertificateModel())->requestsOf($studentId))),
            'record' => feature('achievements')
                ? $waitingFirst(array_map(fn (array $row): array => self::record($row, $studentName), (new MissingRecordModel())->ofStudent($studentId)))
                : [],
        ];
    }

    public static function copy(array $row, string $studentName): array
    {
        [$state, $tone] = config("certificates.request_states.{$row['status']}");

        return [
            'id'       => (int) $row['id'],
            'label'    => "Request #{$row['id']}",
            'title'    => "{$row['purpose']} · {$row['copies']} " . ((int) $row['copies'] === 1 ? 'copy' : 'copies'),
            'sent'     => date(country('date_format'), strtotime($row['created_at'])),
            'status'   => $row['status'],
            'state'    => $state,
            'tone'     => $tone,
            'fields'   => ['Purpose' => $row['purpose'], 'Copies' => $row['copies'], 'Delivery' => $row['delivery'],
                           'Submitted' => date(country('date_format') . ', g:i A', strtotime($row['created_at']))]
                        + ($row['notes'] ? ['Notes' => $row['notes']] : []),
            'note'     => $row['note'],
            'noteLabel' => 'Management Note',
            'activity' => self::activity([$row['created_at'], 'Asked for the certificate', $studentName],
                $row['decided_at'] === null ? null : [$row['decided_at'], $row['status'] === 'approved' ? 'Approved' : 'Rejected', $row['decided_by_name'] ?? '—']),
        ];
    }

    public static function record(array $row, string $studentName): array
    {
        $tone = config("certificates.request_states.{$row['status']}")[1];

        return [
            'id'        => (int) $row['id'],
            'label'     => $row['record_type'],
            'status'    => $row['status'],
            'state'     => ['pending' => 'Pending', 'approved' => 'Added', 'rejected' => 'Not Added'][$row['status']],
            'tone'      => $tone,
            'title'     => $row['title'],
            'sent'      => date(country('date_format'), strtotime($row['created_at'])),
            'text'      => "{$row['school_year']} · {$row['details']}",
            'assigned'  => $row['programme'] === null ? words('{Class} {Teacher}') : $row['programme'] . words(' — {teacher} in charge'),
            'file'      => $row['evidence_name'],
            'note'      => $row['reason'],
            'noteLabel' => 'Reason',
            'activity'  => self::activity([$row['created_at'], 'Sent the request', $studentName],
                $row['answered_at'] === null ? null : [$row['answered_at'], $row['status'] === 'approved' ? 'Added to the record' : 'Not added', $row['answered_by_name'] ?? '—']),
        ];
    }

    // The Record form pre-filled with what the student sent
    public static function review(array $row, string $role): array
    {
        $path  = Upload::evidenceFile($row['evidence_path']);
        $group = config("achievements.request_types.{$row['record_type']}.group")
            ?? ($row['programme_type'] === null ? null : config("extracurricular.types.{$row['programme_type']}.group"));

        return [
            'id'          => $row['id'],
            'message'     => "{$row['record_type']} · {$row['school_year']}" . ($row['programme'] === null ? '' : " · {$row['programme']}"),
            'group'       => $group,
            'title'       => $row['title'],
            'date'        => '',
            'issuer'      => '',
            'level'       => '',
            'result'      => '',
            'description' => $row['details'],
            'file'        => $row['evidence_name'],
            'file_meta'   => strtoupper(pathinfo($row['evidence_path'], PATHINFO_EXTENSION)) . ' • '
                           . match (true)
                             {
                                 $path === null              => 'missing',
                                 filesize($path) < 1024 ** 2 => max(1, round(filesize($path) / 1024)) . ' KB',
                                 default                     => round(filesize($path) / 1024 ** 2, 1) . ' MB',
                             } . ' • Attached by ' . strtolower(word('student')),
            'url'         => "/{$role}/achievements/evidence?request={$row['id']}",
            'image'       => !str_ends_with($row['evidence_path'], '.pdf'),
        ];
    }

    // Each line says when, what happened and who did it, oldest first
    private static function activity(array $sent, ?array $answer): array
    {
        return $answer === null ? [$sent] : [$sent, $answer];
    }
}
