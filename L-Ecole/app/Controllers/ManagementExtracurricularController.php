<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT EXTRACURRICULAR CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Extracurricular feature.
 * Route: `/management/extracurricular`
 * Role: Management
 */

class ManagementExtracurricularController {
    /**
     * Renders the Management Extracurricular view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];

        require __DIR__ . '/../Views/management/extracurricular.php';
    }
}
