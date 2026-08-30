<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AuditLog;
use App\Models\UserModel;
use App\Models\VerificationCode;
use App\Services\AccountClosing;
use Core\Controller;
use Core\Mailer;

class AuthController extends Controller
{
    // One message for wrong, used-up and expired codes, so it never tells them apart
    private const CODE_FAILED = 'That code is wrong or has expired. Check the newest email, or ask for a new code.';

    public function chooser(): void
    {
        $this->redirectIfSignedIn();

        $this->view('auth/chooser', [
            'portals' => config('portals'),
            'notice'  => $this->getFlash('notice'),
        ]);
    }

    public function signin(string $role): void
    {
        $this->redirectIfSignedIn();

        $portals = config('portals');
        if (!isset($portals[$role]))
        {
            $this->redirect('/auth');
        }

        // When the link has ?reset, the forgot-password pop-up is on its code step and shows its errors inside
        $isResetStep = isset($_GET['reset']);

        $this->view('auth/signin', [
            'role'        => $role,
            'portal'      => $portals[$role],
            'isResetStep' => $isResetStep,
            'notice'      => $this->getFlash('notice'),
            'error'       => $isResetStep ? null : $this->getFlash('error'),
            'resetError'  => $isResetStep ? $this->getFlash('error') : null,
            'errorLink'   => $this->getFlash('error_link'),
            'identifier'  => $this->getFlash('identifier') ?? $this->queryText('identifier'),
            'csrfField'   => $this->csrfField(),
        ]);
    }

    // POST /auth/{role}
    public function handleSignin(string $role): never
    {
        $identifier = $this->postText('identifier');
        $password   = $this->postPassword('password');
        $back       = "/auth/{$role}";
        $keep       = ['identifier' => $identifier];

        AccountClosing::closeDue();   // Close any account whose closing day has come, before checking this one

        $users   = new UserModel();
        $log     = new AuditLog();
        $account = $users->findByIdentifier($identifier);

        // An unknown ID, a new account, a wrong password and a paused sign-in all get the same answer
        // That way the page never shows which IDs exist
        // "Forgot Password?" clears the pause, so locking someone else out on purpose gains nothing
        $wrong = fn (): never => $this->fail($back, 'Incorrect ID or password. After ' . config('app.login.lock_after')
            . ' wrong tries, sign-in for that ID pauses for ' . config('app.login.lock_minutes')[0]
            . ' minutes, longer if it goes on — use "Forgot Password?" to get in straight away.', $keep + ['error_link' => [
            'href'  => "/auth/{$role}/signup?identifier=" . urlencode($identifier),
            'label' => 'New here? Activate your account',
        ]]);

        // An account that isn't activated has no password to check
        if ($account === null || $account['activation_status'] === 'PENDING')
        {
            $log->record('LOGIN_FAILED', $account === null ? null : (int) $account['id'], $identifier,
                ($account === null ? 'Unknown ID' : 'Not activated yet') . " ({$role} portal)");
            $wrong();
        }

        $id = (int) $account['id'];

        // The pause is checked before the password, so nobody can keep guessing
        if ($account['minutes_locked'] > 0)
        {
            $log->record('LOGIN_FAILED', $id, $account['identifier'], "Paused ({$account['minutes_locked']} min left, {$role} portal)");
            $wrong();
        }

        if (!password_verify($password, (string) $account['password_hash']))
        {
            $paused = $users->recordFailedLogin($account);
            $log->record('LOGIN_FAILED', $id, $account['identifier'], 'Wrong password' . ($paused > 0 ? " (sign-in paused {$paused} min)" : ''));
            $wrong();
        }



        $users->recordSuccessfulLogin($id);
        $log->record('LOGIN_SUCCESS', $id, $account['identifier'], "{$role} portal");

        $this->startSession($account);
        $this->redirect("/{$role}");
    }

    // GET /auth/{role}/signup
    public function signup(string $role): void
    {
        $this->redirectIfSignedIn();

        $portals = config('portals');
        if (!isset($portals[$role]) || empty($portals[$role]['can_signup']))
        {
            $this->redirect('/auth');
        }

        if ($this->queryText('restart') === '1')
        {
            unset($_SESSION['activation']);
        }

        $pending = ($_SESSION['activation']['role'] ?? null) === $role ? $_SESSION['activation'] : null;

        $this->view('auth/signup', [
            'role'       => $role,
            'portal'     => $portals[$role],
            'step'       => $pending ? 'code' : 'details',
            'sentTo'     => $pending['sent_to'] ?? '',
            'identifier' => $this->getFlash('identifier') ?? ($this->queryText('identifier') ?: ($pending['identifier'] ?? '')),
            'fullName'   => $this->getFlash('full_name') ?? $this->queryText('name'),
            'error'      => $this->getFlash('error'),
            'notice'     => $this->getFlash('notice'),
            'csrfField'  => $this->csrfField(),
        ]);
    }

    // POST /logout
    public function logout(): never
    {
        $user = $this->getUser();

        if ($user !== null)
        {
            (new AuditLog())->record('LOGOUT', $user['id'], $user['identifier']);
            $this->endSession();
            $this->setFlash('notice', "You've been signed out.");
            $this->redirect("/auth/{$user['role']}");
        }

        $this->redirect('/auth');
    }

    private function redirectIfSignedIn(): void
    {
        $user = $this->getUser();
        if ($user !== null)
        {
            $this->redirect("/{$user['role']}");
        }
    }

    // $keep holds other values the form shows again, like the typed ID or a help link
    private function fail(string $back, string $error, array $keep = []): never
    {
        $this->setFlash('error', $error);

        foreach ($keep as $key => $value)
        {
            $this->setFlash($key, $value);
        }

        $this->redirect($back);
    }

    // The first name and photo are kept in the session for the sidebar
    // The Profile page must update them when they change
    private function startSession(array $account): void
    {
        $profile = (new UserModel())->findProfile((int) $account['id']);

        session_regenerate_id(true);
        $_SESSION['user'] = [
            'id'         => (int) $account['id'],
            'identifier' => $account['identifier'],
            'role'       => $account['role'],
            'first_name' => $profile['first_name'] ?? '',
            'photo'      => $profile['photo_url'] ?? null,
        ];
        $_SESSION['last_activity'] = time();
    }

    }
}
