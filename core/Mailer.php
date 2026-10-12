<?php

declare(strict_types=1);

namespace Core;

use RuntimeException;
use Throwable;

final class Mailer
{
    // Returns false if the email fails, so a mail problem never stops the page
    public static function send(string $to, string $subject, string $view, array $data = []): bool
    {
        $to = config('mail.redirect_to') ?: $to;

        if (!filter_var($to, FILTER_VALIDATE_EMAIL))
        {
            error_log("Email not sent: invalid address '{$to}'");
            return false;
        }

        try
        {
            $html = self::render($view, $data + ['subject' => $subject]);

            config('mail.driver') === 'smtp'
                ? self::sendSmtp($to, $subject, $html)
                : self::writeLog($to, $subject, $html);

            return true;
        }
        catch (Throwable $error)
        {
            error_log('Email failed: ' . $error->getMessage());
            return false;
        }
    }

    private static function render(string $view, array $data): string
    {
        extract($data, EXTR_SKIP);

        ob_start();
        require dirname(__DIR__) . "/app/Views/emails/{$view}.php";
        $content = ob_get_clean();

        ob_start();
        require dirname(__DIR__) . '/app/Views/emails/layout.php';
        return ob_get_clean();
    }

    private static function writeLog(string $to, string $subject, string $html): void
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8');
        $text = trim(preg_replace('/\s*\n\s*/', "\n", $text));

        $dir = dirname(config('mail.log_file'));

        if (!is_dir($dir))
        {
            mkdir($dir, 0755, true);
        }

        $entry = sprintf(
            "[%s] TO: %s | SUBJECT: %s\n%s\n%s\n\n",
            date('Y-m-d H:i:s'),
            $to,
            $subject,
            str_repeat('-', 60),
            $text
        );

        file_put_contents(config('mail.log_file'), $entry, FILE_APPEND);
    }

    // Sends over STARTTLS, which uses port 587
