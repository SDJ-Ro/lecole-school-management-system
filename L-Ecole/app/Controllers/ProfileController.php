<?php
/**
 * =========================================================================
 * L'ÉCOLE — PROFILE CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Profile & Settings feature.
 * Route: `/admin/profile`
 * Role: Admin
 */

class ProfileController {
    /**
     * Renders the Admin Profile & Settings view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/profile.php';
    }
}
