<!-- CONSOLE -->

<div id="console" class="console">
  <div class="console_content">

    <div class="console_status console_outputs" id="ajax-target">

      <div class="console_tools">
        <div id="console_tools" class="wrap"></div>
      </div>

      <div class="console_history">
        <div id="console_history" class="wrap"></div>
      </div>

      <div class="console_errors">
        <div id="console_errors" class="wrap"></div>
      </div>

      <div class="console_ids">
        <div id="console_ids_ok" class="semi-wrap"></div>
        <div id="console_ids_error" class="semi-wrap"></div>
      </div>

    </div>

    <?php //print render($title); ?>

    <?php //print render($content); ?>

    <div id="console_out" class="console_output console_outputs">
    </div>

    <div class="console_input">

      <textarea id="console_in" placeholder="<?php echo t('Write names or IDS and press <enter>'); ?>"></textarea>

      <div id="console_options" class="console_options">

        <div class="option"><input type="checkbox" name="override"><label>Override (save even if it already exists)</label></div>

        <div class="option"><input type="checkbox" name="timeonly"><label>Save only if it has timely information</label></div>

        <div class="option"><input type="checkbox" name="collectonly"><label>Collect ids only (don't save)</label></div>

      </div>

    </div>

  </div>
  <div class="console_veil">
  </div>
  

</div>

<!-- END OF CONSOLE -->