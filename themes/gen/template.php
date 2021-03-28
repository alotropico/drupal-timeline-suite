<?php

function timeline_preprocess_html(&$vars) {

	//save_node();

	// NODES notes styles

	if(false && isset($vars['page']['content']['system_main']['nodes'])){

		$node = $vars['page']['content']['system_main']['nodes'];

		$nid = array_keys((array)$node)['0'];

		//$vars['classes_array'][] = 'note-style-' . $note_class . ' note-footer-' . $gamma_class_foot . ' note-top-' . $gamma_class_top;

		// Facebook share image

		if( isset($node->field_image[LANGUAGE_NONE]['0']['uri']) ){

			$social_img = image_style_url('nav_medium', $node->field_image[LANGUAGE_NONE]['0']['uri']);

		} else {

			$social_img = 'http://dev.timeline.com/sites/default/themes/timeline/screenshot.png';

		}

		$fb_img = array(
			'#type' => 'html_tag',
			'#tag' => 'meta',
			'#attributes' => array(
				'property' => 'og:image',
				'content' => $social_img,
			)
		);

		drupal_add_html_head($fb_img, 'fb_img');

		// Facebook share description

		if( isset($node->body[LANGUAGE_NONE]['0']['value'])){

			$fb_desc = array(
				'#type' => 'html_tag',
				'#tag' => 'meta',
				'#attributes' => array(
					'property' => 'og:description',
					'content' => strip_tags(text_summary ($node->body[LANGUAGE_NONE]['0']['value'])) . '...',
				)
			);

			drupal_add_html_head($fb_desc, 'fb_desc');
		}
	}

}

function gen_preprocess_page(&$vars) {
	
	$theme_path = $vars['directory'];

	$vars['show_title'] = true;
	$vars['content_class'] = '';

	$vars['logo'] = variable_get('site_name');

	$isGen = false;

	

	//drupal_add_js($theme_path. '/js/plugins/jquery.mobile.custom.min.js');

	drupal_add_css($theme_path. '/css/common.css');
	
	drupal_add_js($theme_path. '/js/plugins/jquery.mousewheel.min.js');
	drupal_add_js($theme_path. '/js/plugins/alo_drag_and_drop.js');

	drupal_add_js($theme_path. '/js/theme.js');
	
	if ( drupal_is_front_page() ) {

		$vars['show_title'] = false;

		// drupal_add_js($theme_path. '/js/plugins/masonry.pkgd.min.js');
		// drupal_add_js($theme_path. '/js/home.js');

		//drupal_add_css($theme_path. '/css/navs.css');
		
	} elseif (!empty($vars['node'])){

		switch($vars['node']->type){

			case 'monad':
			case 'collection':
				$vars['show_title'] = false;
				$isGen = true;
				break;

			default:
				$vars['content_class'] .= 'l-wrap';
				//drupal_add_css($theme_path. '/css/navs.css');

		}

		//drupal_add_js($theme_path. '/js/plugins/alo_imagefit.js');

		//drupal_add_css($theme_path. '/css/node.css');

	} else {

		$vars['content_class'] .= 'l-wrap';
		
		$views_page = views_get_page_view();
		if (is_object($views_page)) {
			//drupal_add_css($theme_path. '/css/navs.css');
		}
	}

	if(!$isGen)
		drupal_add_css($theme_path. '/css/portal.css');

	drupal_add_css($theme_path. '/css/shame.css');

	/*drupal_add_js($theme_path. '/js/script.js');*/
	
}

function gen_preprocess_node(&$vars) {

	//dpm($vars['node']);

	global $base_url;

	// Articles
	if($vars['node']->type == 'monad'){

		// Share urls

		/*$currentPath = $_SERVER['REQUEST_URI'];

		$url = urlencode($base_url . $currentPath);

		if(preg_match("/([^\/]*)$/", $currentPath, $matches))
		{
		 	$end = $matches[1];
		}
		else
		{
			$end = '';
		}

		$vars['shareURL']['url']['fb'] = "https://www.facebook.com/sharer/sharer.php?u=" . $url;

		$vars['shareURL']['url']['tw'] = "http://twitter.com/share?text=" . $vars['title'] . '&url=' . $url . '&hashtags=#timeline';

		$vars['shareURL']['url']['gl'] = "https://plus.google.com/share?url=" . $url;

		$vars['shareURL']['url']['wa'] = "whatsapp://send?text=" . $url;*/

	} else {

		//dpm($vars);

	}
}

/*function timeline_preprocess_file_entity(&$vars){
	dpm( $vars );
}*/

function gen_node_view_alter(&$build) {

	//if($build['#bundle'] == 'monad'){

		// For SVG and medium GIF files, show original image
		if(isset($build['field_picture']['0']['file']['#item']['uri'])) {
			$imgPath = $build['field_picture']['0']['file']['#item']['uri'];

			if(strpos($imgPath, '.svg') !== false || (strpos($imgPath, '.gif') !== false && $build['field_picture']['0']['file']['#item']['width'] < 300)){
				//$build['field_picture']['0']['#file']->metadata['width'] = 200;
				//dpm($build['field_picture']['0']['#file']->metadata);
				//unset($build['field_picture']['0']['file']['#image_style']);
			}
		}

		//if(isset($build['field_media']['0'])){
			/*if($cap = @$img_title=$build['field_image']['0']['#item']['field_file_image_title_text'][LANGUAGE_NONE]['0']['value']){
				$cap = '<figcaption>'.$cap.'</figcaption>';
			}else{
				$cap = '';
			}*/
			// $build['field_media']['0']['#prefix'] = '<div class="media-main">';
			// $build['field_media']['0']['#suffix'] = '</div>';
		//}

	//}
}

function timeline_views_pre_render(&$view) {

	//dpm($view);
	
	if($view->name == 'notes_nav'){
		foreach($view->result as $key=>$row){

			//dpm( $key );
			if( $key == 0 && isset($row->field_field_media['0']) && $row->field_field_media['0']['rendered']['file']['#theme'] == 'image_formatter' ){

				$row->field_field_media['0']['rendered']['file']['#image_style'] = 'nav_huge';

			}

			/*if(isset($row->field_field_album) && count($row->field_field_album) > 1){
				switch(count($row->field_field_album)){
					case '3':
					case '4':
						$row->field_field_album['0']['rendered']['#image_style'] = 'nav_big_sqr';
						break;
					case 7:
						$row->field_field_album['1']['rendered']['#image_style'] = 'nav_big_sqr';
					case '6':
						$row->field_field_album['0']['rendered']['#image_style'] = 'nav_big';
						break;
						
					default:
				}
			}*/
		}
	}
}

function timeline_preprocess_views_view_fields(&$vars) {

	if($vars['view']->name == 'notes_nav'){

	}
}

function timeline_preprocess_block(&$variables) {

	//if($variables->id == 4){
		//dpm($variables);
	//}

}

function timeline_form_alter(&$form, &$form_state, $form_id) {

	/*if($form['#form_id']=='search_block_form'){

		$searchWord = t('Search');

		$form['search_block_form']['#title'] = $searchWord . '...';
		$form['search_block_form']['#attributes']['placeholder'] = $searchWord . '...';
		//$form['search_block_form']['#attributes']['class'][] = '';
		$form['search_block_form']['#prefix'] = '<div class="search_bar">';
		$form['search_block_form']['#suffix'] = '</div>';
		$form['actions']['submit']['#value'] = $searchWord;
	}
	
	if($form['#form_id']=='mailchimp_signup_subscribe_block_subscription_form'){

		$form['mergevars']['EMAIL']['#title'] = t('Novedades por email');
		$form['mergevars']['EMAIL']['#attributes']['placeholder'] = t('tu_email@email.com');
		$form['submit']['#prefix']='<div class="form-actions">';
		$form['submit']['#suffix']='</div>';

	}*/
}

// COMMENTS

function timeline_preprocess_comment_wrapper(&$vars) {
	global $user;

	// Obtengo el usuario actual y creo una variable con el html de la imagen
	$vars['user_pic'] = theme('user_picture', array('account' =>$user,'style_name' => 'square_nav_small'));

	$vars['comment'] = array(
		'count'=>$vars['node']->comment_count
	);
	//$vars['comment'] = esq_flag_msg_get($vars['comment'], 'comment');
}
function gen_preprocess_comment(&$vars) {

	//dpm($vars);

	$vars['submitted'] = $vars['author'] . ' <span class="date">' . $vars['created'] . '</span>';

	//$var['comment_message']='OPATE';

	//$vars['permalink'] = NULL;
}

function gen_form_comment_form_alter(&$form, &$form_state) {

	//dpm($form);
	
	// Modifico labels de los campos del form
	$form['author']['_author']['#title'] = NULL;
	$form['author']['_author']['#prefix'] = '<h4>';
	$form['author']['_author']['#suffix'] = '</h4>';
	$form['comment_body'][LANGUAGE_NONE]['0']['#title'] = t('Leave your comment');
	$form['comment_body'][LANGUAGE_NONE]['0']['#title'] = t('Leave your comment');
	
	// Llamo a la función para procesar el form después de que se construye
	$form['#after_build'][] = 'alo_configure_comment_form';
}

function alo_configure_comment_form($form) {
	
	// Elimino el CCK del form de comentarios
    $form['comment_body'][LANGUAGE_NONE]['0']['format'] = NULL;
	
	// $form['comment_body'][LANGUAGE_NONE]['0']['format']['#access'] = FALSE;
    return $form;
	
}



// SNIPPETS

// TIME

function formatTime($postTime){

	$currentTime = time();
		
	$elapsedTime = $currentTime - $postTime;
	$finalTime;

	$ago = '';

	if($elapsedTime < 60 * 60 * 24 * 1)

		$finalTime = $ago . time_elapsed_string( $elapsedTime );

	else if($elapsedTime < 60 * 60 * 24 * 2)

		$finalTime = 'ayer'; // . date('h:i A', $postTime);

	else if($elapsedTime < 60 * 60 * 24 * 7)

		$finalTime = '' . getWeekDay( date('w', $postTime) );

	else if($elapsedTime < 60 * 60 * 24 * 30)

		$finalTime = $ago . time_elapsed_string( $elapsedTime );

	else

		$finalTime = $ago . '+ de ' . time_elapsed_string( $elapsedTime );

	return $finalTime;

}

function getWeekDay( $num ) {
	$week = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

	return $week[$num];

}

function time_elapsed_string($etime)
{

    if ($etime < 1)
    {
        return '0 seconds';
    }

    $a = array( 365 * 24 * 60 * 60  =>  'año',
                 30 * 24 * 60 * 60  =>  'mes',
                      24 * 60 * 60  =>  'día',
                           60 * 60  =>  'hora',
                                60  =>  'minuto',
                                 1  =>  'segundo'
                );
    $a_plural = array( 'año'   => 'años',
                       'mes'  => 'meses',
                       'día'    => 'días',
                       'hora'   => 'horas',
                       'minuto' => 'minutos',
                       'segundo' => 'segundos'
                );

    foreach ($a as $secs => $str)
    {
        $d = $etime / $secs;
        if ($d >= 1)
        {
            $r = round($d);
            return '' . $r . ' ' . ($r > 1 ? $a_plural[$str] : $str) . '';
        }
    }
}