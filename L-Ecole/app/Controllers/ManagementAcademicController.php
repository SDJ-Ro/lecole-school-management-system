<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT ACADEMIC CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Academic Overview feature.
 * Route: `/management/academic`
 * Role: Management
 */

class ManagementAcademicController {
    /**
     * Renders the Management Academic Overview view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];
        
        require __DIR__ . '/../Views/management/academic.php';
    }
}
