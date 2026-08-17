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

    }
}
