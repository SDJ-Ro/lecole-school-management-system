<?php
/**
 * =========================================================================
 * L'ÉCOLE — PEOPLE CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Users Directory feature.
 * Route: `/admin/people`
 * Role: Admin
 */

class PeopleController {
    /**
     * Renders the Admin Users Directory view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/people.php';
    }
}
