<?php

declare(strict_types=1);

namespace App\Services;

// An achievement at certain levels goes on the honours board by itself, whoever records it.
// When a teacher changes the level, the achievement moves on or off the board with it.
// Management may also tick or untick it by hand.
final class HonoursBoard
{
    public static function mayPick(): bool
    {
        return feature('honours_board') && can('achievements.honours');
    }

    // Returns null to leave the board as it is.
    // $oldLevel is null for a new achievement. $ticked only counts for management.
    public static function value(?string $oldLevel, string $level, string $ticked): ?int
    {
        if (!feature('honours_board'))
        {
            return null;
        }

        $auto = in_array($level, rule('honours_board.auto_levels'), true);

        if (self::mayPick())
        {
            return (int) ($ticked === '1' || ($oldLevel === null && $auto));   // A new one at those levels always starts on the board
        }

        return $oldLevel === $level ? null : (int) $auto;   // For a teacher, only a changed level moves it
    }
}
