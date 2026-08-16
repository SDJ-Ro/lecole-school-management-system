<?php
/**
 * =========================================================================
 * L'ÉCOLE — EXTRACURRICULAR CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Extracurricular feature.
 * Route: `/admin/extracurricular`
 * Role: Admin
 */

class ExtracurricularController {
    /**
     * Renders the Admin Extracurricular view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/extracurricular.php';
    }
}
