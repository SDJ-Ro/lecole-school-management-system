<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT PEOPLE CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Users Directory feature.
 * Route: `/management/people`
 * Role: Management
 */

class ManagementPeopleController {
    /**
     * Renders the Management Users Directory view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];
        
        require __DIR__ . '/../Views/management/people.php';
    }
}
