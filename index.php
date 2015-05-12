<?php

/**
 * Plugin Name: Data Tables Generator by Supsystic
 * Plugin URI: http://supsystic.com
 * Description: Create and manage beautiful data tables with custom design. No HTML knowledge is required
 * Version: 1.0.3
 * Author: supsystic.com
 * Author URI: http://supsystic.com
 */

include dirname(__FILE__) . '/app/SupsysticTables.php';

$supsysticTables = new SupsysticTables();
$supsysticTables->activate(__FILE__);
$supsysticTables->run();