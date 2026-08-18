<?php
// The one Are you sure pop-up for the whole site. It starts empty and askQuestion() in the script fills it
// The icons are written out instead of using icon(), because the script swaps which drawing they show
ob_start();
?>
<div class="c-question">
  <span class="c-question__icon" aria-hidden="true">
    <svg class="c-icon" width="26" height="26"><use id="j-question-icon" href="#icon-trash"/></svg>
  </span>
  <h2 class="c-pop-up__title c-question__title" id="j-question-title"></h2>
  <p class="c-question__text" id="j-question-text"></p>
  <div class="c-question__extra" id="j-question-extra"></div>
  <p class="c-banner c-banner--error c-question__blocked" id="j-question-blocked" role="alert" hidden><?= icon('alertCircle', 16) ?><span></span></p>
  <div class="c-question__actions">
    <button type="button" class="c-btn c-btn--outline c-question__cancel j-pop-up-close" id="j-question-cancel">Cancel</button>
    <button type="button" class="c-btn c-btn--solid c-question__confirm" id="j-question-confirm">
      <svg class="c-icon" id="j-question-button-icon" width="15" height="15" aria-hidden="true" hidden><use href=""/></svg>
      <span id="j-question-button-text"></span>
    </button>
  </div>
</div>
<?php
$popUpContent = ob_get_clean();
$popUpShape   = 'plain';
$popUpId      = 'j-question';
$popUpVariant = 'question';
require __DIR__ . '/_pop_up.php';
?>
