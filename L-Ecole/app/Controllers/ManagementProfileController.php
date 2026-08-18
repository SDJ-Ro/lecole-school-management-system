<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT PROFILE & SETTINGS CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Profile & Settings.
 * Route: `/management/profile`
 * Role: Management
 */

class ManagementProfileController {
    /**
     * Renders the Management Profile view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];

        require __DIR__ . '/../Views/management/profile.php';
    }
}
