<?php ?>

<div class="mobile-msg">
    <div class="mobile-msg-content">
        <p><strong>Timeline visualization is not yet available in small devices.</strong></p>
        <p>Visit our site on a notebook or desktop computer.</p>
        <p>Meanwhile you can see static versions of some timelines on <a href="https://twitter.com/gazeoftime" target="_blank">Twitter</a> and <a href="https://www.instagram.com/gazeoftime/" target="_blank">Instagram</a>.</p>
        <br>
        <p><a href="/">Go back to the Homepage.</a></p>
    </div>
</div>

<div class="r-content">
	<div class="timeline-cloud">
        <div class="veil"></div>
        <div class="timeline-top table">

            <div class="home-link td">
                <a href="/"><img src="/sites/gen/themes/gen/images/layout/gen-logo-micro.png"></a>
            </div>

            <?php if(isset($content["field_picture"]) && $content["field_picture"]){ ?>

                <div class="timeline-picture td">
                    <?php print render($content["field_picture"]); ?>
                </div>

            <?php } ?>

            <div class="timeline-title td">
                <?php

					if(isset($title))
						print '<h1 class="title">' . render($title) . '</h1>';
					else
						print '<h1 class="title">' . drupal_get_title() . '</h1>';

					if(isset($content["field_body"]) && $content["field_body"])
					   print render($content["field_body"]);
				?>
            </div>

            <div class="timeline-tools td">
                <a href="javascript:;" class="menu-bt"></a>
                <div class="timeline-menu">
                    <div class="site-menu">
                    
                        <!-- <div class="w-menu">
                            <ul class="menu">
                                <li><a href="/" title="Home">Home</a></li>
                                <li><a href="/items-for-update" title="Items ready for update" class="admin">For update</a></li>
                                <li><a href="/items-to-load" title="Empty items to load" class="admin">To load</a></li>
                                <li><a href="/advanced/import" title="Import and update items" class="admin">Importer</a></li>
                                <li><a href="/advanced/collection" title="Add items to a collection" class="admin">Add to collection</a></li>
                                <li><a href="http://www.alotropico.com/projects/wikidata-parser/" target="_blank" title="Parse Wikidata item IDs from dirty text" class="admin">Wikidata parser</a></li>
                                <li><a href="/user/login" title="Login" class="anon">Login</a></li>
                                <li><a href="/user/logout" title="Logout" class="admin">Logout</a></li>
                            </ul>
                        </div>

                        <div class="w-search-bar">
                            <form enctype="multipart/form-data" action="/search/advanced?name=" method="get" accept-charset="UTF-8">
                                <input type="text" placeholder="Search..." name="name">
                                <button type="submit"></button>
                            </form>
                        </div> -->

                    </div>
                </div>
            </div>

        </div>
        <div class="timeline-wrap">
            <div class="timeline-content">
                <div class="timeline-specials">

                </div>
                <div class="timeline-guides">

                </div>
                <div class="timeline-stage-wrap">
                    <div class="timeline-stage">

                    </div>
                </div>
            </div>
        </div>
        <div class="timeline-bottom">

            <div class="timeline-groups">
                
            </div>

            <div class="timeline-categories-wrap">

                <div class="timeline-categories timeline-categories-1">
                
                </div>
                <div class="timeline-categories timeline-categories-2">
                
                </div>
            </div>
        </div>
    </div>
</div>

<?