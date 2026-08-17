<?php
/**
 * =========================================================================
 * L'ÉCOLE — AUDIT CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Audit Logs feature.
 * Route: `/admin/audit`
 * Role: Admin
 */

class AuditController {
    /**
     * Renders the Admin Audit Logs view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/audit.php';
    }
}
