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

    // POST /auth/{role}/signup. Step 1 checks the details and emails a code
    public function handleSignup(string $role): never
    {
        $back       = "/auth/{$role}/signup";
        $fullName   = $this->postText('full_name');
        $identifier = $this->postText('identifier');
        $password   = $this->postPassword('password');

        $this->setFlash('full_name', $fullName);
        $this->setFlash('identifier', $identifier);

        $problems = UserModel::passwordProblems($password);

        $users   = new UserModel();
        $account = $users->findByIdentifier($identifier);
        $support = school('support_email');




        // The account is not changed until the code is verified
        $_SESSION['activation'] = [
            'account_id'    => (int) $account['id'],
            'identifier'    => $account['identifier'],
            'role'          => $role,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ];

        // A code sent less than a minute ago still works, so no new email goes out
        // That way sending the form again and again can't flood the inbox
        $justSent = (new VerificationCode())->secondsUntilResend((int) $account['id'], VerificationCode::ACTIVATE) > 0;
        $email    = $justSent ? $users->emailFor($account) : $this->emailCode($account, VerificationCode::ACTIVATE);

        $_SESSION['activation']['sent_to'] = $this->maskEmail($email)
            . ($account['role'] === 'student' ? ' (your ' . strtolower(word('parent')) . "'s email)" : '');

        $this->redirect("/auth/{$role}/signup");
    }

    // POST /auth/{role}/verify. Step 2 checks the code and activates the account
    public function handleActivate(string $role): never
    {
        $back    = "/auth/{$role}/signup";
        $pending = $_SESSION['activation'] ?? null;

        if (!$pending || $pending['role'] !== $role)
        {
            $this->redirect("/auth/{$role}/signup?restart=1");
        }

        $code   = $this->postText('code', 10);
        $result = (new VerificationCode())->check((int) $pending['account_id'], VerificationCode::ACTIVATE, $code);


        $users = new UserModel();

        unset($_SESSION['activation']);

        $account = $users->findByIdentifier($pending['identifier']);
        (new AuditLog())->record('ACCOUNT_ACTIVATED', (int) $account['id'], $account['identifier'], "{$role} portal");

        $this->startSession($account);

        $this->setFlash('notice', 'Welcome! Your account has been activated.');
        $this->redirect("/{$role}");
    }

    // POST /auth/{role}/resend
    public function resendActivation(string $role): never
    {
        $back    = "/auth/{$role}/signup";
        $pending = $_SESSION['activation'] ?? null;

        if (!$pending || $pending['role'] !== $role)
        {
            $this->redirect("/auth/{$role}/signup?restart=1");
        }

        $codes = new VerificationCode();
        $wait  = $codes->secondsUntilResend((int) $pending['account_id'], VerificationCode::ACTIVATE);


        $account = (new UserModel())->findByIdentifier($pending['identifier']);
        $this->emailCode($account, VerificationCode::ACTIVATE);

        $this->setFlash('notice', 'A fresh verification code was sent to your email.');
        $this->redirect("/auth/{$role}/signup");
    }

    // POST /auth/{role}/forgot
    // Every ID gets the same message and next step, so this never shows which IDs exist
    public function handleForgot(string $role): never
    {
        $identifier = $this->postText('identifier');
        $account    = (new UserModel())->findByIdentifier($identifier);
        $canReset   = $account !== null && $account['role'] === $role && $account['activation_status'] === 'ACTIVE';

        // At most one code a minute, so nobody can flood the inbox
        if ($canReset && (new VerificationCode())->secondsUntilResend((int) $account['id'], VerificationCode::RESET) === 0)
        {
            $this->emailCode($account, VerificationCode::RESET);
        }

        $_SESSION['forgot'] = [
            'account_id' => $canReset ? (int) $account['id'] : 0,   // Zero means no such account, so every code typed is wrong
            'identifier' => $canReset ? $account['identifier'] : $identifier,
            'role'       => $role,
        ];
        $this->setFlash('notice', "If an active account exists for {$identifier}, a 6-digit reset code was sent to its email.");
        $this->redirect("/auth/{$role}?reset=1");
    }

    // POST /auth/{role}/reset
    public function handleReset(string $role): never
    {
        $back     = "/auth/{$role}?reset=1";
        $forgot   = $_SESSION['forgot'] ?? null;
        $code     = $this->postText('code', 10);
        $password = $this->postPassword('password');

        if (!$forgot || $forgot['role'] !== $role)
        {
            $this->redirect("/auth/{$role}");
        }

        $problems = UserModel::passwordProblems($password);

        // A made-up ID can only ever get "wrong", so saying "expired" would give away a real account
        // Both get the same answer
        $result = $forgot['account_id'] === 0
            ? 'wrong'
            : (new VerificationCode())->check($forgot['account_id'], VerificationCode::RESET, $code);


        // Refused if the account was switched off after the code was sent
        $users = new UserModel();
        unset($_SESSION['forgot']);


        (new AuditLog())->record('PASSWORD_RESET', (int) $forgot['account_id'], $forgot['identifier'], "{$role} portal");
        $this->emailPasswordChanged($users->findByIdentifier($forgot['identifier']), 'with "Forgot Password?"');

        $this->setFlash('notice', 'Your password has been reset. Please sign in.');
        $this->redirect("/auth/{$role}?identifier=" . urlencode($forgot['identifier']));
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

    private function emailCode(array $account, string $purpose): ?string
    {
        $users = new UserModel();
        $email = $users->emailFor($account);

        if ($email === null)
        {
            return null;
        }

        $codes   = new VerificationCode();
        $code    = $codes->create((int) $account['id'], $purpose);
        $profile = $users->findProfile((int) $account['id']);
        $name    = $profile['first_name'] ?? $account['identifier'];

        $isReset = $purpose === VerificationCode::RESET;
        $subject = school('name') . ($isReset ? " — Password Reset Code: {$code}" : " — Account Activation Code: {$code}");
        $reason  = $isReset
            ? 'We received a request to reset your password. Use the code below to complete the reset.'
            : 'Thank you for activating your account. Enter this 6-digit verification code to complete activation.';

        Mailer::send($email, $subject, 'code', [
            'name'    => $name,
            'reason'  => $reason,
            'code'    => $code,
            'minutes' => config('app.codes.expire_minutes', 15),
        ]);

        return $email;
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

    private function maskEmail(string $email): string
    {
        [$user, $domain] = explode('@', $email, 2);
        $visible = mb_substr($user, 0, min(2, mb_strlen($user)));
        return $visible . '***@' . $domain;
    }
}
