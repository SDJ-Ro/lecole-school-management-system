<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\AuditLog;
use Core\Controller;

// The Audit Log can only be read, never changed
// The filters search the whole log, not only the current page
class AuditController extends Controller
{
    // GET /{role}/audit
    public function index(string $role): void
    {
        $user  = $this->requireRole($role);
        $log   = new AuditLog();
        $names = [];

        foreach ($log->actions() as $code)
        {
            $names[$code] = config("audit.names.{$code}") ?? ucwords(strtolower(str_replace('_', ' ', $code)));
        }

        // Unknown values fall back to "all"
        $filters = [
            'action' => array_key_exists($this->queryText('action'), $names) ? $this->queryText('action') : '',
            'role'   => array_key_exists($this->queryText('role'), config('audit.tones')) ? $this->queryText('role') : '',
            'q'      => $this->queryText('q'),
        ];

        $perPage        = (int) config('audit.per_page');
        $page           = max(1, (int) $this->queryText('page'));
        [$logs, $total] = $log->recent($filters, $page, $perPage);
        $pages          = max(1, (int) ceil($total / $perPage));
        $pageLink       = fn (int $to): string => "/{$role}/audit?" . http_build_query(array_filter($filters) + ['page' => $to]);   // Page links keep the filters

        if ($page > $pages)   // An old link or a typed page number past the end
        {
            $this->redirect($pageLink($pages));
        }

        $this->page("{$role}/audit", $user, [
            'logs'        => $logs,
            'page'        => $page,
            'pages'       => $pages,
            'pageLink'    => $pageLink,
            'filters'     => $filters,
            'actionNames' => $names,
        ]);
    }
}
