<?php
// Export PDF button. Needs $exportUrl, the printable page
// export-pdf.js loads that page out of sight and opens the print box, where the user picks Save as PDF
// A script may change data-url later, for example when another term is chosen
?>
<button type="button" class="c-export-btn j-export-pdf" data-url="<?= e($exportUrl) ?>">
  <?= icon('download', 14) ?>
  <span class="j-export-pdf-text">Export PDF</span>
</button>
<?php unset($exportUrl); ?>
