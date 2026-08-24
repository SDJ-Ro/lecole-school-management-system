use App\Controllers\LeavingController;
use App\Controllers\PeopleAddController;
use App\Controllers\PeopleController;
use App\Controllers\SettingsController;
use App\Controllers\AchievementController;
use App\Controllers\ApprovalController;
use App\Controllers\AuditController;
use App\Controllers\LandingController;
use App\Controllers\AuthController;
use App\Controllers\CalendarController;
use App\Controllers\CertificateController;
use App\Controllers\ChildProfileController;
use App\Controllers\ComplaintController;
use App\Controllers\ExtracurricularController;
use App\Controllers\FeedbackController;
use App\Controllers\ProfileController;
use App\Controllers\TermMarkController;


    if (feature('calendar'))
    {
        foreach (config('permissions.calendar.create') as $role)
        {
        }
    }


    // The "Viewing" switch picks which child the whole parent portal shows
    $router->get('/parent/child-profile', [ChildProfileController::class, 'show']);

    // Leaving needs the parent's approval, so these pages only exist when parent consent is on
    if (feature('parent_consent'))
    {
        $router->get('/parent/approvals', [ApprovalController::class, 'index']);

        foreach (config('permissions.leaving.change') as $role)
        {        }

        foreach (config('permissions.leaving.start') as $role)
        {        }
    }
    
    if (feature('feedback'))
    {
        $router->get('/teacher/feedback', [FeedbackController::class, 'teacher']);
        $router->get('/parent/feedback', [FeedbackController::class, 'parent']);
        $router->get('/student/feedback', [FeedbackController::class, 'student']);

        foreach (config('permissions.feedback.read') as $role)
        {
        }
    }

    
    if (feature('complaints'))
    {
        $router->get('/parent/complaints', [ComplaintController::class, 'parent']);
        $router->get('/management/complaints', [ComplaintController::class, 'management']);
    }
    
    if (feature('certificates'))
    {
        $router->get('/student/certificates', [CertificateController::class, 'student']);
        $router->get('/student/certificates/pdf', [CertificateController::class, 'pdf', 'student']);
        $router->get('/parent/child-profile/certificate-pdf', [CertificateController::class, 'pdf', 'parent']);

        foreach (config('permissions.certificates.manage') as $role)
        {
            $router->get("/{$role}/character-certificate", [CertificateController::class, 'management', $role]);
            $router->get("/{$role}/character-certificate/pdf", [CertificateController::class, 'pdf', $role]);
        }
    }

    // Who may do what is checked in the controller
    if (feature('extracurricular'))
    {
        foreach (config('permissions.extracurricular.page') as $role)
        {
            $router->get("/{$role}/extracurricular", [ExtracurricularController::class, 'index', $role]);
            $router->get("/{$role}/extracurricular/member", [ExtracurricularController::class, 'member', $role]);

            // A programme's achievements go with the achievements module
            if (feature('achievements'))
            {
            }
        }
        
    // Lift or lock a student's Academic Watch
    foreach (config('permissions.extracurricular.watch') as $role)
    {
    }
}

    foreach (config('permissions.settings.edit') as $role)
    {
        $router->get("/{$role}/settings", [SettingsController::class, 'show', $role]);
    }

    
    if (feature('achievements'))
    {
        $router->get('/student/achievements', [AchievementController::class, 'student']);
        }

        foreach (config('permissions.achievements.answer') as $role)
        {
            $router->get("/{$role}/achievements/evidence", [AchievementController::class, 'evidence', $role]);
        }
    }
    
        foreach (config('permissions.achievements.record') as $role)
        {
            $router->get("/{$role}/achievements", [AchievementController::class, 'staff', $role]);

            $router->get('/teacher/marks', [TermMarkController::class, 'index']);
        }
     
        }
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

    
    if (feature('profile'))
    {
        foreach (config('app.roles') as $role)
        {
            $router->get("/{$role}/profile", [ProfileController::class, 'show', $role]);

            if (config("profile.editable.{$role}") !== [])
            {
            }

            if (in_array($role, config('permissions.profile.password'), true))
            {
            }
        }
    }