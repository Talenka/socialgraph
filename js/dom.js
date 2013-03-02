/**
 * SocialGraph (socialgraph.boudah.pl)
 *
 * Created by Boudah Talenka <boudah.talenka@gmail.com>
 * and published under the GNU General Public License.
 */


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
 * Returns html for selection field with the specified options.
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
 * Returns html fot a tag with content and identifier.
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
 * Returns html for button with specified id (and label, if different).
 * @param {string} id Node Identifier.
 * @param {string=} opt_label Button title.
 * @return {string} The Html button.
 */
function button(id, opt_label) {
  return tag('button', opt_label ? opt_label : id, id);
}
