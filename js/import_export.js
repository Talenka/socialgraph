/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * Created by Boudah Talenka <boudah.talenka@gmail.com>
 * and published under the GNU General Public License.
 */


/**
 * Starts graph/contact list download
 */
function download() {

  /** @type {string} */
  var exportData = getId('exportData').value;

  /** @type {string} */
  var exportFormat = getId('exportFormat').value;

  /** @type {string} */
  var raw = '';

  if (exportData == 'Graph') {

    if (exportFormat == 'JSON') raw = window.JSON.stringify(graph);

    else if (exportFormat == 'Atom') {

      raw = '<?xml version="1.0" encoding="utf-8"?>' +
          '<feed xmlns="http://www.w3.org/2005/Atom">' +
          tag('title', graph.metadata.title) +
          tag('subtitle', 'A social graph') +
          '<link href="' + SocialGraphUrl + '"/>' +
          tag('updated', graph.metadata.created) +
          tag('author', tag('name', graph.metadata.authors[0]));

      for (var i = 0, j = graph.vertices.length; i < j; i++)

        raw += tag('entry',
                   tag('title', graph.vertices[i].title) +
                   '<link href="' + SocialGraphUrl + '"/>' +
                   tag('updated', graph.metadata.created) +
                   tag('summary', graph.vertices[i].description));

      raw += '</feed>';
    }
  }

  if (raw == '') displayError('this function is not yet implemented :-(');
  else showPanel('Output', tag('textarea', raw));
}


/**
 * @param {string} url The ressource URL.
 * @param {function(string)} callback The function called with data as argument.
 */
function getDataFromUrl(url, callback) {

  ajax = new window.XMLHttpRequest();
  ajax.open('GET', url, true);
  ajax.send(null);

  ajax.onreadystatechange = function() {

    if (ajax.readyState == 4) {

      if (ajax.status == 200) callback(ajax.responseText);

      else displayError('the server do not respond properly (ajax)');
    }

  };

}


/**
 * @param {string} url The url containing JSON data.
 */
function importFromUrl(url) {

  getDataFromUrl(url, function(data) {

    var buffer = window.JSON.parse(data);

    if (buffer &&
        buffer.metadata &&
        buffer.metadata instanceof Object &&
        buffer.vertices &&
        buffer.vertices instanceof Array)

      graph = new Object(buffer);

    else displayError('there is a vergence in the Force');

    showMenu();

  });

}
