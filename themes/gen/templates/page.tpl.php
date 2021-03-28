<div class="l_container">

  <?php if($page['header_first'] || $page['header_second'] || $page['header_third']){ ?>
    <div class="l_header">
      <div class="l-wrap-full">
        <div class="l_header-wrap">

          <div class="l_header_first"><?php print render($page['header_first']); ?></div>

          <div class="l_header_second">

            <a href="javascript:;" class="menu-btn"></a>
            <div class="menu-content">
              <?php print render($page['header_second']); ?>
            </div>

            
          </div>

          <div class="l_header_third">
            <?php print render($page['header_third']); ?>
          </div>

        </div>
      </div>
    </div>
  <?php } ?>

  <?php if($messages){ ?>
    <div class="drupal-messages">
      <?php print $messages; ?>
    </div>
  <?php } ?>

  <?php if($page['highlighted']){ ?>
    <div class="l_highlighted"><?php print render($page['highlighted']); ?></div>
  <?php } ?>

  <div class="l_content <?php print $content_class; ?>">

    <?php if (isset($tabs['#primary'][0]) || isset($tabs['#secondary'][0]) || $action_links): ?>
      <nav class="drupal-tabs">
        <?php print render($tabs); ?>
        <?php print render($action_links); ?>
      </nav>
    <?php endif; ?>

    <?php print render($title_prefix); ?>
      <?php if ($title && $show_title): ?>
        <h1><?php print $title; ?></h1>
      <?php endif; ?>
    <?php print render($title_suffix); ?>

    <?php print render($page['content']); ?>

  </div>

  <?php if(isset($node) && $node->nid == '1') include drupal_get_path('theme', 'gen') . '/templates/importer.php'; ?>

  <?php if($page['bottom']){ ?>
    <div class="l_bottom"><?php print render($page['bottom']); ?></div>
  <?php } ?>

  <?php if($page['footer_first'] || $page['footer_second'] || $page['footer_third']){ ?>
    <div class="l_footer">
      <div class="l-wrap-full">
        <div class="l_footer_first"><?php print render($page['footer_first']); ?></div>
        <div class="l_footer_second"><?php print render($page['footer_second']); ?></div>
        <div class="l_footer_third"><?php print render($page['footer_third']); ?></div>
      </div>
    </div>
  <?php } ?>

  <div><?php print render($page['placeholder']); ?></div>

</div>