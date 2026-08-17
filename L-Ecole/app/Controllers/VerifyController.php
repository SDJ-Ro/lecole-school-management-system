<?php
/**
 * =========================================================================
 * L'ÉCOLE — VERIFY CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Approvals & Verifications feature.
 * Route: `/admin/verify`
 * Role: Admin
 */

class VerifyController {
    /**
     * Renders the Admin Approvals & Verifications view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/verify.php';
    }
}
