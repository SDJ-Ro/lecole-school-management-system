<?php
// The notice board for every role, or the post form when $noticeForm is set
// The filters run in the browser because the board already holds every card
?>
<?php if ($noticeForm !== null): ?>
  <?php require __DIR__ . '/_add_notice_page.php'; ?>
<?php else: ?>
  <div class="c-notice-board" id="j-notice-board" data-tab="<?= $tabs ? 'my-notices' : ($waitingCount !== null ? 'all' : '') ?>">
    <?php
    $title        = 'Notice Board';
    $headerButton = $canPost ? ['label' => 'Post Notice', 'href' => "{$boardUrl}?post"] : null;
    require __DIR__ . '/_page_header.php';
    ?>

    <section class="l-filter-bar" aria-label="Filter notices">
      <label class="c-search l-filter-bar__search l-filter-bar__search--narrow">
        <?= icon('search', 16) ?>
        <input type="search" class="c-search__input j-notice-search" placeholder="<?= e($searchText) ?>" autocomplete="off" aria-label="Search notices">
      </label>

      <?php if ($tabs): ?>
        <div class="c-tabs" role="tablist" aria-label="Show">
          <button type="button" role="tab" class="c-tabs__tab j-notice-tab" data-tab="my-notices" aria-selected="true">For Me</button>
          <button type="button" role="tab" class="c-tabs__tab j-notice-tab" data-tab="my-posts" aria-selected="false">Posted by Me</button>
        </div>
      <?php elseif ($waitingCount !== null): ?>
        <div class="c-tabs" role="tablist" aria-label="Show">
          <button type="button" role="tab" class="c-tabs__tab j-notice-tab" data-tab="all" aria-selected="true">All Notices</button>
          <button type="button" role="tab" class="c-tabs__tab j-notice-tab" data-tab="waiting" aria-selected="false">Awaiting Approval (<?= e($waitingCount) ?>)</button>
        </div>
      <?php endif; ?>

      <div class="l-filter-bar__selects">
        <?php if ($audienceFilter !== null): ?>
          <?php // When there are tabs, the audience filter only shows on Posted by Me ?>
          <div class="j-notice-audience-filter" <?= $tabs ? 'hidden' : '' ?>>
            <?php
            $dropdownId    = 'j-notice-filter-audience';
            $dropdownLabel = 'Filter by audience';
            $options       = array_map(fn (string $who): array => ['value' => $who, 'label' => $who === 'all' ? 'All Audiences' : plural($who)], $audienceFilter);
            $selectedValue = 'all';
            require __DIR__ . '/_dropdown.php';
            ?>
          </div>
        <?php endif; ?>

        <?php
        $dropdownId    = 'j-notice-filter-category';
        $dropdownLabel = 'Filter by category';
        $options       = array_merge([['value' => 'all', 'label' => 'All Categories']], $categories);
        $selectedValue = 'all';
        require __DIR__ . '/_dropdown.php';
        ?>
      </div>
    </section>

    <div class="l-notice-grid" id="j-notice-grid">
      <?php foreach ($notices as $notice): ?>
        <?php require __DIR__ . '/_notice_card.php'; ?>
      <?php endforeach; ?>
    </div>

    <div class="c-empty-box" id="j-notice-empty" <?= $notices === [] ? '' : 'hidden' ?>>
      <p class="c-empty-box__text"><?= $notices === [] ? 'No notices yet.' : 'No notices match your search or filters.' ?></p>
      <button type="button" class="c-empty-box__action j-notice-clear">Clear Filters</button>
    </div>

    <?php if ($waitingCount !== null): ?>
      <?php // The reason box that Reject shows in the question pop-up
      $reasonBox = ['id' => 'j-notice-reject-reason', 'label' => 'Reason', 'placeholder' => 'Tell the author what to change…', 'required' => true];
      require __DIR__ . '/_reason_template.php';
      ?>
    <?php endif; ?>
  </div>
<?php endif; ?>
<?php unset($boardUrl, $subtitle, $searchText, $notices, $noticeForm, $canPost, $tabs, $waitingCount, $audienceFilter, $categories); ?>
