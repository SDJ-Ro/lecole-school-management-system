<?php

declare(strict_types=1);

namespace App\Models;

use Core\Model;

class VerificationCode extends Model
{
    public const ACTIVATE = 'activate';
    public const RESET    = 'reset';

    // Only the hash is stored, and the plain code is returned to be emailed
    // A new code replaces any older one
    public function create(int $accountId, string $purpose): string
    {
        $code = (string) random_int(100000, 999999);

        $this->db->prepare('DELETE FROM verification_codes WHERE account_id = :account AND purpose = :purpose')
            ->execute(['account' => $accountId, 'purpose' => $purpose]);

        $this->db->prepare(
            'INSERT INTO verification_codes (account_id, purpose, code_hash, attempts_left, expires_at)
             VALUES (:account, :purpose, :hash, :attempts, NOW() + INTERVAL :minutes MINUTE)'
        )->execute([
            'account'  => $accountId,
            'purpose'  => $purpose,
            'hash'     => password_hash($code, PASSWORD_DEFAULT),
            'attempts' => config('app.codes.max_attempts'),
            'minutes'  => config('app.codes.expire_minutes'),
        ]);

        return $code;
    }

    // A right code is used up, and a wrong one costs a try
    // An expired result also covers having no tries left
    public function check(int $accountId, string $purpose, string $typed): string
    {
        $statement = $this->db->prepare(
            'SELECT id, code_hash, attempts_left FROM verification_codes
             WHERE account_id = :account AND purpose = :purpose AND used_at IS NULL AND expires_at > NOW()
             ORDER BY id DESC
             LIMIT 1'
        );
        $statement->execute(['account' => $accountId, 'purpose' => $purpose]);
        $row = $statement->fetch();

        if ($row === false || $row['attempts_left'] <= 0) 
        {
            return 'expired';
        }

        if (!password_verify(trim($typed), $row['code_hash'])) 
        {
            $this->db->prepare('UPDATE verification_codes SET attempts_left = attempts_left - 1 WHERE id = :id')
                ->execute(['id' => $row['id']]);

            return 'wrong';
        }

        $this->db->prepare('UPDATE verification_codes SET used_at = NOW() WHERE id = :id')
            ->execute(['id' => $row['id']]);

        return 'ok';
    }

    }
}
