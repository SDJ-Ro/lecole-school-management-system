<?php
// app/Controllers/DashboardController.php
// Controller for the Admin Dashboard feature in L'École MVC.

class DashboardController
{
    /**
     * Renders the Admin Dashboard view with role configuration.
     */
    public function index()
    {
        // 1. Stub role authorization (Admin)
        $roleSlug = 'admin';
        $currentRoute = '/admin/dashboard';

        // 2. Load role configuration array
        $allRoles = require __DIR__ . '/../../config/roles.php';
        $roleConfig = $allRoles[$roleSlug] ?? [];

        // 3. Render view template
        require __DIR__ . '/../Views/admin/dashboard.php';
    }
}
