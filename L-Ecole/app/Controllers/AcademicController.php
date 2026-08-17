<?php
/**
 * =========================================================================
 * L'ÉCOLE — ACADEMIC CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Academic Overview feature.
 * Route: `/admin/academic`
 * Role: Admin
 */

class AcademicController {
    /**
     * Renders the Admin Academic Overview view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/academic.php';
    }
}
