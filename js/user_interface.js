/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * Created by Boudah Talenka <boudah.talenka@gmail.com>
 * and published under the GNU General Public License.
 */


/**
 * Base URL of creatives commons licenses
 * @const
 * @type {string}
 */
var creativeCommons = '//creativecommons.org/licenses/';


/**
 * Licences list
 * @type {Array.<integer, {id: string, name: string, url: string}>}
 * @const
 */
var predefinedLicenses = [
  {
    id: 'GNU-GPL',
    name: 'GNU General Public License',
    url: '//www.gnu.org/licenses/gpl.html'
  },
  {
    id: 'GNU-FDL',
    name: 'GNU Free Documentation License',
    url: '//www.gnu.org/licenses/fdl.html'
  },
  {
    id: 'CC-BY-SA',
    name: 'Creative Commons Attribution and Share-alike License',
    url: creativeCommons + 'by-sa/3.0/'
  },
  {
    id: 'CC-BY',
    name: 'Creative Commons Attribution',
    url: creativeCommons + 'by/3.0/'
  },
  {
    id: 'CC-BY-NC-SA',
    name: 'Creative Commons Attribution, Non-commercial and Share-alike',
    url: creativeCommons + 'by-nc-sa/3.0/'
  },
  {
    id: 'CC-BY-NC-ND',
    name: 'Creative Commons Attribution, Non-commercial and No-derivatives',
    url: creativeCommons + 'by-nc-nd/3.0/'
  },
  {
    id: 'CC-0',
    name: 'Creative Commons Public Domain Dedication',
    url: creativeCommons + '../publicdomain/zero/1.0/'
  },
  {
    id: 'COPYRIGHT',
    name: 'Copyright ' + (new Date).getFullYear() + '. All right reserved',
    url: '//en.wikipedia.org/wiki/Copyright'
  },
  {
    id: 'WTFPL',
    name: 'Do What The Fuck You Want License',
    url: 'http://www.wtfpl.net/about/'
  }
];


/**
 * Base URL of the website (TODO Explicit protocol needed?)
 * @const
 * @type {string}
 */
var SocialGraphUrl = document.location.protocol + '//socialgraph.boudah.pl/';


/**
 * Base URL of the project
 * @const
 * @type {string}
 */
var githubProjectUrl = '//github.com/talenka/socialgraph/';


/**
 * Default external links target
 * @const
 * @type {string}
 */
var linksTarget = 'target=_blank';


/**
 * Shows the User Interface (UI) menu
 */
function showMenu() {

  /** @type {Node} */
  var menu;

  if (getId('menu')) menu = getId('menu');
  else menu = create('nav', 'menu');

  menu.innerHTML = tag('strong', graph.metadata.title, 'meta') +
                       ' by <em>' + graph.metadata.authors.join() + '</em>' +
                       ' (' + licenseLink(graph.metadata.license) + ')' +
                       button('Help') +
                       button('Share') +
                       button('Import') +
                       button('Save') +
                       button('New');

  document.title = graph.metadata.title + ' | SocialGraph';

  // We associate actions to buttons
  getId('New').onclick = createVertexAndEditPanel;
  getId('Save').onclick = savePanel;
  getId('Import').onclick = importPanel;
  getId('Share').onclick = sharePanel;
  getId('Help').onclick = helpPanel;
  getId('meta').onclick = editMetaData;
}


/**
 * Edit meta data of the graph
 */
function editMetaData() {
  showPanel('Edit graph options',
            '<label for=vertexTitle>Graph title:</label> ' +
            '<input type=text maxlength=30 id=graphTitle ' +
              'value="' + graph.metadata.title + '"><br>' +
            '<label for=vertexDescription>Authors:</label> ' +
            '<input type=text maxlength=100 id=graphAuthors ' +
              'value="' + graph.metadata.authors.join(', ') + '"><br>' +
            'Created ' + graph.metadata.created + '<br>' +
            'Visible to ' +
            select('graphVisibility',
                  {'private': 'me (with the password)',
                  'protected': 'those who have the link',
                  'public': 'everyone (public)'}, graph.metadata.visibility));

  //created: (new Date()).toGMTString(),
  //visibility: 'private',
  //license: 'COPYRIGHT'
}


/**
 * Shows a panel
 * @param {string} head Panel title.
 * @param {string} body Panel content.
 */
function showPanel(head, body) {

  if (!getId('panel')) create('section', 'panel');

  getId('panel').innerHTML = button('Close') + '<h1>' + head + '</h1>' + body;

  getId('Close').onclick = closePanel;

  document.body.style.backgroundColor = '#ddd';
}


/**
 * @param {string} licenseId The license identifier.
 * @return {string} The license link.
 */
function licenseLink(licenseId) {

  for (var i = 0, j = predefinedLicenses.length; i < j; i++)

    if (predefinedLicenses[i].id == licenseId)

      return '<a href="' + predefinedLicenses[i].url + '" ' +
                 linksTarget +
                 ' title="' + predefinedLicenses[i].name + '"' +
                 ' rel=license>' +
                 licenseId +
              '</a>';

    return '';
}


/**
 * Closes the opened panel
 */
function closePanel() {

  /** @type {Node} */
  var panel = getId('panel');

  if (panel) document.body.removeChild(panel);

  document.body.style.backgroundColor = '#fff';
}


/**
 * Creates a new vertex and opens the Edit panel
 */
function createVertexAndEditPanel() {

  /** @type {integer} */
  var newVertexTitle = 1;

  while (getVertexIdByTitle('#' + newVertexTitle) != -1)
  {
    if (newVertexTitle > 99) return;
    else newVertexTitle++;
  }

  graph.vertices.push(vertex({
    title: '#' + newVertexTitle,
    type: vertexTypes[0],
    position: context.mouse}));

  selectedVertices = [graph.vertices.length - 1];

  editPanel();
}


/**
 * Opens the Save panel
 */
function savePanel() {

  /** @type {Object} */
  var licenses = {};

  for (var i = 0, j = predefinedLicenses.length; i < j; i++)
    licenses[predefinedLicenses[i].id] = predefinedLicenses[i].name;

  showPanel('Save this graph',
            button('saveOffline', 'Save on my computer') + '<hr>' +
            button('saveOnline', 'Save on the web') + '<br>' +
            'with the password <input type=password id=graphPass value="">' +
            '<br> and visible to </label> ' +
            select('graphVisibility',
                  {'private': 'me (with the password)',
                  'protected': 'those who have the link',
                  'public': 'everyone (public)'}, graph.metadata.visibility) +
            '. <br>Publish under ' +
            select('graphLicense', licenses, graph.metadata.license) + '<hr>' +
            button('Download') + ' the ' +
            select('exportData', ['Graph', 'Contacts']) +
            ' in the ' + select('exportFormat', ['JSON', 'Atom']) + ' format.');

  getId('Download').onclick = download;
  getId('saveOffline').onclick = saveOffline;
}


/**
 * Opens the Import panel
 */
function importPanel() {
  showPanel('Import from', '(Coming soon)');
}


/**
 * Opens the Edit panel for the lastest selected vertex
 */
function editPanel() {

  if (selectedVertices.length == 0) return;

  else
    /** @type {Vertex} */
    var v = graph.vertices[selectedVertices[0]];

  showPanel('Edit this element',
            '<label for=vertexType>Type:</label> ' +
            select('vertexType', vertexTypes, v.type) + '<br>' +
            '<label for=vertexTitle>Title:</label> ' +
            '<input type=text maxlength=30 id=vertexTitle ' +
              'value="' + v.title + '"><br>' +
            '<label for=vertexDescription>Description:</label> ' +
            '<input type=text maxlength=100 id=vertexDescription ' +
              'value="' + v.description + '">');

  // Image
  // Details {}
  // Couleur
  // Membres []
  // Liens {}

  getId('vertexType').onchange = editVertex;
  getId('vertexTitle').onchange = editVertex;
  getId('vertexDescription').onchange = editVertex;

  /*
  ⌚ Montre/Watch
  ⌫ Erase
  ⎌ Undo
  ⚓ Anchor
  ✆ Phone
  ✉ Letter
  */
}


/**
 * Update the vertex properties
 * TODO: clean user inputs.
 */
function editVertex() {

  /** @type {integer} */
  var v = selectedVertices[0];

  graph.vertices[v].type = getId('vertexType').value;
  graph.vertices[v].title = getId('vertexTitle').value;
  graph.vertices[v].description = getId('vertexDescription').value;

  editPanel();
}


function saveOffline() {
  displayError('Not implemented yet !');

  /*
  if (!window.localStorage) displayError('localStorage is not available');
  else {

      if (!window.localStorage.getItem('socialgraphs'))
          window.localStorage['socialgraphs'] = window.JSON.stringify('{}');

      /** @type {Object} * /
      var graphsStorage = window.JSON
                          .parse('' + window.localStorage
                                              .getItem('socialgraphs'));

      if (!graphsStorage[metadata.title] ||
          window.confirm('There is already a file named “' +
              metadata.title + '”, replace it?')) {

          graphsStorage[metadata.title] = graph;

          window.localStorage.setItem('socialgraphs',
                                      window.JSON.stringify(graphsStorage));
      }
  }
  */
}


/**
 * Displays an error message in the panel
 * @param {string} message Error message.
 */
function displayError(message) {
  showPanel('Argh!', 'An error happened, because ' + message);
}


/**
 * Shows Help panel
 */
function helpPanel() {

  showPanel('Help',
      '<p>SocialGraph aims to better understand a social network showing an ' +
      'intuitive dynamics of individuals and organizations that make up a ' +
      'network. It creates human-readable dynamics graph that you can export ' +
      'everywhere, and even use offline (just by saving this webpage on your ' +
      'computer).</p>' +
      '<ul>' +
      '<li>' +
          '<a href="' + githubProjectUrl + 'wiki/getting-started" ' +
          linksTarget + '>Getting started</a>' +
      '</li>' +
      '</ul>' +
      '<p>This is a brand new project, if you are interested, join us on ' +
      '<a href="' + githubProjectUrl + '" ' + linksTarget + '>github</a>, ' +
      'where comments and <a href="' + githubProjectUrl + 'issues" ' +
      linksTarget + '>bugs reports</a> are welcomed.</p>');
}


/**
 * Shows Share panel
 */
function sharePanel() {

  showPanel('Share this graph',
      '<p>Coming soon...</p>' +
      '<ul>' +
          '<li>Twitter</li>' +
          '<li>Facebook</li>' +
          '<li>Google+</li>' +
          '<li>Pinterest</li>' +
      '</ul>');
}


/**
 * Animates the graph
 */
function animate() {

  // First of all, we erase everything on the canvas.
  context.clearRect(0, 0, context.width, context.height);

  // Then we (re)draw the graph.
  for (var i = 0, j = graph.vertices.length; i < j; i++)
  {
    var selected = (selectedVertices.indexOf(i) !== -1);

    graph.vertices[i] = vertex(graph.vertices[i]).step().draw(selected);

    // We also draw also to symbolize links between vertices.
    for (var l in graph.vertices[i].links)
      graph.vertices[i].drawLinkTo(
          vertex(graph.vertices[getVertexIdByTitle(l)]), selected);
  }

  setTimeout(animate, timeStep);
}


/**
 * Adjust the canvas size to the window
 */
function autoAdjustCanvasSize() {

  /** @type {number} */
  var height = window.innerHeight;

  /** @type {number} */
  var width = window.innerWidth;

  if (context.width != width || context.height != height) {

    /** @type {Node} */
    var canvas = getId('canvas');
    canvas.width = width;
    canvas.height = height;
    context.width = width;
    context.height = height;
    context.center = coords(width / 2, height / 2);
  }

  // We resize canvas every seconds in case of window's resizing
  window.setTimeout(autoAdjustCanvasSize, 1000);
}


/**
 * User Interface click event
 */
function selectVertex() {

  /** @type {integer} */
  var lastSelected = getVertexIdByCoords(context.mouse);

  if (lastSelected < 0)
  {
    closePanel();
    selectedVertices = [];
  }
  else selectedVertices = [lastSelected];
}
