/*
    Copyright 2008-2014
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software dual licensed under the GNU LGPL or MIT License.

    You can redistribute it and/or modify it under the terms of the

      * GNU Lesser General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version
      OR
      * MIT License: https://github.com/jsxgraph/jsxgraph/blob/master/LICENSE.MIT

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License and
    the MIT License along with JSXGraph. If not, see <http://www.gnu.org/licenses/>
    and <http://opensource.org/licenses/MIT/>.
 */


/*global JXG: true, define: true, window: true*/
/*jslint nomen: true, plusplus: true*/

/* depends:
 jxg
 base/constants
 base/coords
 base/element
 parser/geonext
 math/statistics
 utils/env
 utils/type
 */

/**
 * @fileoverview In this file the Text element is defined.
 */

define([
    'jxg', 'base/constants', 'base/coords', 'base/element', 'parser/geonext', 'math/statistics', 'utils/env', 'utils/type', 'math/math'
], function (JXG, Const, Coords, GeometryElement, GeonextParser, Statistics, Env, Type, Mat) {

    "use strict";

    var priv = {
            HTMLSliderInputEventHandler: function () {
                this._val = parseFloat(this.rendNodeRange.value);
                this.rendNodeOut.value = this.rendNodeRange.value;
                this.board.update();
            }
        };

    /**
     * Construct and handle texts.
     * @class Text: On creation the GEONExT syntax
     * of <value>-terms
     * are converted into JavaScript syntax.
     * The coordinates can be relative to the coordinates of an element "element".
     * @constructor
     * @return A new geometry element Text
     */
    JXG.Text = function (board, content, coords, attributes) {
        this.constructor(board, attributes, Const.OBJECT_TYPE_TEXT, Const.OBJECT_CLASS_TEXT);

        var i, anchor;

        this.content = '';
        this.plaintext = '';
        this.plaintextOld = null;
        this.orgText = '';

        this.isDraggable = false;
        this.needsSizeUpdate = false;

        this.element = this.board.select(attributes.anchor);

        this.hiddenByParent = false;

        /**
         * Stores the groups of this point in an array of Group.
         * @type array
         * @see JXG.Group
         * @private
         */
        this.group = [];

        if (this.element) {
            if (this.visProp.islabel) {
                this.relativeCoords = new Coords(Const.COORDS_BY_SCREEN, [parseFloat(coords[0]), parseFloat(coords[1])], this.board);
            } else {
                this.relativeCoords = new Coords(Const.COORDS_BY_USER, [parseFloat(coords[0]), parseFloat(coords[1])], this.board);
            }
            this.element.addChild(this);

            this.X = function () {
                var sx, coords, anchor;

                if (this.visProp.islabel) {
                    sx =  parseFloat(this.visProp.offset[0]);
                    anchor = this.element.getLabelAnchor();
                    coords = new Coords(Const.COORDS_BY_SCREEN, [sx + this.relativeCoords.scrCoords[1] + anchor.scrCoords[1], 0], this.board);

                    return coords.usrCoords[1];
                }

                anchor = this.element.getTextAnchor();
                return this.relativeCoords.usrCoords[1] + anchor.usrCoords[1];
            };

            this.Y = function () {
                var sy, coords, anchor;

                if (this.visProp.islabel) {
                    sy = -parseFloat(this.visProp.offset[1]);
                    anchor = this.element.getLabelAnchor();
                    coords = new Coords(Const.COORDS_BY_SCREEN, [0, sy + this.relativeCoords.scrCoords[2] + anchor.scrCoords[2]], this.board);

                    return coords.usrCoords[2];
                }

                anchor = this.element.getTextAnchor();
                return this.relativeCoords.usrCoords[2] + anchor.usrCoords[2];
            };

            this.coords = new Coords(Const.COORDS_BY_SCREEN, [0, 0], this.board);
            this.isDraggable = true;
        } else {
            if (Type.isNumber(coords[0]) && Type.isNumber(coords[1])) {
                this.isDraggable = true;
            }
            this.coords = new Coords(Const.COORDS_BY_USER, coords.slice(0, 2), this.board);
            this.X = function() { return this.coords.usrCoords[1]; };
            this.Y = function() { return this.coords.usrCoords[2]; };
        }

        this.Z = Type.createFunction(1, this.board, '');
        this.size = [1.0, 1.0];
        this.id = this.board.setId(this, 'T');

        // Set text before drawing
        this._setUpdateText(content);
        this.updateText();

        this.board.renderer.drawText(this);

        if (!this.visProp.visible) {
            this.board.renderer.hide(this);
        }

        if (typeof this.content === 'string') {
            this.notifyParents(this.content);
        }

        this.elType = 'text';

        this.methodMap = Type.deepCopy(this.methodMap, {
            setText: 'setTextJessieCode',
            free: 'free',
            move: 'setCoords'
        });

        return this;
    };

    JXG.Text.prototype = new GeometryElement();

    JXG.extend(JXG.Text.prototype, /** @lends JXG.Text.prototype */ {
        /**
         * @private
         * Test if the the screen coordinates (x,y) are in a small stripe
         * at the left side or at the right side of the text.
         * Sensitivity is set in this.board.options.precision.hasPoint.
         * If dragarea is set to 'all' (default), tests if the the screen 
	     * coordinates (x,y) are in within the text boundary.
         * @param {Number} x
         * @param {Number} y
         * @return {Boolean}
         */
        hasPoint: function (x, y) {
            var lft, rt, top, bot,
                r = this.board.options.precision.hasPoint;

            if (this.transformations.length > 0) {
                /**
                 * Transform the mouse/touch coordinates
                 * back to the original position of the text.
                 */
                lft = Mat.matVecMult(Mat.inverse(this.board.renderer.joinTransforms(this, this.transformations)), [1, x, y]);
                x = lft[1];
                y = lft[2];
            }

            if (this.visProp.anchorx === 'right') {
                lft = this.coords.scrCoords[1] - this.size[0];
            } else if (this.visProp.anchorx === 'middle') {
                lft = this.coords.scrCoords[1] - 0.5 * this.size[0];
            } else {
                lft = this.coords.scrCoords[1];
            }
            rt = lft + this.size[0];

            if (this.visProp.anchory === 'top') {
                bot = this.coords.scrCoords[2] + this.size[1];
            } else if (this.visProp.anchory === 'middle') {
                bot = this.coords.scrCoords[2] + 0.5 * this.size[1];
            } else {
                bot = this.coords.scrCoords[2];
            }
            top = bot - this.size[1];

            if (this.visProp.dragarea === 'all') {
                return x >= lft - r && x < rt + r && y >= top - r  && y <= bot + r;
            }

            return (y >= top - r && y <= bot + r) &&
                ((x >= lft - r  && x <= lft + 2 * r) ||
                (x >= rt - 2 * r && x <= rt + r));
        },

        /**
         * This sets the updateText function of this element that depending on the type of text content passed.
         * Used by {@link JXG.Text#_setText} and {@link JXG.Text} constructor.
         * @param {String|Function|Number} text
         * @private
         */
        _setUpdateText: function (text) {
            var updateText;
            
            this.orgText = text;
            if (typeof text === 'function') {
                this.updateText = function () {
                    if (this.visProp.parse && !this.visProp.usemathjax) {
                        this.plaintext = this.replaceSub(this.replaceSup(this.convertGeonext2CSS(text())));
                    } else {
                        this.plaintext = text();
                    }
                };
            } else if (Type.isString(text) && !this.visProp.parse) {
                this.updateText = function () {
                    this.plaintext = text;
                };
            } else {
                if (Type.isNumber(text)) {
                    this.content = text.toFixed(this.visProp.digits);
                } else {
                    if (this.visProp.useasciimathml) {
                        // Convert via ASCIIMathML
                        this.content = "'`" + text + "`'";
                    } else if (this.visProp.usemathjax) {
                        this.content = "'" + text + "'";
                    } else {
                        // Converts GEONExT syntax into JavaScript string
                        this.content = this.generateTerm(text);
                    }
                }
                updateText = this.board.jc.snippet(this.content, true, '', false);
                this.updateText = function () {
                    this.plaintext = updateText();
                };
            }
        },

        /**
         * Defines new content. This is used by {@link JXG.Text#setTextJessieCode} and {@link JXG.Text#setText}. This is required because
         * JessieCode needs to filter all Texts inserted into the DOM and thus has to replace setText by setTextJessieCode.
         * @param {String|Function|Number} text
         * @return {JXG.Text}
         * @private
         */
        _setText: function (text) {
            this._setUpdateText(text);

            // First evaluation of the string.
            // We need this for display='internal' and Canvas
            this.updateText();
            this.prepareUpdate().update().updateRenderer();

            // We do not call updateSize for the infobox to speed up rendering
            if (!this.board.infobox || this.id !== this.board.infobox.id) {
                this.updateSize();    // updateSize() is called at least once.
            }

            return this;
        },

        /**
         * Defines new content but converts &lt; and &gt; to HTML entities before updating the DOM.
         * @param {String|function} text
         */
        setTextJessieCode: function (text) {
            var s;

            this.visProp.castext = text;

            if (typeof text === 'function') {
                s = function () {
                    return Type.sanitizeHTML(text());
                };
            } else {
                if (Type.isNumber(text)) {
                    s = text;
                } else {
                    s = Type.sanitizeHTML(text);
                }
            }

            return this._setText(s);
        },

        /**
         * Defines new content.
         * @param {String|function} text
         * @return {JXG.Text} Reference to the text object.
         */
        setText: function (text) {
            return this._setText(text);
        },

        /**
         * Recompute the width and the height of the text box.
         * Update array this.size with pixel values.
         * The result may differ from browser to browser
         * by some pixels.
         * In canvas an old IEs we use a very crude estimation of the dimensions of
         * the textbox.
         * In JSXGraph this.size is necessary for applying rotations in IE and
         * for aligning text.
         */
        updateSize: function () {
            var tmp, s, that;

            if (!Env.isBrowser || this.board.renderer.type === 'no') {
                return this;
            }

            /**
             * offsetWidth and offsetHeight seem to be supported for internal vml elements by IE10+ in IE8 mode.
             */
            if (this.visProp.display === 'html' || this.board.renderer.type === 'vml') {
                if (JXG.exists(this.rendNode.offsetWidth)) {
                    s = [this.rendNode.offsetWidth, this.rendNode.offsetHeight];
                    if (s[0] === 0 && s[1] === 0) { // Some browsers need some time to set offsetWidth and offsetHeight
                        that = this;
                        window.setTimeout(function () {
                            that.size = [that.rendNode.offsetWidth, that.rendNode.offsetHeight];
                        }, 0);
                    } else {
                        this.size = s;
                    }
                } else {
                    this.size = this.crudeSizeEstimate();
                }
            } else if (this.visProp.display === 'internal') {
                if (this.board.renderer.type === 'svg') {
                    try {
                        tmp = this.rendNode.getBBox();
                        this.size = [tmp.width, tmp.height];
                    } catch (e) {}
                } else if (this.board.renderer.type === 'canvas') {
                    this.size = this.crudeSizeEstimate();
                }
            }

            return this;
        },

        /**
         * A very crude estimation of the dimensions of the textbox in case nothing else is available.
         * @return {Array}
         */
        crudeSizeEstimate: function () {
            return [parseFloat(this.visProp.fontsize) * this.plaintext.length * 0.45, parseFloat(this.visProp.fontsize) * 0.9];
        },

        /**
         * Decode unicode entities into characters.
         * @param {String} string
         * @returns {String}
         */
        utf8_decode : function (string) {
            return string.replace(/&#x(\w+);/g, function (m, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            });
        },

        /**
         * Replace _{} by &lt;sub&gt;
         * @param {String} te String containing _{}.
         * @returns {String} Given string with _{} replaced by &lt;sub&gt;.
         */
        replaceSub: function (te) {
            if (!te.indexOf) {
                return te;
            }

            var j,
                i = te.indexOf('_{');

            // the regexp in here are not used for filtering but to provide some kind of sugar for label creation,
            // i.e. replacing _{...} with <sub>...</sub>. What is passed would get out anyway.
            /*jslint regexp: true*/

            while (i >= 0) {
                te = te.substr(0, i) + te.substr(i).replace(/_\{/, '<sub>');
                j = te.substr(i).indexOf('}');
                if (j >= 0) {
                    te = te.substr(0, j) + te.substr(j).replace(/\}/, '</sub>');
                }
                i = te.indexOf('_{');
            }

            i = te.indexOf('_');
            while (i >= 0) {
                te = te.substr(0, i) + te.substr(i).replace(/_(.?)/, '<sub>$1</sub>');
                i = te.indexOf('_');
            }

            return te;
        },

        /**
         * Replace ^{} by &lt;sup&gt;
         * @param {String} te String containing ^{}.
         * @returns {String} Given string with ^{} replaced by &lt;sup&gt;.
         */
        replaceSup: function (te) {
            if (!te.indexOf) {
                return te;
            }

            var j,
                i = te.indexOf('^{');

            // the regexp in here are not used for filtering but to provide some kind of sugar for label creation,
            // i.e. replacing ^{...} with <sup>...</sup>. What is passed would get out anyway.
            /*jslint regexp: true*/

            while (i >= 0) {
                te = te.substr(0, i) + te.substr(i).replace(/\^\{/, '<sup>');
                j = te.substr(i).indexOf('}');
                if (j >= 0) {
                    te = te.substr(0, j) + te.substr(j).replace(/\}/, '</sup>');
                }
                i = te.indexOf('^{');
            }

            i = te.indexOf('^');
            while (i >= 0) {
                te = te.substr(0, i) + te.substr(i).replace(/\^(.?)/, '<sup>$1</sup>');
                i = te.indexOf('^');
            }

            return te;
        },

        /**
         * Return the width of the text element.
         * @return {Array} [width, height] in pixel
         */
        getSize: function () {
            return this.size;
        },

        /**
         * Move the text to new coordinates.
         * @param {number} x
         * @param {number} y
         * @return {object} reference to the text object.
         */
        setCoords: function (x, y) {
            var coordsAnchor, dx, dy;
            if (Type.isArray(x) && x.length > 1) {
                y = x[1];
                x = x[0];
            }

            if (this.visProp.islabel && Type.exists(this.element)) {
                coordsAnchor = this.element.getLabelAnchor();
                dx = (x - coordsAnchor.usrCoords[1]) * this.board.unitX;
                dy = -(y - coordsAnchor.usrCoords[2]) * this.board.unitY;

                this.relativeCoords.setCoordinates(Const.COORDS_BY_SCREEN, [dx, dy]);
            } else {
                /*
                this.X = function () {
                    return x;
                };

                this.Y = function () {
                    return y;
                };
                */
                this.coords.setCoordinates(Const.COORDS_BY_USER, [x, y]);
            }

            // this should be a local update, otherwise there might be problems
            // with the tick update routine resulting in orphaned tick labels
            this.prepareUpdate().update().updateRenderer();

            return this;
        },

        free: function () {
            this.X = Type.createFunction(this.X(), this.board, '');
            this.Y = Type.createFunction(this.Y(), this.board, '');

            this.isDraggable = true;
        },

        /**
         * Evaluates the text.
         * Then, the update function of the renderer
         * is called.
         */
        update: function () {
            if (!this.needsUpdate) {
                return this;
            }
            
            if (!this.visProp.frozen) {
                this.updateCoords();
            }

            this.updateText();

            if (this.visProp.display === 'internal') {
                this.plaintext = this.utf8_decode(this.plaintext);
            }

            this.checkForSizeUpdate();
            if (this.needsSizeUpdate) {
                this.updateSize();
            }
            this.updateTransform();

            return this;
        },

        /**
         * Used to save updateSize() calls.
         * Called in JXG.Text.update
         * That means this.update() has been called.
         * More tests are in JXG.Renderer.updateTextStyle. The latter tests
         * are one update off. But this should pose not too many problems, since
         * it affects fontSize and cssClass changes.
         *
         * @private
         */
        checkForSizeUpdate: function () {
            if (this.board.infobox && this.id === this.board.infobox.id) {
                this.needsSizeUpdate = false;
            } else {
                // For some magic reason it is more efficient on the iPad to
                // call updateSize() for EVERY text element EVERY time.
                this.needsSizeUpdate = (this.plaintextOld !== this.plaintext);

                if (this.needsSizeUpdate) {
                    this.plaintextOld = this.plaintext;
                }
            }

        },

        /**
         * Updates the coordinates of the text element.
         */
        updateCoords: function () {
            this.coords.setCoordinates(Const.COORDS_BY_USER, [this.Z(), this.X(), this.Y()]);
        },

        /**
         * The update function of the renderert
         * is called.
         * @private
         */
        updateRenderer: function () {
            if (this.needsUpdate) {
                this.board.renderer.updateText(this);
                this.needsUpdate = false;
            }
            return this;
        },

        updateTransform: function () {
            var i;

            if (this.transformations.length === 0) {
                return this;
            }

            for (i = 0; i < this.transformations.length; i++) {
                this.transformations[i].update();
            }

            return this;
        },

        /**
         * Converts the GEONExT syntax of the <value> terms into JavaScript.
         * Also, all Objects whose name appears in the term are searched and
         * the text is added as child to these objects.
         * @private
         * @see JXG.GeonextParser.geonext2JS.
         */
        generateTerm: function (contentStr) {
            var res, term, i, j,
                plaintext = '""';

            // revert possible jc replacement
            contentStr = contentStr || '';
            contentStr = contentStr.replace(/\r/g, '');
            contentStr = contentStr.replace(/\n/g, '');
            contentStr = contentStr.replace(/"/g, '\'');
            contentStr = contentStr.replace(/'/g, "\\'");

            contentStr = contentStr.replace(/&amp;arc;/g, '&ang;');
            contentStr = contentStr.replace(/<arc\s*\/>/g, '&ang;');
            contentStr = contentStr.replace(/&lt;arc\s*\/&gt;/g, '&ang;');
            contentStr = contentStr.replace(/&lt;sqrt\s*\/&gt;/g, '&radic;');

            contentStr = contentStr.replace(/&lt;value&gt;/g, '<value>');
            contentStr = contentStr.replace(/&lt;\/value&gt;/g, '</value>');

            // Convert GEONExT syntax into  JavaScript syntax
            i = contentStr.indexOf('<value>');
            j = contentStr.indexOf('</value>');
            if (i >= 0) {
                while (i >= 0) {
                    plaintext += ' + "' + this.replaceSub(this.replaceSup(contentStr.slice(0, i))) + '"';
                    term = contentStr.slice(i + 7, j);
                    res = GeonextParser.geonext2JS(term, this.board);
                    res = res.replace(/\\"/g, "'");
                    res = res.replace(/\\'/g, "'");

                    // GEONExT-Hack: apply rounding once only.
                    if (res.indexOf('toFixed') < 0) {
                        // output of a value tag
                        if (Type.isNumber((Type.bind(this.board.jc.snippet(res, true, '', false), this))())) {
                            // may also be a string
                            plaintext += '+(' + res + ').toFixed(' + (this.visProp.digits) + ')';
                        } else {
                            plaintext += '+(' + res + ')';
                        }
                    } else {
                        plaintext += '+(' + res + ')';
                    }

                    contentStr = contentStr.slice(j + 8);
                    i = contentStr.indexOf('<value>');
                    j = contentStr.indexOf('</value>');
                }
            }

            plaintext += ' + "' + this.replaceSub(this.replaceSup(contentStr)) + '"';
            plaintext = this.convertGeonext2CSS(plaintext);

            // This should replace &amp;pi; by &pi;
            plaintext = plaintext.replace(/&amp;/g, '&');
            plaintext = plaintext.replace(/"/g, "'");

            return plaintext;
        },

        /**
         * Converts the GEONExT tags <overline> and <arrow> to
         * HTML span tags with proper CSS formating.
         * @private
         * @see JXG.Text.generateTerm @see JXG.Text._setText
         */
        convertGeonext2CSS: function (s) {
            if (typeof s === 'string') {
                s = s.replace(/<overline>/g, '<span style=text-decoration:overline>');
                s = s.replace(/&lt;overline&gt;/g, '<span style=text-decoration:overline>');
                s = s.replace(/<\/overline>/g, '</span>');
                s = s.replace(/&lt;\/overline&gt;/g, '</span>');
                s = s.replace(/<arrow>/g, '<span style=text-decoration:overline>');
                s = s.replace(/&lt;arrow&gt;/g, '<span style=text-decoration:overline>');
                s = s.replace(/<\/arrow>/g, '</span>');
                s = s.replace(/&lt;\/arrow&gt;/g, '</span>');
            }

            return s;
        },

        /**
         * Finds dependencies in a given term and notifies the parents by adding the
         * dependent object to the found objects child elements.
         * @param {String} content String containing dependencies for the given object.
         * @private
         */
        notifyParents: function (content) {
            var search,
                res = null;

            // revert possible jc replacement
            content = content.replace(/&lt;value&gt;/g, '<value>');
            content = content.replace(/&lt;\/value&gt;/g, '</value>');

            do {
                search = /<value>([\w\s\*\/\^\-\+\(\)\[\],<>=!]+)<\/value>/;
                res = search.exec(content);

                if (res !== null) {
                    GeonextParser.findDependencies(this, res[1], this.board);
                    content = content.substr(res.index);
                    content = content.replace(search, '');
                }
            } while (res !== null);

            return this;
        },

        bounds: function () {
            var c = this.coords.usrCoords;

            return this.visProp.islabel ? [0, 0, 0, 0] : [c[1], c[2] + this.size[1], c[1] + this.size[0], c[2]];
        },

        /**
         * Sets x and y coordinate of the text.
         * @param {Number} method The type of coordinates used here. Possible values are {@link JXG.COORDS_BY_USER} and {@link JXG.COORDS_BY_SCREEN}.
         * @param {Array} coords coordinates in screen/user units
         * @param {Array} oldcoords previous coordinates in screen/user units
         * @returns {JXG.Text} this element
         */
        setPositionDirectly: function (method, coords, oldcoords) {
            var dc, v,
                c, oldc;

            c = new Coords(method, coords, this.board);
            if (this.relativeCoords) {
                if (!JXG.exists(oldcoords)) {
                    return this;
                }
                oldc = new Coords(method, oldcoords, this.board);
                
                if (this.visProp.islabel) {
                    dc = Statistics.subtract(c.scrCoords, oldc.scrCoords);
                    this.relativeCoords.scrCoords[1] += dc[1];
                    this.relativeCoords.scrCoords[2] += dc[2];
                } else {
                    dc = Statistics.subtract(c.usrCoords, oldc.usrCoords);
                    this.relativeCoords.usrCoords[1] += dc[1];
                    this.relativeCoords.usrCoords[2] += dc[2];
                }
            } else {
                /*
                dc = Statistics.subtract(c.usrCoords, oldc.usrCoords);
                v = [this.Z(), this.X(), this.Y()];
                this.X = Type.createFunction(v[1] + dc[1], this.board, '');
                this.Y = Type.createFunction(v[2] + dc[2], this.board, '');
                */
                
                this.coords.setCoordinates(method, coords);
                //this.X = Type.createFunction(c.usrCoords[1], this.board, '');
                //this.Y = Type.createFunction(c.usrCoords[2], this.board, '');
                //this.Z = Type.createFunction(c.usrCoords[0], this.board, '');
                
                /*
                * In case of snapToGrid===true, first the coordinates of
                * the new position is set, then they are rounded to the grid.
                * The resulting coordinates are set as functions X(), Y(),
                * becasue they are set again in updateCoords().
                */
                if (this.visProp.snaptogrid) {
                    //this.coords.setCoordinates(Const.COORDS_BY_USER, c.usrCoords);
                    this.snapToGrid();
                    //this.X = Type.createFunction(this.coords.usrCoords[1], this.board, '');
                    //this.Y = Type.createFunction(this.coords.usrCoords[2], this.board, '');
                    //this.Z = Type.createFunction(this.coords.usrCoords[0], this.board, '');
                }
            }

            return this;
        },

        /**
         * Alias for {@link JXG.GeometryElement#handleSnapToGrid}
         * @returns {JXG.Text} Reference to this element
         */
        snapToGrid: function () {
            return this.handleSnapToGrid();
        }

    });

    /**
     * @class This element is used to provide a constructor for text, which is just a wrapper for element {@link Text}.
     * @pseudo
     * @description
     * @name Text
     * @augments JXG.GeometryElement
     * @constructor
     * @type JXG.Text
     *
     * @param {number,function_number,function_String,function} x,y,str Parent elements for text elements.
     *                     <p>
     *                     x and y are the coordinates of the lower left corner of the text box. The position of the text is fixed,
     *                     x and y are numbers. The position is variable if x or y are functions.
     *                     <p>
     *                     The text to display may be given as string or as function returning a string.
     *
     * There is the attribute 'display' which takes the values 'html' or 'internal'. In case of 'html' a HTML division tag is created to display
     * the text. In this case it is also possible to use ASCIIMathML. Incase of 'internal', a SVG or VML text element is used to display the text.
     * @see JXG.Text
     * @example
     * // Create a fixed text at position [0,1].
     *   var t1 = board.create('text',[0,1,"Hello World"]);
     * </pre><div id="896013aa-f24e-4e83-ad50-7bc7df23f6b7" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *   var t1_board = JXG.JSXGraph.initBoard('896013aa-f24e-4e83-ad50-7bc7df23f6b7', {boundingbox: [-3, 6, 5, -3], axis: true, showcopyright: false, shownavigation: false});
     *   var t1 = t1_board.create('text',[0,1,"Hello World"]);
     * </script><pre>
     * @example
     * // Create a variable text at a variable position.
     *   var s = board.create('slider',[[0,4],[3,4],[-2,0,2]]);
     *   var graph = board.create('text',
     *                        [function(x){ return s.Value();}, 1,
     *                         function(){return "The value of s is"+s.Value().toFixed(2);}
     *                        ]
     *                     );
     * </pre><div id="5441da79-a48d-48e8-9e53-75594c384a1c" style="width: 300px; height: 300px;"></div>
     * <script type="text/javascript">
     *   var t2_board = JXG.JSXGraph.initBoard('5441da79-a48d-48e8-9e53-75594c384a1c', {boundingbox: [-3, 6, 5, -3], axis: true, showcopyright: false, shownavigation: false});
     *   var s = t2_board.create('slider',[[0,4],[3,4],[-2,0,2]]);
     *   var t2 = t2_board.create('text',[function(x){ return s.Value();}, 1, function(){return "The value of s is "+s.Value().toFixed(2);}]);
     * </script><pre>
     */
    JXG.createText = function (board, parents, attributes) {
        var t,
            attr = Type.copyAttributes(attributes, board.options, 'text');

        // downwards compatibility
        attr.anchor = attr.parent || attr.anchor;

        t = new JXG.Text(board, parents[parents.length - 1], parents, attr);

        if (typeof parents[parents.length - 1] !== 'function') {
            t.parents = parents;
        }

        if (Type.evaluate(attr.rotate) !== 0 && attr.display === 'internal') {
            t.addRotation(Type.evaluate(attr.rotate));
        }

        return t;
    };

    JXG.registerElement('text', JXG.createText);

    /**
     * [[x,y], [w px, h px], [range]
     */
    JXG.createHTMLSlider = function (board, parents, attributes) {
        var t, par,
            attr = Type.copyAttributes(attributes, board.options, 'htmlslider');

        if (parents.length !== 2 || parents[0].length !== 2 || parents[1].length !== 3) {
            throw new Error("JSXGraph: Can't create htmlslider with parent types '" +
                (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'." +
                "\nPossible parents are: [[x,y], [min, start, max]]");
        }

        // backwards compatibility
        attr.anchor = attr.parent || attr.anchor;
        attr.fixed = attr.fixed || true;

        par = [parents[0][0], parents[0][1],
            '<form style="display:inline">' +
            '<input type="range" /><span></span><input type="text" />' +
            '</form>'];

        t = JXG.createText(board, par, attr);
        t.type = Type.OBJECT_TYPE_HTMLSLIDER;

        t.rendNodeForm = t.rendNode.childNodes[0];
        t.rendNodeForm.id = t.rendNode.id + '_form';

        t.rendNodeRange = t.rendNodeForm.childNodes[0];
        t.rendNodeRange.id = t.rendNode.id + '_range';
        t.rendNodeRange.min = parents[1][0];
        t.rendNodeRange.max = parents[1][2];
        t.rendNodeRange.step = attr.step;
        t.rendNodeRange.value = parents[1][1];

        t.rendNodeLabel = t.rendNodeForm.childNodes[1];
        t.rendNodeLabel.id = t.rendNode.id + '_label';

        if (attr.withlabel) {
            t.rendNodeLabel.innerHTML = t.name + '=';
        }

        t.rendNodeOut = t.rendNodeForm.childNodes[2];
        t.rendNodeOut.id = t.rendNode.id + '_out';
        t.rendNodeOut.value = parents[1][1];

        t.rendNodeRange.style.width = attr.widthrange + 'px';
        t.rendNodeRange.style.verticalAlign = 'middle';
        t.rendNodeOut.style.width = attr.widthout + 'px';

        t._val = parents[1][1];

        if (JXG.supportsVML()) {
            /*
            * OnChange event is used for IE browsers
            * The range element is supported since IE10
            */
            Env.addEvent(t.rendNodeForm, 'change', priv.HTMLSliderInputEventHandler, t);
        } else {
            /*
            * OnInput event is used for non-IE browsers
            */
            Env.addEvent(t.rendNodeForm, 'input', priv.HTMLSliderInputEventHandler, t);
        }

        t.Value = function () {
            return this._val;
        };

        return t;
    };

    JXG.registerElement('htmlslider', JXG.createHTMLSlider);

    return {
        Text: JXG.Text,
        createText: JXG.createText,
        createHTMLSlider: JXG.createHTMLSlider
    };
});
