<?php

declare(strict_types=1);

namespace Core;

use finfo;

// The file type is read from the file's content, and every saved file gets a random name.
// SVG is never allowed, because it can hold scripts.
// Photos are saved in public, while evidence files are kept private outside public.
final class Upload
{
    private const ENDINGS = [
        'application/pdf' => 'pdf',
        'image/png'       => 'png',
        'image/jpeg'      => 'jpg',
        'image/webp'      => 'webp',
    ];

    // Returns the saved file's address, or an error message
    public static function image(array $file, string $folder, string $kind): array
    {
        [$name, $problem] = self::save($file, $kind, dirname(__DIR__) . "/public/uploads/{$folder}", 'photo', 'image');

        return [$name === null ? null : "/uploads/{$folder}/{$name}", $problem];
    }

    // Returns the saved file's name, or an error message
    public static function evidence(array $file): array
    {
        return self::save($file, 'evidence', self::evidenceFolder(), 'file', 'file');
    }

    // Returns null for a bad name or a missing file
    public static function evidenceFile(?string $name): ?string
    {
        $path = self::evidenceFolder() . "/{$name}";

        return $name !== null && preg_match('/^[a-f0-9]{24}\.(pdf|png|jpg|webp)$/', $name) === 1 && is_file($path) ? $path : null;
    }

    // Call only after checking who is asking
    public static function send(string $path, string $name): never
    {
        header('Content-Type: ' . (new finfo(FILEINFO_MIME_TYPE))->file($path));
        header('Content-Length: ' . filesize($path));
        header('Content-Disposition: inline; filename="' . str_replace(['"', '\\'], '', basename($name)) . '"');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: private, no-store');
        readfile($path);
        exit;
    }

    // Splits a multiple file input into one entry per file and skips the empty ones
    public static function each(array $files): array
    {
        if (!is_array($files['name'] ?? null) || !is_array($files['error'] ?? null))
        {
            return [];
        }

        $each = [];

        foreach (array_keys($files['name']) as $i)
        {
            $file = array_map(fn ($values) => is_array($values) ? ($values[$i] ?? null) : null, $files);

            if (is_int($file['error']) && is_string($file['tmp_name']) && $file['error'] !== UPLOAD_ERR_NO_FILE)
            {
                $each[] = $file;
            }
        }

        return $each;
    }

    // Only deletes uploaded files, never anything outside the upload and evidence folders
    public static function forget(?string $file): void
    {
        $path = $file !== null && str_starts_with($file, '/uploads/') && !str_contains($file, '..')
            ? dirname(__DIR__) . '/public' . $file
            : self::evidenceFile($file);

        if ($path !== null && is_file($path))
        {
            unlink($path);
        }
    }

    // Returns the new file name, or an error message. Both are null when no file was chosen.
    private static function save(array $file, string $kind, string $directory, string $what, string $noun): array
    {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE)
        {
            return [null, null];
        }

        $allowed = config("uploads.{$kind}.types");
        $types   = array_intersect_key(self::ENDINGS, $allowed);   // Only types we know how to store
        $maxKb   = (int) config("uploads.{$kind}.kb");

        // The message gives the smaller of our size limit and PHP's
        if (in_array($file['error'], [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true) || ($file['error'] === UPLOAD_ERR_OK && $file['size'] > $maxKb * 1024))
        {
            return [null, "The {$what} must be " . round(min($maxKb * 1024, ini_bytes('upload_max_filesize')) / 1024 ** 2, 1) . ' MB or smaller.'];
        }

        if ($file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name']))
        {
            return [null, 'The file could not be uploaded. Please try again.'];
        }

        // Read from the content, so a renamed .php file is caught
        $type = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);

        if (!isset($types[$type]) || (str_starts_with($type, 'image/') && getimagesize($file['tmp_name']) === false))
        {
            return [null, 'Please choose a ' . word_list($allowed) . " {$noun}."];
        }

        if (!is_dir($directory))
        {
            mkdir($directory, 0755, true);
        }

        $name = bin2hex(random_bytes(12)) . '.' . $types[$type];   // A random name nobody can guess

        if (!move_uploaded_file($file['tmp_name'], "{$directory}/{$name}"))
        {
            return [null, "The {$what} could not be saved. Please try again."];
        }

        return [$name, null];
    }

    private static function evidenceFolder(): string
    {
        return dirname(__DIR__) . '/storage/uploads/evidence';
    }
}
