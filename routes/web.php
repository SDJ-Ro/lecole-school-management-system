<?php

declare(strict_types=1);

use App\Controllers\AcademicController;
use App\Controllers\LeavingController;
use App\Controllers\PeopleAddController;
use App\Controllers\PeopleController;
use App\Controllers\SettingsController;
use App\Controllers\AchievementController;
use App\Controllers\ApprovalController;
use App\Controllers\AuditController;
use App\Controllers\LandingController;
use App\Controllers\AuthController;
use App\Controllers\DashboardController;
use App\Controllers\NotificationController;
use App\Controllers\CalendarController;
use App\Controllers\CertificateController;
use App\Controllers\ChildProfileController;
use App\Controllers\NoticeController;
use App\Controllers\ComplaintController;
use App\Controllers\ExtracurricularController;
use App\Controllers\FeedbackController;
use App\Controllers\ProfileController;
use App\Controllers\TermMarkController;
use Core\Router;

return static function (Router $router): void
{
    $router->get('/', [LandingController::class, 'index']);
    $router->get('/landing', [LandingController::class, 'index']);

    if (feature('honours_board'))
    {
        $router->get('/landing/achievements', [LandingController::class, 'achievements']);
    }

    $router->get('/auth', [AuthController::class, 'chooser']);
    $router->post('/logout', [AuthController::class, 'logout']);

    foreach (config('app.roles') as $role)
    {
        $router->get("/auth/{$role}", [AuthController::class, 'signin', $role]);


        $router->get("/auth/{$role}/signup", [AuthController::class, 'signup', $role]);
        






        $router->get("/{$role}", [DashboardController::class, 'show', $role]);
        $router->get("/{$role}/dashboard", [DashboardController::class, 'show', $role]);
    }

    foreach (config('permissions.notifications.see') as $role)
    {
        $router->get("/{$role}/notifications/open", [NotificationController::class, 'open', $role]);
    
    }

    if (feature('calendar'))
    {
        foreach (config('permissions.calendar.create') as $role)
        {
            $router->post("/{$role}/calendar/save", [CalendarController::class, 'save', $role]);
            $router->post("/{$role}/calendar/delete", [CalendarController::class, 'delete', $role]);
        }
    }

    if (feature('notices'))
    {
        foreach (config('notices.board') as $role => $board)
        {
            $router->get($board['url'], [NoticeController::class, 'board', $role]);

            if (in_array($role, config('permissions.notices.post'), true))
            {



            }

            if (feature('approvals') && in_array($role, config('permissions.notices.approve'), true))
            {

            }
        }
    }
            
    // The "Viewing" switch picks which child the whole parent portal shows
    $router->get('/parent/child-profile', [ChildProfileController::class, 'show']);
    $router->post('/parent/child', [ChildProfileController::class, 'choose']);

    // Leaving needs the parent's approval, so these pages only exist when parent consent is on
    if (feature('parent_consent'))
    {
        $router->get('/parent/approvals', [ApprovalController::class, 'index']);
        $router->post('/parent/approvals/answer', [ApprovalController::class, 'answer']);






        foreach (config('permissions.leaving.change') as $role)
        {        

        }

        foreach (config('permissions.leaving.start') as $role)
        {        

        }
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
        $router->post('/parent/complaints/send', [ComplaintController::class, 'send']);
        $router->get('/management/complaints', [ComplaintController::class, 'management']);
        $router->post('/management/complaints/resolve', [ComplaintController::class, 'resolve']);
   
   
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
            $router->post("/{$role}/extracurricular/team", [ExtracurricularController::class, 'saveTeam', $role]);
            $router->post("/{$role}/extracurricular/assign", [ExtracurricularController::class, 'assign', $role]);
            $router->post("/{$role}/extracurricular/team-delete", [ExtracurricularController::class, 'deleteTeam', $role]);



            // A programme's achievements go with the achievements module
            if (feature('achievements'))
            {


            }
        }
        
    // Lift or lock a student's Academic Watch
    foreach (config('permissions.extracurricular.watch') as $role)
    {
            $router->post("/{$role}/extracurricular/watch", [ExtracurricularController::class, 'watch', $role]);
    }
}

    if (feature('audit_log'))
    {
        foreach (config('permissions.audit.view') as $role)
        {
            $router->get("/{$role}/audit", [AuditController::class, 'index', $role]);
        }
    }

    foreach (config('permissions.settings.edit') as $role)
    {

        $router->get("/{$role}/settings", [SettingsController::class, 'show', $role]);
    }
    
    if (feature('achievements'))
    {
        $router->get('/student/achievements', [AchievementController::class, 'student']);

        
        foreach (config('permissions.achievements.record') as $role)
        {
            $router->get("/{$role}/achievements", [AchievementController::class, 'staff', $role]);


        }

        foreach (config('permissions.achievements.answer') as $role)
        {
            $router->get("/{$role}/achievements/evidence", [AchievementController::class, 'evidence', $role]);
        
        }
    }
    
    if (feature('term_marks'))
    {
        $router->get('/student/academic', [AcademicController::class, 'student']);
        $router->get('/student/academic/print', [AcademicController::class, 'recordPrint', 'student']);
        $router->get('/parent/child-profile/print', [AcademicController::class, 'recordPrint', 'parent']);
        $router->get('/teacher/marks', [TermMarkController::class, 'index']);
        $router->post('/teacher/marks/save', [TermMarkController::class, 'save']);
        $router->post('/teacher/marks/publish', [TermMarkController::class, 'publish']);       
    
    }

    if (feature('academic'))
    {
        foreach (config('permissions.academic.edit') as $role)
        {
            $router->get("/{$role}/academic", [AcademicController::class, 'overview', $role]);
       
       
       
            $router->post("/{$role}/academic/stages/save", [AcademicController::class, 'saveStage', $role]);
            $router->post("/{$role}/academic/stages/delete", [AcademicController::class, 'deleteStage', $role]);
            $router->post("/{$role}/academic/terms/save", [AcademicController::class, 'saveTerms', $role]);
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
                $router->post("/{$role}/profile/save", [ProfileController::class, 'save', $role]);
                $router->post("/{$role}/profile/photo", [ProfileController::class, 'photo', $role]);

            }

            if (in_array($role, config('permissions.profile.password'), true))
            {
                $router->post("/{$role}/profile/password", [ProfileController::class, 'password', $role]);                
            }
        }
    }
};