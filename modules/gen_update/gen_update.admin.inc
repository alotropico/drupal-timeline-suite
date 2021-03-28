<?php
/*
 * @file
 * Administrative interface for the gen_update module.
 */

/**
 * Implements hook_form().
 *
 * @param array $form
 * @param array $form_state
 * @return array
 */
function gen_update_form($form, &$form_state) {
  $options = array();
  $types = node_type_get_types();
  ksort($types);
  foreach ($types as $key => $values) {
    $count = db_select('node')
      ->condition('type', $key)
      ->countQuery()
      ->execute()
      ->fetchField();

    if ($count > 0) {
      $options[$key] = "$values->name ($key) ($count)";
    }
  }
  $form['types'] = array(
    '#type'        => 'checkboxes',
    '#title'       => t('Content types for update'),
    '#options'     => $options,
    '#description' => t('All nodes of these types will be updated.'),
  );

  $form['submit'] = array(
    '#type'  => 'submit',
    '#value' => t('Update nodes'),
  );

  return $form;
}

/**
 * Implements hook_form_submit().
 *
 * Generates the batch actions array.
 * @param array $form
 * @param array $form_state
 */
function gen_update_form_submit($form, &$form_state) {

  $quick = 0;

  // Process the form results.
  $types = array_filter($form_state['values']['types']);
  if (count($types) > 0) {
    $result = db_select('node')
      ->fields('node', array('nid'))
      ->condition('type', $types)
      ->execute()
      ->fetchAll();

    $operations = array();

    // Doing an empty operation at the beginning makes the "initialization"
    // phase go quickly.
    //$operations[] = array('trim', array(''));

    $count = 1;
    $last_row = count($result);
    foreach ($result as $row) {
      $nids[] = $row->nid;
      if ($count % 1 === 0 || $count === $last_row) {
        $operations[] = array('gen_watchdoguear', array($nids));
        //array('gen_watchdoguear', array('1', '2'));
        $nids = array();
      }
      ++$count;
    }

    // Clear the cache once at the end.
    // How many operations are we going to do?
    $count_operations = count($operations);

    // Set up the Batch API
    $batch = array(
      'operations' => $operations,
      'finished'   => '_gen_update_batch_finished',
      'title'      => t('Updating !count nodes in !count2 operations.', array(
        '!count'  => --$count,
        '!count2' => $count_operations
      )),
    );
    batch_set($batch);
    batch_process();
  }
}

// function gen_watchdoguear($lasvars){
//   watchdog('gen_update', $lasvars);
// }