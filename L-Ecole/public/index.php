<?php
// public/index.php
// This is the SINGLE entry point for the entire L'Ecole application.

ini_set('display_errors', 1);
error_reporting(E_ALL);

// 1. Load the core routing engine & Controllers
require_once __DIR__ . '/../app/Core/WebRouter.php';
require_once __DIR__ . '/../app/Controllers/DashboardController.php';
require_once __DIR__ . '/../app/Controllers/ManagementDashboardController.php';
require_once __DIR__ . '/../app/Controllers/PeopleController.php';
require_once __DIR__ . '/../app/Controllers/ExtracurricularController.php';
require_once __DIR__ . '/../app/Controllers/NoticeController.php';
require_once __DIR__ . '/../app/Controllers/VerifyController.php';
require_once __DIR__ . '/../app/Controllers/AcademicController.php';

// 2. Start the router
$router = new WebRouter();

// 3. Define the web addresses (Routes)
$router->add('/', function() {
    header('Location: /admin/dashboard');
    exit;
});

$router->add('/admin/dashboard', function() {
    $controller = new DashboardController();
    $controller->index();
});

$router->add('/admin/people', function() {
    $controller = new PeopleController();
    $controller->index();
});

$router->add('/admin/extracurricular', function() {
    $controller = new ExtracurricularController();
    $controller->index();
});

$router->add('/admin/academic', function() {
    $controller = new AcademicController();
    $controller->index();
});

$router->add('/admin/notice', function() {
    $controller = new NoticeController();
    $controller->index();
});

$router->add('/admin/verify', function() {
    $controller = new VerifyController();
    $controller->index();
});

$router->add('/management/dashboard', function() {
    $controller = new ManagementDashboardController();
    $controller->index();
});

$router->add('/login', function() {
    echo "<h1>Login Screen</h1>";
});

// 4. Read the URL and send the user to the right place
$currentUrl = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$router->dispatch($currentUrl);
