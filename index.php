<?php
/**
 * The main template file
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists.
 *
 * @link https://developer.wordpress.org/themes/basics/template-hierarchy/
 *
 * @package WP_Vue
 */

get_header();
?>

	<main id="site-content">

		<div class="container">
      <div class="row">
          <?php

          get_template_part('template-parts/posts-list');

          ?>
      </div>
    </div>

	</main><!-- #main -->

<?php
get_sidebar();
get_footer();
