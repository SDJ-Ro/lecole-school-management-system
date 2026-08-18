<?php
/**
 * =========================================================================
 * L'ÉCOLE — MANAGEMENT CHARACTER CERTIFICATE CONTROLLER
 * =========================================================================
 * Responsibility: Handles requests for the Management Character Certificate
 *                 feature.
 * Route: `/management/certificate`
 * Role: Management
 *
 * Note: The Certificate feature is 100% JS-rendered. The controller's sole
 * responsibility is to load the roles configuration and delegate rendering
 * to the view, which provides the MVC shell and the JS mount point.
 */

class ManagementCertificateController {
    /**
     * Renders the Management Character Certificate view.
     */
    public function index(): void {
        $rolesConfig = require __DIR__ . '/../../config/roles.php';
        $roleConfig  = $rolesConfig['management'] ?? [];

        require __DIR__ . '/../Views/management/certificate.php';
    }
}
