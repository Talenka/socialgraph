/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * Created by Boudah Talenka <boudah.talenka@gmail.com>
 * and published under the GNU General Public License.
 */


/**
 * Little dictionnary of predefined colors in "Red,Green,Blue" format
 * @type {Array.<string>}
 * @const
 */
var predefinedColors = ['223,87,69', '40,207,174', '99,129,208', '138,219,76',
                        '205,167,31', '211,81,177', '93,161,72'];


/**
 * List of vertex types
 * @const
 * @type {Array.<string>}
 */
var vertexTypes = ['Organization', 'People', 'Project'];



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

  /**
   * @expose
   * @type {number}
   */
  this.mass = minimalMass + props.members.length;

  /**
   * @expose
   * @type {number}
   */
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
   * 1) Each node attracts other nodes of the same level,
   * 2) Each node is attracted by the center of the parent node.
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
function getVertexIdByTitle(title) {

  for (var v = 0, w = graph.vertices.length; v < w; v++)
    if (graph.vertices[v].title == title) return v;

    return -1;
}


/**
 * @param {Coords} c The coords searched.
 * @return {integer} The vertex index, if any, located here.
 */
function getVertexIdByCoords(c) {

  for (var v = 0, nv = graph.vertices.length; v < nv; v++)
  {
    /** @type {Vertex} */
    var w = vertex(graph.vertices[v]);

    if (c.minus(w.position).norm() < w.radius) return v;
  }

  return -1;
}
