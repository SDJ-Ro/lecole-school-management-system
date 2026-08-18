<?php

// Runs the new files in migrations/ in number order. Run it with php database/migrate.php
// Never edit a migration that has already run. Add a new numbered file instead.

declare(strict_types=1);

require dirname(__DIR__) . '/core/bootstrap.php';

$db = Core\Database::getConnection();

$db->exec('CREATE TABLE IF NOT EXISTS migrations (name VARCHAR(191) PRIMARY KEY, ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)');

$alreadyRan = $db->query('SELECT name FROM migrations')->fetchAll(PDO::FETCH_COLUMN);
$files      = glob(__DIR__ . '/migrations/*.sql');
$ranNow     = 0;

sort($files);

foreach ($files as $file)
{
    $name = basename($file);

    if (in_array($name, $alreadyRan, true))
    {
        continue;
    }

    $db->exec(file_get_contents($file));
    $db->prepare('INSERT INTO migrations (name) VALUES (:name)')->execute(['name' => $name]);

    echo "Ran {$name}\n";
    $ranNow++;
}

echo $ranNow === 0 ? "Database is already up to date.\n" : "Done: {$ranNow} migration(s) run.\n";
