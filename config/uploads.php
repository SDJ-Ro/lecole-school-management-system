<?php

declare(strict_types=1);

// Each upload lists its file types and its size limit in KB.
// A new type must also be added to Upload::ENDINGS. Never allow SVG.
$images = ['image/png' => 'PNG', 'image/jpeg' => 'JPG', 'image/webp' => 'WebP'];

return [
    'photo'    => ['types' => $images, 'kb' => 1024],
    'logo'     => ['types' => $images, 'kb' => 1024],
    'cover'    => ['types' => $images, 'kb' => 5120],    // Covers and gallery photos
    'evidence' => ['types' => ['application/pdf' => 'PDF'] + $images, 'kb' => 10240],   // Kept private
];
