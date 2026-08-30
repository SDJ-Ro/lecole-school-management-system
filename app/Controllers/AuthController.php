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

    }
}
