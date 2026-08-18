use App\Controllers\LeavingController;
use App\Controllers\PeopleAddController;
use App\Controllers\PeopleController;
use App\Controllers\SettingsController;

        foreach (config('permissions.leaving.change') as $role)
        {        }

        foreach (config('permissions.leaving.start') as $role)
        {        }
    }
    
    foreach (config('permissions.settings.edit') as $role)
    {
        $router->get("/{$role}/settings", [SettingsController::class, 'show', $role]);
    }

    if (feature('people'))
    {
        foreach (config('permissions.people.directory') as $role)
        {
            $router->get("/{$role}/people", [PeopleController::class, 'index', $role]);
            $router->get("/{$role}/people/profile", [PeopleController::class, 'profile', $role]);
            $router->get("/{$role}/people/handover", [PeopleController::class, 'handoverForm', $role]);
            $router->get("/{$role}/people/add", [PeopleAddController::class, 'form', $role]);
            $router->get("/{$role}/people/parents", [PeopleAddController::class, 'parents', $role]);
        }
        foreach (config('permissions.people.own_students') as $role)
        {
            $router->get("/{$role}/students", [PeopleController::class, 'students', $role]);
            $router->get("/{$role}/students/profile", [PeopleController::class, 'studentProfile', $role]);
        }
    }