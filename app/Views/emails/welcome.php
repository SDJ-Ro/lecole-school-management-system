<?php
// Needs $name, $intro and $accounts
// Each account has a title, fullName, identifier and url
// The box shows the full name and sign-in ID, never the password
?>
<p style="margin: 0 0 16px;">Hi<?= $name !== '' ? ' <strong>' . e($name) . '</strong>' : '' ?>,</p>

<p style="margin: 0 0 20px; color: rgba(15,65,74,0.85);"><?= e($intro) ?></p>

<?php foreach ($accounts as $account): ?>
    <div class="code-box" style="text-align: left;">
        <span class="code-label"><?= e($account['title']) ?> — enter these on the sign-up page</span>
        <p style="margin: 10px 0 4px;">Full Name: <strong><?= e($account['fullName']) ?></strong></p>
        <p style="margin: 0 0 12px;">Sign-in ID: <strong><?= e($account['identifier']) ?></strong></p>
        <a class="btn-primary" style="margin: 0;" href="<?= e($account['url']) ?>">Set Up This Account</a>
    </div>
<?php endforeach; ?>

<p style="margin: 0;">Type each name exactly as it is written above. Then choose a password; we will email a 6-digit code to confirm it is you.</p>
