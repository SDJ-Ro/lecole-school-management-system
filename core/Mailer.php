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
    private static function sendSmtp(string $to, string $subject, string $html): void
    {
        $cfg = config('mail.smtp');

        $socket = fsockopen($cfg['host'], $cfg['port'], $errno, $errstr, 15);

        if (!$socket)
        {
            throw new RuntimeException("Could not connect to SMTP server: {$errstr} ({$errno})");
        }

        // A reply can have several lines. The last one has a space after its code.
        $read = function () use ($socket): string
        {
            $data = '';

            while ($line = fgets($socket, 512))
            {
                $data .= $line;

                if (isset($line[3]) && $line[3] === ' ')
                {
                    break;
                }
            }

            return $data;
        };

        $command = function (string $cmd, int $expectedCode) use ($socket, $read): void
        {
            fwrite($socket, $cmd . "\r\n");
            $response = $read();

            if ((int) substr($response, 0, 3) !== $expectedCode)
            {
                throw new RuntimeException("SMTP error [{$cmd}]: {$response}");
            }
        };

        $read();
        $command('EHLO ' . gethostname(), 250);
        $command('STARTTLS', 220);

        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
        $command('EHLO ' . gethostname(), 250);
        $command('AUTH LOGIN', 334);
        $command(base64_encode($cfg['username']), 334);
        $command(base64_encode($cfg['password']), 235);
        $command('MAIL FROM:<' . config('mail.from_address') . '>', 250);
        $command("RCPT TO:<{$to}>", 250);
        $command('DATA', 354);

        $from    = sprintf('"%s" <%s>', addcslashes(config('mail.from_name'), '"'), config('mail.from_address'));
        $headers = [
            "From: {$from}",
            "To: <{$to}>",
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            'Date: ' . date('r'),
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        // A line that starts with "." gets a second one, because a lone "." ends the message
        $body = preg_replace('/^\./m', '..', preg_replace('/\r?\n/', "\r\n", $html));
        fwrite($socket, implode("\r\n", $headers) . "\r\n\r\n" . $body . "\r\n.\r\n");
        $accepted = $read();

        if ((int) substr($accepted, 0, 3) !== 250)
        {
            throw new RuntimeException("SMTP error [message]: {$accepted}");
        }

        $command('QUIT', 221);
        fclose($socket);
    }
}
