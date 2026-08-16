<?php
// app/Core/WebRouter.php

class WebRouter 
{
    // This array will hold all the valid URLs for our website
    private $routes = [];

    /**
     * Adds a new URL rule to our system
     */
    public function add($url, $callback) 
    {
        $this->routes[$url] = $callback;
    }

    /**
     * Reads the browser URL and sends the user to the right place
     */
    public function dispatch($url) 
    {
        // Check if the URL the user typed exists in our list
        if (array_key_exists($url, $this->routes)) {
            // It exists! Run the code for that page.
            call_user_func($this->routes[$url]);
        } else {
            // It doesn't exist. Show a 404 Error instead of crashing.
            http_response_code(404);
            echo "<div style='font-family: sans-serif; text-align: center; padding: 50px;'>";
            echo "<h1>404 - Page Not Found</h1>";
            echo "<p>Oops! L'École doesn't have a page at: <b>" . htmlspecialchars($url) . "</b></p>";
            echo "<a href='/'>Go back Home</a>";
            echo "</div>";
        }
    }
}
