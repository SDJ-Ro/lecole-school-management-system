<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT COMPLAINTS CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Complaints & Inquiries.
 * Route: `/management/complaints`
 * Role: Management
 */

class ManagementComplaintsController {
    /**
     * Renders the Management Complaints Overview view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $rolesConfig['management'] ?? [];

        require __DIR__ . '/../Views/management/complaints.php';
    }
}
