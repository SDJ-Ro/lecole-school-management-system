<?php
/**
 * =========================================================================
 * L'ÉCOLE — NOTICE CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Admin Notice Board feature.
 * Route: `/admin/notice`
 * Role: Admin
 */

class NoticeController {
    /**
     * Renders the Admin Notice Board view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['admin'] ?? [];
        
        require __DIR__ . '/../Views/admin/notice.php';
    }
}
