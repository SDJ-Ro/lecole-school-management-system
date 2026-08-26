<?php
// school-dates.js loads first because the other scripts use it
?>
  </main>
</div>

<?php require dirname(__DIR__) . '/components/_question_pop_up.php'; ?>
<?php
$feedbackMessage = $flashError ?? $flashNotice;
$feedbackType    = $flashError !== null ? 'error' : 'success';
require dirname(__DIR__) . '/components/_feedback_banner.php';
?>

<?php foreach (['school-dates', 'pop-up', 'question-pop-up', 'feedback-banner', 'unsaved-changes', 'send-once', 'session-timeout', 'sidebar', ...$scripts] as $script): ?>
  <script src="<?= e(asset("js/components/{$script}.js")) ?>"></script>
<?php endforeach; ?>
</body>
</html>
