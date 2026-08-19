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
    
    protected function view(string $viewName, array $data = []): void
    {
        $viewPath = dirname(__DIR__) . '/app/Views/' . $viewName . '.php';

        
        extract($data, EXTR_SKIP);
        require $viewPath;
    }

    // Shows a signed-in page with what its sidebar and top bar need
    protected function page(string $viewName, array $user, array $data = []): void
    {
        // Stops the Back button showing the page again after sign out
        header('Cache-Control: no-store');

        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

        $this->view($viewName, $data + [
            'currentRole' => $user['role'],
            'currentPath' => $path === "/{$user['role']}" ? "/{$user['role']}/dashboard" : $path,   // The role's home page is its dashboard
            'userName'    => $user['first_name'] ?? '',
            'userPhoto'   => $user['photo'] ?? null,
            'csrfField'   => $this->csrfField(),
            'sessionTimeout' => $this->sessionTimeout($user['role']),
            'children'    => $user['role'] === 'parent' ? $this->children($user) : [],
            'chosenChild' => $user['child'] ?? null,
            'closingBanner' => AccountClosing::banner($user),
            // Read from a cookie, so a collapsed sidebar doesn't jump open while the page loads
            'sidebarCollapsed' => ($_COOKIE["sidebar_{$user['role']}"] ?? '') === 'collapsed',
            // Forms that show their own errors read the error first, so it never shows twice
            'flashNotice' => $this->getFlash('notice'),
            'flashError'  => $this->getFlash('error'),
        ]);
    }

    protected function redirect(string $url): never
    {
        header('Location: ' . $url);
        exit;
    }

    protected function setFlash(string $key, mixed $message): void
    {
        $_SESSION['flash'][$key] = $message;
    }

    protected function getFlash(string $key): mixed
    {
        $message = $_SESSION['flash'][$key] ?? null;
        unset($_SESSION['flash'][$key]);
        return $message;
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

    // A background request gets JSON. A normal one goes back with a flash message.
    protected function refuse(string $message, string $url, int $statusCode, string $flash = 'error'): never
    {
        
        $this->setFlash($flash, $message);
        $this->redirect($url);
    }

    protected function wantsJson(): bool
    {
        return str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
    }

    // Only the path and query, so it never sends the user to another site
    protected function previousPage(): string
    {
        $from = parse_url($_SERVER['HTTP_REFERER'] ?? '/');
        $path = $from['path'] ?? '/';

        // Browsers read "//x" and "/\x" as another site
        if (!str_starts_with($path, '/') || in_array($path[1] ?? '', ['/', '\\'], true))
        {
            return '/';
        }

        return $path . (isset($from['query']) ? "?{$from['query']}" : '');
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

    protected function sendJson(array $data, int $statusCode = 200): never
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data);
        exit;

    }
}
