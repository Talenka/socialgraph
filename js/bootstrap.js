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


/**
 * New data type definition to clarify JsDoc. Actually alias os number.
 * @typedef {!number}
 */
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
                license: 'COPYRIGHT',
                /** @expose */
                alias: 'untitled'
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

  autoAdjustCanvasSize();
};
