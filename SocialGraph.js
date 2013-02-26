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
 * Licences list
 * @type {Array.<integer, {id: string, name: string, url: string}>}
 * @const
 */
var predefinedLicenses = [
    {
        id: 'GNU-GPL',
        name: 'GNU General Public License',
        url: 'https://www.gnu.org/licenses/gpl.html'
    },
    {
        id: 'GNU-FDL',
        name: 'GNU Free Documentation License',
        url: 'https://www.gnu.org/licenses/fdl.html'
    },
    {
        id: 'CC-BY-SA',
        name: 'Creative Commons Attribution and Share-alike License',
        url: 'https://creativecommons.org/licenses/by-sa/3.0/'
    },
    {
        id: 'CC-BY',
        name: 'Creative Commons Attribution',
        url: 'https://creativecommons.org/licenses/by/3.0/'
    },
    {
        id: 'CC-BY-NC-SA',
        name: 'Creative Commons Attribution, Non-commercial and Share-alike',
        url: 'https://creativecommons.org/licenses/by-nc-sa/3.0/'
    },
    {
        id: 'CC-BY-NC-ND',
        name: 'Creative Commons Attribution, Non-commercial and No-derivatives',
        url: 'https://creativecommons.org/licenses/by-nc-nd/3.0/'
    },
    {
        id: 'CC-0',
        name: 'Creative Commons Public Domain Dedication',
        url: 'https://creativecommons.org/publicdomain/zero/1.0/'
    },
    {
        id: 'COPYRIGHT',
        name: 'Copyright ' + (new Date).getFullYear() + '. All right reserved',
        url: 'https://en.wikipedia.org/wiki/Copyright'
    },
    {
        id: 'MIT',
        name: 'MIT Licence',
        url: 'http://opensource.org/licenses/MIT'
    },
    {
        id: 'WTFPL',
        name: 'Do What The Fuck You Want License',
        url: 'http://www.wtfpl.net/about/'
    }
];

/**
 * @const
 * @type {string}
 */
var SocialGraphUrl = document.location.protocol + '//socialgraph.boudah.pl/';

/**
 * @const
 * @type {string}
 */
var githubProjectUrl = '//github.com/talenka/socialgraph/';

/**
 * @const
 * @type {string}
 */
var linksTarget = 'target=_blank';

/**
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
     * @type Array.<Vertex>
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
     * @type {number} */
    this.x = x;

    /**
     * Vertical component.
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
    {
        /** @type {integer} */
        var nColor = Math.round(Math.random() * predefinedColors.length);

        props.color = predefinedColors[nColor];
    }

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
                var x = n.distance(this) /
                        (this.radius + n.radius + objectsMargin);

                /** @type {number} */
                var f = (x - 1) / (x * x);

                s = s.plus(n.position.minus(this.position)
                    .times(f / n.distance(this)));
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

        /** @type {integer} */
        var textSize = Math.ceil(2.5 * Math.sqrt(this.radius));

        context.beginPath();
        context.lineWidth = selected ? 3 : 1;
        context.fillStyle = 'rgba(' + this.color + ',' + (opacity / 2) + ')';
        context.strokeStyle = 'rgba(' + this.color + ',' + (opacity) + ')';

        if (this.type === vertexTypes[0]) { // Circle for organizations
            // Optimization : Math.PI * 2 = 6.283185
            context.arc(position.x, position.y, this.radius, 0, 6.283185);

        }
        else if (this.type === vertexTypes[1]) { // Square for people
            context.moveTo(position.x - this.radius, position.y - this.radius);
            context.lineTo(position.x + this.radius, position.y - this.radius);
            context.lineTo(position.x + this.radius, position.y + this.radius);
            context.lineTo(position.x - this.radius, position.y + this.radius);
        }
        else if (this.type === vertexTypes[2]) { // Diamond for projects
            context.moveTo(position.x - this.radius, position.y);
            context.lineTo(position.x, position.y - this.radius);
            context.lineTo(position.x + this.radius, position.y);
            context.lineTo(position.x, position.y + this.radius);
        }

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
        context.moveTo(arrowStart.x, arrowStart.y);
        context.strokeStyle = 'rgba(' + this.color + ',.8)';
        context.lineTo(arrowEnd.x, arrowEnd.y);
        context.lineTo(arrowWing1.x, arrowWing1.y);
        context.moveTo(arrowEnd.x, arrowEnd.y);
        context.lineTo(arrowWing2.x, arrowWing2.y);
        context.stroke();

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
        if (graph.vertices[v].title === title) return v;

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
    else {

        menu = create('nav');
        menu.setAttribute('id', 'menu');
    }

    menu.innerHTML = '<strong id=graphTitle>' + graph.metadata.title +
                    '</strong>' +
                    ' by <em>' + graph.metadata.authors.join() + '</em>' +
                    ' (' + licenseLink(graph.metadata.license) + ')' +
                    '<button id=help>Help ?</button>' +
                    '<button id=share>Share</button>' +
                    '<button id=import>Import</button>' +
                    '<button id=save>Save</button>' +
                    '<button id=new>+ New</button>';

    document.title = graph.metadata.title + ' | SocialGraph';

    // We associate actions to buttons
    getId('new').onclick = addNewVertex;
    getId('save').onclick = savePanel;
    getId('import').onclick = importPanel;
    getId('share').onclick = sharePanel;
    getId('help').onclick = helpPanel;
    getId('graphTitle').onclick = editMetaData;
}

/**
 * Edit meta data of the graph
 */
function editMetaData() {

}

/**
 * Shows a panel
 * @param {string} title The panel name.
 * @param {string} content HTML panel content.
 */
function showPanel(title, content) {

    content = '<button id=close class=right>Close</button>' +
                '<h1>' + title + '</h1>' + content;

    if (!getId('panel'))
    {
        /** @type {Node} */
        var panel = create('section');
        panel.setAttribute('id', 'panel');
    }

    getId('panel').innerHTML = content;
    getId('close').onclick = closePanel;
}

/**
 * @param {string} licenseId The license identifier.
 * @return {string} The license link.
 */
function licenseLink(licenseId)
{
    for (var i = 0, j = predefinedLicenses.length; i < j; i++)
        if (predefinedLicenses[i].id === licenseId)
        {
            return '<a href="' + predefinedLicenses[i].url +
                    '" ' + linksTarget + ' title="' +
                    predefinedLicenses[i].name + '" rel=license>' +
                    licenseId + '</a>';
        }

    return '';
}

/**
 * Closes the opened panel
 */
function closePanel() {

    /** @type {Node} */
    var panel = getId('panel');

    if (panel) document.body.removeChild(panel);
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

    graph.vertices.push(vertex({title: '#' + newVertexTitle,
                            type: vertexTypes[0],
                            position: context.mouse}));

    selectedVertices = [graph.vertices.length - 1];

    editPanel();
}

/**
 * Opens the Import panel
 */
function savePanel() {

    /** @type {string} */
    var licensesHtmlSelect = '<select id=graphLicense>';

    for (var i = 0, j = predefinedLicenses.length; i < j; i++)
    {
        licensesHtmlSelect += '<option value="' +
                                predefinedLicenses[i].id + '">' +
                                predefinedLicenses[i].name +
                                '</option>';
    }

    licensesHtmlSelect += '</select>';

    showPanel('Save this graph',
            '<button id=saveOffline>Save on my computer</button>' +
            '<hr />' +
            '<button id=saveOnline>Save on the web</button>' +
            ' with the password <input type=password id=graphPass value="">' +
            ' and visible to </label> ' +
            '<select id=graphVisibility>' +
                '<option value=private>me (with the password)</option>' +
                '<option value=protected>those who have the link</option>' +
                '<option value=public>everyone (public)</option>' +
            '</select>' +
                '. Publish under ' +
                    licensesHtmlSelect +
            '<hr />' +
        '<button id=download>Download</button> the ' +
            '<select id=exportData>' +
                '<option value=Graph>Graph</option>' +
                '<option value=contacts>Contact list</option>' +
            '</select>' +
        ' in the ' +
            '<select id=exportFormat>' +
                '<option value=json>JSON</option>' +
                '<option value=atom>Atom</option>' +
            '</select>' +
        ' format.');

    getId('download').onclick = download;
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

    if (selectedVertices.length === 0) return;
    else
        /** @type {Vertex} */
        var v = graph.vertices[selectedVertices[0]];

    /** @type {string} */
    var editOptions = '<label for=vertexType>Type:</label> ' +
        '<select id=vertexType>';

    for (var i = 0, j = vertexTypes.length; i < j; i++)
        editOptions += '<option value=' + vertexTypes[i] +
                        ((vertexTypes[i] == v.type) ?
                            ' selected=selected' :
                            '') +
                        '>' + vertexTypes[i] + '</option>';

    editOptions += '</select>' +
        '<br />' +
        '<label for=vertexTitle>Title:</label> ' +
        '<input type=text maxlength=30 id=vertexTitle ' +
            'value="' + v.title + '"><br />' +
        '<label for=vertexDescription>Description:</label> ' +
        '<input type=text maxlength=30 id=vertexDescription ' +
            'value="' + v.description + '">';

    showPanel('Edit this element', editOptions);

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

    if (exportData === 'Graph') {
        if (exportFormat === 'json') {
            raw = window.JSON.stringify(graph);
        }
        else if (exportFormat === 'atom') {

            raw = '<?xml version="1.0" encoding="utf-8"?>' +
                '<feed xmlns="http://www.w3.org/2005/Atom">' +
                '<title>' + graph.metadata.title + '</title>' +
                '<subtitle>A social graph</subtitle>' +
                '<link href="' + SocialGraphUrl + '"/>' +
                '<updated>' + graph.metadata.created + '</updated>' +
                '<author><name>' + graph.metadata.authors[0] +
                '</name></author>';

            for (var i = 0, j = graph.vertices.length; i < j; i++)
            {
                raw += '<entry>' +
                    '<title>' + graph.vertices[i].title + '</title>' +
                    '<link href="' + SocialGraphUrl + '"/>' +
                    '<updated>' + graph.metadata.created + '</updated>' +
                    '<summary>' + graph.vertices[i].description + '</summary>' +
                    '</entry>';
            }

            raw += '</feed>';
        }
    }

    if (raw === '')
        displayError('this function is not yet implemented, sorry...');
    else {
        showPanel('Output', '<textarea>' + raw + '</textarea>');
    }
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
        if (ajax.readyState === 4) {

            if (ajax.status === 200) callback(ajax.responseText);

            else {
                ajax.abort();
                displayError('the server do not respond properly (ajax)');
            }
        }
    };
}

/**
 * @param {string} url The url containing JSON data.
 */
function importFromUrl(url)
{
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


/////////////////////
//                 //
//  MISCELLANEOUS  //
//                 //
/////////////////////


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
 * @return {Node} The DOM Node.
 */
function create(tagName)
{
    /** @type {Node} */
    var node = document.createElement(tagName);

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


/////////////////////////////
//                         //
//  APPLICATION BOOTSTRAP  //
//                         //
/////////////////////////////


/** Start animation */
window.onload = function() {

    // We create and stylish the canvas where we'll draw the animation
    var canvas = create('canvas');

    /** @type {number} */
    var height = window.innerHeight;

    /** @type {number} */
    var width = window.innerWidth;

    canvas.setAttribute('id', 'canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.onclick = selectVertex;
    canvas.ondblclick = editPanel;

    // We create and stylish the draw context
    context = canvas.getContext('2d');
    context.width = width;
    context.height = height;
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
    if (pieces instanceof Array && pieces.length === 2) {
        /** @type {string} */
        var graphId = pieces[1];

        if (graphId.length > 2 && /^\w+$/.test(graphId))
            importFromUrl(SocialGraphUrl + 'get?' + pieces[1]);
    }

    showMenu();

    // We start the animation
    animate();

    window.onmousemove = trackMouse;

    // We adjust the size of the canvas
    setCanvasSize();
};
