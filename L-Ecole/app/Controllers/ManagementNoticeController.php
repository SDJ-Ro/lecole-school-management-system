<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT NOTICE CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Notice Board feature.
 * Route: `/management/notice`
 * Role: Management
 */

class ManagementNoticeController {
    /**
     * Renders the Management Notice Board view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];

        require __DIR__ . '/../Views/management/notice.php';
    }
}
