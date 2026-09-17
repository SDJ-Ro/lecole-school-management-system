<?php
$tabTitle = 'Character Certificates';
$styles   = ['page-header', 'search-field', 'tabs', 'panel', 'tag', 'empty-box', 'form-field', 'certificate-card', 'certificate-sheet', 'certificates'];
$scripts  = ['certificate-sheet'];
$grids    = ['filter-bar', 'certificates'];

if (!empty($reviews))   // Needed by the Review Issue pop-ups
{
    $styles  = [...$styles, 'dropdown', 'datepicker', 'record-achievement', 'evidence-preview'];
    $scripts = [...$scripts, 'dropdown', 'datepicker'];
}

require dirname(__DIR__) . '/layouts/page_top.php';

$title    = 'Character Certificates';
$subtitle = words('Review, refine, and issue official character certificates for {students} who are leaving or graduating.');
require dirname(__DIR__) . '/components/_page_header.php';
$listUrl = "/{$role}/character-certificate";
?>
<?php if ($certificate === null): ?>
  <?php
  // Link to this list with one filter changed. Empty filters are left out.
  $certificatesLink = fn (array $change): string => $listUrl . '?' . http_build_query(array_filter($change + $filters));
  $statusNames      = config('certificates.statuses');
  ?>
  <div class="l-certificates">
    <?php if ($closingWaiting > 0): ?>
      <p class="c-banner c-banner--warning c-closing-banner"><?= icon('alertTriangle', 16) ?>
        <span class="c-closing-banner__text"><?= e("{$closingWaiting} leaving with things waiting: finish them before their accounts close.") ?></span>
      </p>
    <?php endif; ?>
    <div class="l-filter-bar">
      <form class="l-filter-bar__search" method="get" action="<?= e($listUrl) ?>" role="search">
        <label class="c-search">
          <?= icon('search', 16) ?>
          <input type="search" class="c-search__input" name="q" value="<?= e($filters['q']) ?>" placeholder="Search name, ID, or class…" aria-label="Search certificates">
        </label>
        <?php foreach (['status', 'pathway'] as $certificatesFilter): ?>
          <?php if ($filters[$certificatesFilter] !== ''): ?>
            <input type="hidden" name="<?= e($certificatesFilter) ?>" value="<?= e($filters[$certificatesFilter]) ?>">
          <?php endif; ?>
        <?php endforeach; ?>
      </form>

      <div class="l-filter-bar__selects">
        <nav class="c-tabs" aria-label="Certificate status">
          <?php foreach (['' => 'All Certificates'] + array_map(fn (array $status): string => $status[0], $statusNames) as $statusKey => $statusName): ?>
            <a class="c-tabs__tab" href="<?= e($certificatesLink(['status' => $statusKey])) ?>" aria-selected="<?= $filters['status'] === $statusKey ? 'true' : 'false' ?>">
              <?= e($statusName) ?> <span class="c-tabs__count"><?= e($counts[$statusKey]) ?></span>
            </a>
          <?php endforeach; ?>
        </nav>
      </div>
    </div>

    <div class="l-certificates__pathways">
      <nav class="c-tabs" aria-label="Pathway">
        <?php foreach (['' => 'All'] + array_map(fn (array $pathway): string => $pathway[0], config('certificates.pathways')) as $pathwayKey => $pathwayName): ?>
          <a class="c-tabs__tab" href="<?= e($certificatesLink(['pathway' => $pathwayKey])) ?>" aria-selected="<?= $filters['pathway'] === $pathwayKey ? 'true' : 'false' ?>"><?= e($pathwayName) ?></a>
        <?php endforeach; ?>
      </nav>
    </div>

    <?php
    $certificateGroups = [
        'draft'  => ['alertCircle', 'Certificates needing review', 'Pending Review'],
        'issued' => ['shieldCheck', 'Verified Certificates', 'Verified'],
        'left'   => ['logOut', 'Already Left', 'Left'],
    ];
    ?>
    <?php foreach ($certificateGroups as $groupKey => [$groupIcon, $groupTitle, $groupCount]): ?>
      <?php if ($groups[$groupKey] !== []): ?>
        <section class="l-certificates__group">
          <div class="c-certificates__group-head">
            <h2 class="c-certificates__group-title<?= $groupKey === 'draft' ? ' c-certificates__group-title--pending' : '' ?>"><?= icon($groupIcon, 18) ?><?= e($groupTitle) ?></h2>
            <span class="c-chip c-chip--round c-certificates__group-count--<?= e($groupKey) ?>"><?= e(count($groups[$groupKey]) . " {$groupCount}") ?></span>
          </div>
          <div class="l-certificates-grid">
            <?php foreach ($groups[$groupKey] as $certificateCard): ?>
              <?php
              $certificateCardLink = $listUrl;
              require dirname(__DIR__) . '/components/_certificate_card.php';
              ?>
            <?php endforeach; ?>
          </div>
        </section>
      <?php endif; ?>
    <?php endforeach; ?>
