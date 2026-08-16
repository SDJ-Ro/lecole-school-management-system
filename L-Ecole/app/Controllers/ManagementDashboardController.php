<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT DASHBOARD CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Dashboard.
 * Route: `/management/dashboard`
 * Role: Management
 */

class ManagementDashboardController {
    /**
     * Renders the Management Dashboard view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];
        
        require __DIR__ . '/../Views/management/dashboard.php';
    }
}
