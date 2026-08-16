<?php
// public/index.php
// This is the SINGLE entry point for the entire L'Ecole application.

ini_set('display_errors', 1);
error_reporting(E_ALL);

// 1. Load the core routing engine
require_once __DIR__ . '/../backend/Core/WebRouter.php';

// 2. Start the router
$router = new WebRouter();

// 3. Define the web addresses (Routes)
$router->add('/', function() {
    echo "<h1>L'École System</h1><p>The WebRouter is successfully directing traffic.</p>";
});

$router->add('/login', function() {
    // This will eventually load: frontend/Views/auth/login_screen.php
    echo "<h1>Login Screen</h1>";
});

// 4. Read the URL and send the user to the right place
$currentUrl = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$router->dispatch($currentUrl);
