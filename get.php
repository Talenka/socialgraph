<?php
/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * @author Boudah Talenka <boudah.talenka@gmail.com>
 * @license GNU General Public License
 * @since 2013-02-26
 * 
 * This script allows you to retrieve a JSON file from server.
 *
 * Typically, the SocialGraph.js does an asynchronous GET request for the URL:
 * http://socialgraph.boudah.pl/get?SOME_FANCY_NAME
 *
 * And this script returns the content of the json file located at the URL:
 * http://socialgraph.boudah.pl/data/SOME_FANCY_NAME.json
 *
 * The purpose of this script is to check whether the script exist or not,
 * to prevent the browser to cache it, and, if the file does not exist,
 * to return a default graph in json format.
 */

header('Content-type: text/json;charset=utf-8');
header('Cache-Control: no-cache, max-age=0, must-revalidate');
header('Expires: '.date('r'));

$file = 'data/' . preg_replace('/\W/', '', $_SERVER['QUERY_STRING']) . '.json';

echo file_exists($file) ? file_get_contents($file)
                        : '{"metadata":{"title":"untitled",' .
                            '"authors":["Anonymous"],' .
                            '"created":' . date ('r') .
                            ',"visibility":"public",' .
                            '"license":"CC-BY-SA"},"vertices":[]}';

?>