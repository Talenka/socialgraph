/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * Created by Boudah Talenka <boudah.talenka@gmail.com>
 * and published under the GNU General Public License.
 */


////////////////////////////
//                        //
//  GLOBAL CONFIGURATION  //
//                        //
////////////////////////////


/** @typedef {!number} */
var integer;


/**
 * Lower boundary for objects mass
 * @const
 * @type {number}
 */
var minimalMass = 1;


/**
 * Ratio between the radius of an object and its mass
 * @const
 * @type {number}
 */
var objectsDensity = 20;


/**
 * Minimal space between two objects (in pixels)
 * @const
 * @type {number}
 */
var objectsMargin = 9 * objectsDensity;


/**
 * Time step of the animation (in milliseconds).
 * @const
 * @type {number}
 */
var timeStep = 1;


/**
 * Context linked to the drawable canvas element.
 * @type {Object}
 */
var context;


/**
 * The ressource to perform asynchronous requests (AJAX)
 * @type {XMLHttpRequest}
 */
var ajax;


/**
 * Little dictionnary of predefined colors in "Red,Green,Blue" format
 * @type {Array.<integer, string>}
 * @const
 */
var predefinedColors = ['223,87,69', '40,207,174', '99,129,208', '138,219,76',
                        '205,167,31', '211,81,177', '93,161,72'];


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
 * List of vertex types
 * @const
 * @type {Array.<string>}
 */
var vertexTypes = ['Organization', 'People', 'Project'];



////////////////////
//                //
//  CURRENT DATA  //
//                //
////////////////////


/**
 * List of currently selected vertices.
 * @type {Array.<integer, integer>}
 */
var selectedVertices = [];


/**
 * Graph data.
 * @type {Object}
 */
var graph = {
              /**
               * @expose
               * @type {Object.<string, (string|Array)>}
               */
              metadata:
              {
                /** @expose */
                title: 'An untitled social graph',
                /** @expose */
                authors: ['Anonymous'],
                /** @expose */
                created: (new Date()).toGMTString(),
                /** @expose */
                visibility: 'private',
                /** @expose */
                license: 'COPYRIGHT'
              },
              /**
               * @type {Array.<Vertex>}
               * @expose
               */
              vertices: []
};


/**
 * The graph cipher key (must be kept from the server and from strangers).
 * @type {string}
 */
var graphKey;


///////////////////////////////////
//                               //
//  GRAPH, VERTICES AND VECTORS  //
//  DEFINITION AND MANIPULATION  //
//                               //
///////////////////////////////////



/**
 * Coordinates vector
 * @param {number} x Horizontal component.
 * @param {number} y Vertical component.
 * @return {Coords} Vector coordinates.
 * @constructor
 * @struct
 */
function Coords(x, y) {

  /**
   * Horizontal component.
   * @expose
   * @type {number}
   */
  this.x = x;

  /**
   * Vertical component.
   * @expose
   * @type {number}
   */
  this.y = y;

  /**
   * Returns the coords plus an other coords c
   * @param {Coords} c Other vector's coordinates.
   * @this {Coords}
   * @return {Coords} New vector's coordinates.
   */
  this.plus = function(c) {
    return coords(this.x + c.x, this.y + c.y);
  };

  /**
   * Returns the coords minus an other coords c
   * @param {Coords} c Other vector's coordinates.
   * @this {Coords}
   * @return {Coords} New vector's coordinates.
   */
  this.minus = function(c) {
    return coords(this.x - c.x, this.y - c.y);
  };

  /**
   * Multiplies the coords by a scalar
   * @param {number} k Multiplication factor.
   * @this {Coords}
   * @return {Coords} New vector's coordinates.
   */
  this.times = function(k) {
    return coords(this.x * k, this.y * k);
  };

  /**
   * Returns the scalar products of the coords with an other coords c
   * @param {Coords} c Other vector's coordinates.
   * @this {Coords}
   * @return {number} Product value.
   */
  this.scalar = function(c) {
    return this.x * c.x + this.y * c.y;
  };

  /**
   * Returns the coords norm, i.e. vector modulus.
   * @this {Coords}
   * @return {number} Vector norm.
   */
  this.norm = function() {
    return Math.sqrt(this.scalar(this));
  };

  /**
   * Returns the distance between this and c.
   * @param {Coords} c The second coords.
   * @this {Coords}
   * @return {number} The distance.
   */
  this.distance = function(c) {
    return this.minus(c).norm();
  };

  return this;
}


/**
 * @param {number} x Horizontal component.
 * @param {number} y Vertical component.
 * @return {Coords} Vector coordinates.
 */
function coords(x, y) {
  return new Coords(x, y);
}



/**
 * Graph vertex (also called node)
 * @param {Object} props Vertex properties (the same object w/o methods).
 * @return {Vertex} Vertex object.
 * @constructor
 * @struct
 */
function Vertex(props) {

  if (!props.members || !(props.members instanceof Array)) props.members = [];

  if (!props.position)
    props.position = coords((Math.random() - .5) * context.width,
                            (Math.random() - .5) * context.height);

  if (!props.color || typeof props.color !== 'string')
    props.color = predefinedColors[
                      Math.round(Math.random() * predefinedColors.length)];

  /** @type {string} */
  this.title = props.title;

  /** @type {string} */
  this.type = props.type;

  /** @type {{src: string, width: number, height: number}} */
  this.image = props.image;

  /** @type {string} */
  this.description = props.description;

  /** @type {Object.<string, string>} */
  this.details = props.details;

  /** @type {number} */
  this.mass = minimalMass + props.members.length;

  /** @type {number} */
  this.radius = Math.sqrt(this.mass) * objectsDensity;

  /** @type {Coords} */
  this.position = props.position;

  /** @type {Object.<string, string>} */
  this.links = props.links;

  /**
   * @expose
   * @type {Array.<number, Object>}
   */
  this.members = props.members;

  /** @type {string} */
  this.color = props.color;

  /**
   * Returns the distance from this vertex to the vertex n
   * @param {Vertex} v The other vertex.
   * @this {Coords}
   * @return {number} The distance (≥ 0).
   */
  this.distance = function(v) {
    return this.position.distance(v.position);
  };

  /**
   * Computes the speed of the node
   *
   * The node speed is determined by two attraction trap:
   * * Each node attracts other nodes of the same level,
   * * Each node is attracted by the center of the parent node.
   *
   * @this {Vertex}
   * @return {Coords} The speed vector.
   */
  this.speed = function() {

    /** @type {Coords} */
    var s = coords(0, 0);

    for (var v = 0, w = graph.vertices.length; v < w; v++)
    {
      /** @type {Vertex} */
      var n = vertex(graph.vertices[v]);

      if (n.title != this.title)
      {
        var x = n.distance(this) / (this.radius + n.radius + objectsMargin);

        /** @type {number} */
        var f = (x - 1) / (x * x);

        s = s.plus(n.position.minus(this.position).times(f / n.distance(this)));
      }
    }

    s = s.plus(this.position.times(-.002 * this.mass));

    return s;
  };

  /**
   * Updates the node's position after a time step, depending on their.
   * We use for this a simple <a href="//en.wikipedia.org/wiki/Euler_method">
   * Euler's method</a>.
   * @this {Vertex}
   * @return {Vertex} New vertex.
   */
  this.step = function() {

    this.position = this.position.plus(this.speed().times(timeStep));

    return this;
  };

  /**
   * Draw the vertex
   * @param {boolean} selected Whether the vertex is selected.
   * @this {Vertex}
   * @return {Vertex} The same vertex.
   */
  this.draw = function(selected) {

    /** @type {Coords} */
    var position = this.position.plus(context.center);

    /** @type {number} */
    var opacity = selected ? 1 : .6;

    /** @type {number} */
    var radius = this.radius;

    /** @type {integer} */
    var textSize = Math.ceil(2.5 * Math.sqrt(radius));

    context.beginPath();
    context.lineWidth = selected ? 3 : 1;
    context.fillStyle = 'rgba(' + this.color + ',' + (opacity / 2) + ')';
    context.strokeStyle = 'rgba(' + this.color + ',' + (opacity) + ')';

    // Circle for organizations (Optimization : Math.PI * 2 = 6.283185)
    if (this.type == vertexTypes[0])
      context.arc(position.x, position.y, radius, 0, 6.283185);

    // Square for people
    else if (this.type == vertexTypes[1])
      this.path([position.plus(coords(- radius, - radius)),
                    position.plus(coords(radius, - radius)),
                    position.plus(coords(radius, radius)),
                    position.plus(coords(- radius, radius))]);

    // Diamond for projects (and others if any)
    else this.path([position.plus(coords(- radius, 0)),
                    position.plus(coords(0, - radius)),
                    position.plus(coords(radius, 0)),
                    position.plus(coords(0, radius))]);

    context.closePath();
    context.stroke();
    context.fill();

    context.fillStyle = '#000';
    context.font = '600 ' + textSize + 'px Helvetica';
    context.textAlign = 'center';
    context.fillText(this.title, position.x, position.y + textSize / 4);

    return this;
  };

  /**
   * @param {Vertex} v Targeted vertex.
   * @param {boolean} selected Whether the vertex is selected.
   * @this {Vertex}
   * @return {Vertex} The same vertex.
   */
  this.drawLinkTo = function(v, selected) {

    /** @type {Coords} */
    var position = this.position.plus(context.center);

    /** @type {Coords} */
    var target = v.position.plus(context.center);

    /** @type {Coords} */
    var axis = target.minus(position);

    /** @type {number} */
    var distance = position.distance(target);

    /** @type {Coords} */
    var arrowStart = axis.times(this.radius / distance).plus(position);

    /** @type {Coords} */
    var arrowEnd = axis.times(-1 * v.radius / distance).plus(target);

    /** @type {Coords} */
    var arrowWing1 = coords(axis.x - axis.y, axis.y + axis.x)
                    .times(-.5 * 15 / distance).plus(arrowEnd);

    /** @type {Coords} */
    var arrowWing2 = coords(axis.x + axis.y, axis.y - axis.x)
                    .times(-.5 * 15 / distance).plus(arrowEnd);

    context.beginPath();
    context.lineWidth = selected ? 3 : 1;
    context.strokeStyle = 'rgba(' + this.color + ',.8)';

    this.path([arrowStart, arrowEnd, arrowWing1]).path([arrowEnd, arrowWing2]);

    context.stroke();

    return this;
  };

  /**
   * @param {Array.<Coords>} coordsList Coords list of path to draw.
   * @this {Vertex}
   * @return {Vertex} The same vertex.
   */
  this.path = function(coordsList) {

    for (var c = 0, l = coordsList.length; c < l; c++)
    {
      if (c == 0) context.moveTo(coordsList[c].x, coordsList[c].y);
      else context.lineTo(coordsList[c].x, coordsList[c].y);
    }

    return this;
  };

  return this;
}


/**
 * @param {Object} props Vertex properties (the same object w/o methods).
 * @return {Vertex} Vertex object.
 */
function vertex(props) {
  return new Vertex(props);
}


/**
 * Search the graph for a vertex called "title" and return its index
 * @param {string} title The vertex title.
 * @return {integer} the index of the found node in the graph array.
 */
function getVertexByTitle(title) {

  for (var v = 0, w = graph.vertices.length; v < w; v++)
    if (graph.vertices[v].title == title) return v;

    return -1;
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
          vertex(graph.vertices[getVertexByTitle(l)]), selected);
  }

  setTimeout(animate, timeStep);
}


/**
 * Adjust the canvas size to the window
 */
function setCanvasSize() {

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
  window.setTimeout(setCanvasSize, 1000);
}


/**
 * Search the graph for the closest vertex from the coords "c"
 * @param {Coords} c The origin vector.
 * @return {integer} The closest vertex index in the graph array.
 */
function getClosestTo(c) {

  /** @type {integer} */
  var closest;

  /** @type {number} */
  var dist = Infinity;

  /** @type {number} */
  var ndist;

  for (var v = 0, w = graph.vertices.length; v < w; v++)
  {
    /** @type {Vertex} */
    var nvertex = vertex(graph.vertices[v]);
    ndist = c.minus(nvertex.position).norm();

    if (ndist < dist)
    {
      dist = ndist;
      closest = v;
    }
  }

  return closest;
}


/**
 * @param {Coords} c The coords searched.
 * @return {integer} The vertex index, if any, located here.
 */
function getVertexByCoords(c) {

  for (var v = 0, nv = graph.vertices.length; v < nv; v++)
  {
    /** @type {Vertex} */
    var w = vertex(graph.vertices[v]);

    if (c.minus(w.position).norm() < w.radius) return v;
  }

  return -1;
}


/**
 * User Interface click event
 */
function selectVertex() {

  /** @type {integer} */
  var lastSelected = getVertexByCoords(context.mouse);

  if (lastSelected < 0)
  {
    closePanel();
    selectedVertices = [];
  }
  else selectedVertices = [lastSelected];
}


/////////////////////////////////////
//                                 //
//  USER INTERFACE MENU AND PANEL  //
//                                 //
/////////////////////////////////////


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
  getId('New').onclick = addNewVertex;
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
  showPanel('Edit graph options', '');
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
function addNewVertex() {

  /** @type {integer} */
  var newVertexTitle = 1;

  while (getVertexByTitle('#' + newVertexTitle) != -1)
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
 * Opens the Import panel
 */
function savePanel() {

  /** @type {Object} */
  var licenses = {};

  for (var i = 0, j = predefinedLicenses.length; i < j; i++)
    licenses[predefinedLicenses[i].id] = predefinedLicenses[i].name;

  showPanel('Save this graph',
            button('saveOffline', 'Save on my computer') + '<hr>' +
            button('saveOnline', 'Save on the web') +
            ' with the password <input type=password id=graphPass value="">' +
            ' and visible to </label> ' +
            select('graphVisibility',
                  {'private': 'me (with the password)',
                  'protected': 'those who have the link',
                  'public': 'everyone (public)'}, graph.metadata.visibility) +
            '. Publish under ' +
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


////////////////////////
//                    //
//  DOM MANIPULATION  //
//                    //
////////////////////////


/**
 * Alias of document.getElementById()
 * @param {string} id DOM Node identifier.
 * @return {Node} DOM Node.
 */
function getId(id) {
  return document.getElementById(id);
}


/**
 * Create a DOM Element and append it to the DOM body
 * @param {string} tagName The < tag name > .
 * @param {string} id The Node identifier.
 * @return {Node} The DOM Node.
 */
function create(tagName, id) {

  var node = document.createElement(tagName);

  node.setAttribute('id', id);

  document.body.appendChild(node);

  return node;
}


/**
 * Tracks the mouse movements
 * @param {Event} e DOM Mouse Event.
 */
function trackMouse(e) {
  context.mouse = coords(e.clientX, e.clientY).minus(context.center);
}


/**
 * @param {string} id The select tag identifier.
 * @param {Object.<string>} options Options {"value": "label"...} or ["value"].
 * @param {string=} opt_selected The selected item.
 * @return {string} html select tag.
 */
function select(id, options, opt_selected) {

  var html = '';

  for (var val in options)
  {
    var value = (options instanceof Array) ? options[val] : val;

    html += '<option value="' + value + '"' +
                ((value == opt_selected) ? 'selected=selected' : '') + '>' +
                options[val] +
            '</option>';
  }

  return tag('select', html, id);
}


/**
 * @param {string} tagName Tag name.
 * @param {string=} opt_innerHTML Inner HTML.
 * @param {string=} opt_id Node identifier.
 * @return {string} HTML for the tag.
 */
function tag(tagName, opt_innerHTML, opt_id) {
  return '<' + tagName + (opt_id ? ' id=' + opt_id : '') + '>' +
             (opt_innerHTML ? opt_innerHTML : '') +
          '</' + tagName + '>';
}


/**
 * @param {string} id Node Identifier.
 * @param {string=} opt_label Button title.
 * @return {string} The Html button.
 */
function button(id, opt_label) {
  return tag('button', opt_label ? opt_label : id, id);
}


/////////////////////////////
//                         //
//  APPLICATION BOOTSTRAP  //
//                         //
/////////////////////////////


/** Start animation */
window.onload = function() {

  // We create and stylish the canvas where we'll draw the animation
  var canvas = create('canvas', 'canvas');

  /** @type {number} */
  var height = window.innerHeight;

  /** @type {number} */
  var width = window.innerWidth;

  context = canvas.getContext('2d');
  context.width = canvas.width = width;
  context.height = canvas.height = height;
  canvas.onclick = selectVertex;
  canvas.ondblclick = editPanel;
  context.center = coords(width / 2, height / 2);
  context.zoom = 1;
  context.mouse = coords(0, 0);

  // Now we split url into 3 parts like this: "PATH ? FILE # KEY"
  /** @type {string||Array.<string>} */
  var pieces = document.location.href.split('#');

  if (pieces instanceof Array) {

    graphKey = pieces[1];
    pieces = pieces[0];
  }

  pieces = pieces.split('?');
  if (pieces instanceof Array && pieces.length == 2) {

    /** @type {string} */
    var graphId = pieces[1];

    if (graphId.length > 2 && /^\w+$/.test(graphId))
      importFromUrl(SocialGraphUrl + 'get?' + pieces[1]);
  }

  showMenu();

  animate();

  window.onmousemove = trackMouse;

  setCanvasSize();
};
