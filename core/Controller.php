<?php

declare(strict_types=1);

namespace Core;

use App\Models\AuditLog;
use App\Models\PeopleModel;
use App\Models\UserModel;
use App\Services\AccountClosing;
use App\Services\YearEnd;
use RuntimeException;

abstract class Controller
{
    private ?array $children = null;

    protected function log(array $user, string $action, string $details): void
    {
        (new AuditLog())->record($action, $user['id'], $user['identifier'], $details);
    }
    
    protected function getUser(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    protected function requireRole(string $role): array
    {
        $user = $this->getUser();


        // Close accounts of leaving students whose last day has passed
        AccountClosing::closeDue();



        $timeout = $this->sessionTimeout($role);


        $_SESSION['last_activity'] = time();

        // Starts a new school year first, so the page reads the right classes
        YearEnd::runIfDue();

        if ($role === 'parent')
        {
            $children = $this->children($user);

            if (!isset($children[$_SESSION['user']['child'] ?? 0]))
            {
                $_SESSION['user']['child'] = array_key_first($children);   // Stays empty if the parent has no child linked yet
            }

            $user['child'] = $_SESSION['user']['child'];
        }


        return $user;
    }

    // The parent's children, as account id and first name
    protected function children(array $user): array
    {
        return $this->children ??= (new PeopleModel())->childrenOf($user['id']);
    }

    // Empties the session instead of destroying it, so a flash message can still be set after
    protected function endSession(): void
    {
        $_SESSION = [];
        session_regenerate_id(true);
    }

    protected function getCsrfToken(): string
    {
        if (empty($_SESSION['_csrf_token']))
        {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['_csrf_token'];
    }

    protected function csrfField(): string
    {
        return '<input type="hidden" name="_csrf_token" value="' . e($this->getCsrfToken()) . '">';
    }

    // The Router runs this on every POST
    public function checkCsrf(): void
    {
        $expected = $_SESSION['_csrf_token'] ?? '';


    }

    // A list such as field[]=x becomes an empty string
    protected function postText(string $key, int $max = 255): string
    {
        $value = $_POST[$key] ?? '';

        return is_string($value) ? trim(mb_substr($value, 0, $max)) : '';
    }

    protected function queryText(string $key, int $max = 100): string
    {
        $value = $_GET[$key] ?? '';

        return is_string($value) ? trim(mb_substr($value, 0, $max)) : '';
    }

    // Not trimmed, because spaces are part of a password
    protected function postPassword(string $key): string
    {
        $value = $_POST[$key] ?? '';

        return is_string($value) ? mb_substr($value, 0, 255) : '';
    }

    }
}
