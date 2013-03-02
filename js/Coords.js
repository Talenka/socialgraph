/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * Created by Boudah Talenka <boudah.talenka@gmail.com>
 * and published under the GNU General Public License.
 */



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
