<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

class UserModel extends Model
{
    // Also returns the minutes left on a lock and the minutes since the last wrong password
    public function findByIdentifier(string $identifier): ?array
    {
        $statement = $this->db->prepare(
            'SELECT *, COALESCE(CEIL(TIMESTAMPDIFF(SECOND, NOW(), lock_expires_at) / 60), 0) AS minutes_locked,
                    TIMESTAMPDIFF(MINUTE, last_failed_at, NOW()) AS minutes_since_failed
             FROM user_accounts
             WHERE identifier = :identifier
             LIMIT 1'
        );
        $statement->execute(['identifier' => $this->normalise($identifier)]);

        return $statement->fetch() ?: null;
    }

    public function recordSuccessfulLogin(int $accountId): void
    {
        $statement = $this->db->prepare(
            'UPDATE user_accounts
             SET failed_login_count = 0, lock_expires_at = NULL, last_login_at = NOW()
             WHERE id = :id'
        );
        $statement->execute(['id' => $accountId]);
    }

    public function findProfile(int $accountId): ?array
    {
        $statement = $this->db->prepare(
            'SELECT first_name, last_name, full_name, personal_email, photo_url FROM profiles WHERE account_id = :id'
        );
        $statement->execute(['id' => $accountId]);

        return $statement->fetch() ?: null;
    }

    // A student's mail goes to their primary parent
    // Anyone else's goes to their personal email, or else their sign-in email
    public function emailFor(array $account): ?string
    {
        if ($account['role'] === 'student')
        {
            $statement = $this->db->prepare(
                'SELECT COALESCE(profile.personal_email, parent.identifier)
                 FROM student_parents AS link
                 JOIN user_accounts AS parent ON parent.id = link.parent_account_id
                 LEFT JOIN profiles AS profile ON profile.account_id = parent.id
                 WHERE link.student_account_id = :id
                 ORDER BY link.is_primary DESC
                 LIMIT 1'
            );
            $statement->execute(['id' => $account['id']]);

            return $statement->fetchColumn() ?: null;
        }

        $profile = $this->findProfile((int) $account['id']);

        return $profile['personal_email'] ?? (filter_var($account['identifier'], FILTER_VALIDATE_EMAIL) ?: null);
    }

    // Only these names reach the SQL
    private const PROFILE_COLUMNS = ['first_name', 'last_name', 'date_of_birth', 'gender', 'national_id', 'personal_email',
                                     'phone', 'address', 'emergency_name', 'emergency_phone'];

    // A loosely typed student code is turned into the stored format
    // Emails become lower case
    private function normalise(string $identifier): string
    {
        $identifier = trim($identifier);
        $prefix     = strtok(config('white_label.academic.id_formats.student'), '-');

        if (preg_match('/^' . preg_quote($prefix, '/') . '-?(\d{4})-?(\d+)$/i', $identifier, $match))
        {
            return sprintf('%s-%s-%04d', $prefix, $match[1], (int) $match[2]);
        }

        return strtolower($identifier);
    }
}
