/*
    Copyright 2008-2023
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Andreas Walter,
        Alfred Wassermann

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
    the MIT License along with JSXGraph. If not, see <https://www.gnu.org/licenses/>
    and <https://opensource.org/licenses/MIT/>.
 */
import JXG from "../jxg";
import Mat from "../math/math";
import Type from "../utils/type";
import Const from "../base/constants";

/**
 * @class Creates a grid to support the user with element placement or to improve determination of position.
 * @pseudo
 * @description A grid is a set of vertical and horizontal lines or other geometrical objects (faces)
 * to support the user with element placement or to improve determination of position.
 * This method takes up to two facultative parent elements. These are used to set distance between
 * grid elements in case of attribute <tt>majorStep</tt> or <tt>minorElements</tt> is set to 'auto'.
 * Then the major/minor grid element distance is set to the ticks distance of parent axes.
 * It is usually instantiated on the board's creation via the attribute <tt>grid</tt> set to true.
 * @constructor
 * @name Grid
 * @type JXG.Curve
 * @augments JXG.Curve
 * @throws {Error} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG.Axis_JXG.Axis} a1,a2 Optional parent axis.
 *
 * @example
 * // standard grid
 * var g = board.create('grid', [], {
 *     drawZeroX: true,
 *     drawZeroY: true,
 * });
 * </pre><div id="JXGc8dde3f5-22ef-4c43-9505-34b299b5b24d" class="jxgbox" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 *  (function() {
 *      var board = JXG.JSXGraph.initBoard('JXGc8dde3f5-22ef-4c43-9505-34b299b5b24d',
 *          {boundingbox: [-8, 8, 8,-8], axis: false, showcopyright: false, shownavigation: false});
 *      var g = board.create('grid', [], {
 *          drawZeroX: true,
 *          drawZeroY: true,
 *      });
 *  })();
 * </script><pre>
 *
 * @example
 * // more fancy grid
 * var g = board.create('grid', [], {
 *     major: {
 *         face: 'plus',
 *         sizeX: 10,
 *         strokeColor: '#080050',
 *         strokeOpacity: 1,
 *     },
 *     minor: {
 *         sizeX: 3
 *     },
 *     drawZeroX: true,
 *     drawZeroY: true,
 *     minorElements: 4,
 * });
 * </pre><div id="JXG02374171-b27c-4ccc-a14a-9f5bd1162623" class="jxgbox" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 *     (function() {
 *         var board = JXG.JSXGraph.initBoard('JXG02374171-b27c-4ccc-a14a-9f5bd1162623',
 *             {boundingbox: [-8, 8, 8,-8], axis: false, showcopyright: false, shownavigation: false});
 *         var g = board.create('grid', [], {
 *             major: {
 *                 face: 'plus',
 *                 sizeX: 10,
 *                 strokeColor: '#080050',
 *                 strokeOpacity: 1,
 *             },
 *             minor: {
 *                 sizeX: 3
 *             },
 *             drawZeroX: true,
 *             drawZeroY: true,
 *             minorElements: 4,
 *         });
 *     })();
 * </script><pre>
 *
 * @example
 * // extreme fancy grid
 * var grid = board.create('grid', [], {
 *     major: {
 *         face: 'regularPolygon',
 *         sizeX: 10,
 *         strokeColor: 'blue',
 *         fillColor: 'orange',
 *         strokeOpacity: 1,
 *         drawZeroX: true,
 *         drawZeroY: true,
 *         drawZero0: true,
 *     },
 *     minor: {
 *         face: 'diamond',
 *         sizeX: 3,
 *         strokeColor: 'green',
 *         fillColor: 'grey',
 *         drawZeroX: true,
 *         drawZeroY: true,
 *     },
 *     minorElements: 1,
 *     includeBoundaries: false,
 * });
 * </pre><div id="JXG00f3d068-093c-4c1d-a1ab-96c9ee73c173" class="jxgbox" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 *     (function() {
 *         var board = JXG.JSXGraph.initBoard('JXG00f3d068-093c-4c1d-a1ab-96c9ee73c173',
 *             {boundingbox: [-8, 8, 8,-8], axis: false, showcopyright: false, shownavigation: false});
 *         var grid = board.create('grid', [], {
 *             major: {
 *                 face: 'regularPolygon',
 *                 sizeX: 10,
 *                 strokeColor: 'blue',
 *                 fillColor: 'orange',
 *                 strokeOpacity: 1,
 *                 drawZeroX: true,
 *                 drawZeroY: true,
 *                 drawZero0: true,
 *             },
 *             minor: {
 *                 face: 'diamond',
 *                 sizeX: 3,
 *                 strokeColor: 'green',
 *                 fillColor: 'grey',
 *                 drawZeroX: true,
 *                 drawZeroY: true,
 *             },
 *             minorElements: 1,
 *             includeBoundaries: false,
 *         });
 *     })();
 * </script><pre>
 *
 * @example
 * // grid with parent axes
 * var axis1 = board.create('axis', [[-1, -2.5], [1, -2.5]], {
 *     ticks: {
 *         strokeColor: 'green',
 *         strokeWidth: 2,
 *         minorticks: 2,
 *         majorHeight: 10,
 *         drawZero: true
 *     }
 * });
 * var axis2 = board.create('axis', [[3, 0], [3, 2]], {
 *     ticks: {
 *         strokeColor: 'red',
 *         strokeWidth: 2,
 *         minorticks: 3,
 *         majorHeight: 10,
 *         drawZero: true
 *     }
 * });
 * var grid = board.create('grid', [axis1, axis2], {
 *     major: {
 *         face: 'line',
 *         drawZeroX: true,
 *         drawZeroY: true
 *     },
 *     minor: {
 *         face: 'point',
 *         sizeX: 3
 *     },
 *     minorElements: 'auto',
 *     includeBoundaries: false,
 * });
 * </pre><div id="JXG0568e385-248c-43a9-87ed-07aceb8cc3ab" class="jxgbox" style="width: 300px; height: 300px;"></div>
 * <script type="text/javascript">
 *     (function() {
 *         var board = JXG.JSXGraph.initBoard('JXG0568e385-248c-43a9-87ed-07aceb8cc3ab',
 *             {boundingbox: [-8, 8, 8,-8], axis: false, showcopyright: false, shownavigation: false});
 *         var axis1 = board.create('axis', [[-1, -2.5], [1, -2.5]], {
 *             ticks: {
 *                 strokeColor: 'green',
 *                 strokeWidth: 2,
 *                 minorticks: 2,
 *                 majorHeight: 10,
 *                 drawZero: true
 *             }
 *         });
 *         var axis2 = board.create('axis', [[3, 0], [3, 2]], {
 *             ticks: {
 *                 strokeColor: 'red',
 *                 strokeWidth: 2,
 *                 minorticks: 3,
 *                 majorHeight: 10,
 *                 drawZero: true
 *             }
 *         });
 *         var grid = board.create('grid', [axis1, axis2], {
 *             major: {
 *                 face: 'line',
 *                 drawZeroX: true,
 *                 drawZeroY: true
 *             },
 *             minor: {
 *                 face: 'point',
 *                 sizeX: 3
 *             },
 *             minorElements: 'auto',
 *             includeBoundaries: false,
 *         });
 *     }());
 * </script><pre>
 */
JXG.createGrid = function (board, parents, attributes) {
    const eps = Mat.eps,       // to avoid rounding errors
        maxLines = 5000;    // maximum number of vertical or horizontal grid elements (abort criterion for performance reasons)

    var majorGrid,      // main object which will be returned as grid
        minorGrid,      // sub-object
        parentAxes,     // {Array} array of user defined axes (allowed length 0, 1 or 2)

        attrGrid,       // attributes for grid
        attrMajor,      // attributes for major grid
        attrMinor,      // attributes for minor grid

        majorStep,      // {[Number]} distance (in usrCoords) in x- and y-direction between center of two major grid elements
        majorRadiusX,   // {Number} half of the size (in usrCoords) of major grid element in x-direction
        majorRadiusY,   // {Number} half of the size (in usrCoords) of major grid element in y-direction

        createDataArrayForFace; // {Function}

    parentAxes = parents;
    if (
        parentAxes.length > 2 ||
        (parentAxes.length >= 1 && parentAxes[0].elType !== 'axis') ||
        (parentAxes.length >= 2 && parentAxes[1].elType !== 'axis')
    ) {
        throw new Error(
            "JSXGraph: Can't create 'grid' with parent type '" +
            parents[0].elType +
            "'. Possible parent types: [axis,axis]"
        );
    }
    if (!Type.exists(parentAxes[0]) && Type.exists(board.defaultAxes)) {
        parentAxes[0] = board.defaultAxes.x;
    }
    if (!Type.exists(parentAxes[1]) && Type.exists(board.defaultAxes)) {
        parentAxes[1] = board.defaultAxes.y;
    }

    /**
     * Creates for each face the right data array for updateDataArray function.
     * This functions also adapts visProps according to face.

     * @param {String} face Chosen face to be drawn
     * @param {Object} grid Curve/grid to be drawn
     * @param {Number} x x-coordinate of target position
     * @param {Number} y y-coordinate of target position
     * @param {Number} radiusX Half of width in x-direction of face to be drawn
     * @param {Number} radiusY Half of width in y-direction of face to be drawn
     * @param {Array} bbox boundingBox
     *
     * @returns {Array} data array of length 2 (x- and y- coordinated for curve)
     * @private
     * @ignore
     */
    createDataArrayForFace = function (face, grid, x, y, radiusX, radiusY, bbox) {
        var t, q, m, n, array, rx2, ry2;

        switch (face.toLowerCase()) {

            // filled point
            case '.':
            case 'point':
                grid.visProp.linecap = 'round';
                return [
                    [x, x, NaN],
                    [y, y, NaN]
                ];

            // bezierCircle
            case 'o':
            case 'circle':
                grid.visProp.linecap = 'square';
                grid.bezierDegree = 3;
                q = 4 * Math.tan(Math.PI / 8) / 3;
                return [
                    [
                        x + radiusX, x + radiusX, x + q * radiusX, x,
                        x - q * radiusX, x - radiusX, x - radiusX, x - radiusX,
                        x - q * radiusX, x, x + q * radiusX, x + radiusX,
                        x + radiusX, NaN
                    ], [
                        y, y + q * radiusY, y + radiusY, y + radiusY,
                        y + radiusY, y + q * radiusY, y, y - q * radiusY,
                        y - radiusY, y - radiusY, y - radiusY, y - q * radiusY,
                        y, NaN
                    ]
                ];

            // polygon
            case 'regpol':
            case 'regularpolygon':
                grid.visProp.linecap = 'round';
                n = Type.evaluate(grid.visProp.polygonvertices);
                array = [[], []];
                // approximation of circle with variable n
                for (t = 0; t <= 2 * Math.PI; t += (2 * Math.PI) / n) {
                    array[0].push(x - radiusX * Math.sin(t));
                    array[1].push(y - radiusY * Math.cos(t));
                }
                array[0].push(NaN);
                array[1].push(NaN);
                return array;

            // square
            case '[]':
            case 'square':
                grid.visProp.linecap = 'square';
                return [
                    [x - radiusX, x + radiusX, x + radiusX, x - radiusX, x - radiusX, NaN],
                    [y + radiusY, y + radiusY, y - radiusY, y - radiusY, y + radiusY, NaN]
                ];

            // diamond
            case '<>':
            case 'diamond':
                grid.visProp.linecap = 'square';
                return [
                    [x, x + radiusX, x, x - radiusX, x, NaN],
                    [y + radiusY, y, y - radiusY, y, y + radiusY, NaN]
                ];

            // diamond2
            case '<<>>':
            case 'diamond2':
                grid.visProp.linecap = 'square';
                rx2 = radiusX * Math.sqrt(2);
                ry2 = radiusY * Math.sqrt(2);
                return [
                    [x, x + rx2, x, x - rx2, x, NaN],
                    [y + ry2, y, y - ry2, y, y + ry2, NaN]
                ];

            case 'x':
            case 'cross':
                return [
                    [x - radiusX, x + radiusX, NaN, x - radiusX, x + radiusX, NaN],
                    [y + radiusY, y - radiusY, NaN, y - radiusY, y + radiusY, NaN]
                ];

            case '+':
            case 'plus':
                return [
                    [x - radiusX, x + radiusX, NaN, x, x, NaN],
                    [y, y, NaN, y - radiusY, y + radiusY, NaN]
                ];

            case '-':
            case 'minus':
                return [
                    [x - radiusX, x + radiusX, NaN],
                    [y, y, NaN]
                ];

            case '|':
            case 'divide':
                return [
                    [x, x, NaN],
                    [y - radiusY, y + radiusY, NaN]
                ];

            case '^':
            case 'a':
            case 'A':
            case 'triangleup':
                return [
                    [x - radiusX, x, x + radiusX, NaN],
                    [y - radiusY, y, y - radiusY, NaN]
                ];

            case 'v':
            case 'triangledown':
                return [
                    [x - radiusX, x, x + radiusX, NaN],
                    [y + radiusY, y, y + radiusY, NaN]
                ];

            case '<':
            case 'triangleleft':
                return [
                    [x + radiusX, x, x + radiusX, NaN],
                    [y + radiusY, y, y - radiusY, NaN]
                ];

            case '>':
            case 'triangleright':
                return [
                    [x - radiusX, x, x - radiusX, NaN],
                    [y + radiusY, y, y - radiusY, NaN]
                ];

            case 'line':
                m = Type.evaluate(grid.visProp.margin);
                return [
                    // [x, x, NaN, bbox[0] + (4 / grid.board.unitX), bbox[2] - (4 / grid.board.unitX), NaN],
                    [x, x, NaN, bbox[0] - m / grid.board.unitX, bbox[2] + m / grid.board.unitX, NaN],
                    [bbox[1] + m / grid.board.unitY, bbox[3] - m / grid.board.unitY, NaN, y, y, NaN]
                ];

            default:
                return [[], []];
        }
    };

    // Themes
    attrGrid = Type.copyAttributes(attributes, board.options, 'grid');
    Type.mergeAttr(board.options.grid, attrGrid.themes[attrGrid.theme], false); // POI: I think there should not be `board.options.grid`
    attrGrid = Type.copyAttributes(attributes, board.options, 'grid');

    // Create majorGrid
    attrMajor = Type.copyAttributes(attributes, board.options, 'grid', 'major');
    Type.mergeAttr(attrMajor, attrGrid, true);
    majorGrid = board.create('curve', [[null], [null]], attrMajor);
    majorGrid.elType = 'grid';
    majorGrid.type = Const.OBJECT_TYPE_GRID;

    // Create minorGrid
    attrMinor = Type.copyAttributes(attributes, board.options, 'grid', 'minor');
    Type.mergeAttr(attrMinor, attrGrid, true);
    minorGrid = board.create('curve', [[null], [null]], attrMinor);
    minorGrid.elType = 'grid';
    minorGrid.type = Const.OBJECT_TYPE_GRID;

    majorGrid.minorGrid = minorGrid;
    minorGrid.majorGrid = majorGrid;

    majorGrid.hasPoint = function () { return false; };
    minorGrid.hasPoint = function () { return false; };

    majorGrid.updateDataArray = function () {
        var bbox = this.board.getBoundingBox(),
            startX, startY,
            x, y,
            dataArr,
            finite,

            gridX = Type.evaluate(this.visProp.gridx),
            gridY = Type.evaluate(this.visProp.gridy),
            sizeX = Type.evaluate(this.visProp.sizex),
            sizeY = Type.evaluate(this.visProp.sizey),
            face = Type.evaluate(this.visProp.face),
            drawZero0 = Type.evaluate(this.visProp.drawzero0),
            drawZeroX = Type.evaluate(this.visProp.drawzerox),
            drawZeroY = Type.evaluate(this.visProp.drawzeroy),

            includeBoundaries = Type.evaluate(this.visProp.includeboundaries),
            forceSquare = Type.evaluate(this.visProp.forcesquare);

        this.dataX = [];
        this.dataY = [];

        // set global majorStep
        majorStep = Type.evaluate(this.visProp.majorstep);
        if (!Type.isArray(majorStep)) {
            majorStep = [majorStep, majorStep];
        }
        if (majorStep.length < 2) {
            majorStep = [majorStep[0], majorStep[0]];
        }
        if (Type.exists(gridX)) {
            JXG.deprecated("gridX", "majorStep");
            majorStep[0] = gridX;
        }
        if (Type.exists(gridY)) {
            JXG.deprecated("gridY", "majorStep");
            majorStep[1] = gridY;
        }

        if (majorStep[0] === 'auto') {
            majorStep[0] = 1; // parentAxes[0] may not be defined
            if (Type.exists(parentAxes[0])) {
                majorStep[0] = parentAxes[0].ticks[0].getDistanceMajorTicks();
            }
        } else {
            // This allows the value to hate unit px, abs, % or fr.
            majorStep[0] = Type.parseNumber(majorStep[0], Math.abs(bbox[1] - bbox[3]), 1 / this.board.unitX);
        }
        if (majorStep[1] === 'auto') {
            majorStep[1] = 1; // parentAxes[1] may not be defined
            if (Type.exists(parentAxes[1])) {
                majorStep[1] = parentAxes[1].ticks[0].getDistanceMajorTicks();
            }
        } else {
            // This allows the value to hate unit px, abs, % or fr.
            majorStep[1] = Type.parseNumber(majorStep[1], Math.abs(bbox[0] - bbox[2]), 1 / this.board.unitY);
        }

        if (forceSquare === 'min') {
            if (majorStep[0] * this.board.unitX <= majorStep[1] * this.board.unitY) { // compare px-values
                majorStep[1] = majorStep[0] / this.board.unitY * this.board.unitX;
            } else {
                majorStep[0] = majorStep[1] / this.board.unitX * this.board.unitY;
            }
        } else if (forceSquare === 'max' || forceSquare === true) {
            if (majorStep[0] * this.board.unitX <= majorStep[1] * this.board.unitY) { // compare px-values
                majorStep[0] = majorStep[1] / this.board.unitX * this.board.unitY;
            } else {
                majorStep[1] = majorStep[0] / this.board.unitY * this.board.unitX;
            }
        }

        // Set sizeX and sizeY here because otherwise strokeWidth for line/point not usable
        // and if only one size specified symmetric adaption of other size not possible
        // POI: I think we should proceed differently here
        if (!Type.exists(sizeX)) {
            if (Type.exists(sizeY)) {
                sizeX = sizeY;
            } else {
                sizeX = 5;
            }
        }
        if (!Type.exists(sizeY)) {
            if (Type.exists(sizeX)) {
                sizeY = sizeX;
            } else {
                sizeY = 5;
            }
        }

        // set global majorRadiusX and majorRadiusY
        // sizeX and sizeY can be a number (also a number like '20') or a string ending with '%'
        if (Type.isString(sizeX) && sizeX.indexOf('%') > -1) {
            majorRadiusX = sizeX.replace(/\s+%\s+/, '');
            majorRadiusX = parseFloat(majorRadiusX) / 100;
            majorRadiusX = majorRadiusX * majorStep[0] / 2;

        } else { // Type.isNumber(sizeX, true)
            majorRadiusX = parseFloat(sizeX);
            majorRadiusX = majorRadiusX / this.board.unitX / 2; // conversion: px -> usrCoord
        }
        if (Type.isString(sizeY) && sizeY.indexOf('%') > -1) {
            majorRadiusY = sizeY.replace(/\s+%\s+/, '');
            majorRadiusY = parseFloat(majorRadiusY) / 100;
            majorRadiusY = majorRadiusY * majorStep[1] / 2;

        } else { // Type.isNumber(sizeY, true)
            majorRadiusY = parseFloat(sizeY);
            majorRadiusY = majorRadiusY / this.board.unitY / 2; // conversion: px -> usrCoord
        }

        // calculate start position of curve
        startX = Mat.roundToStep(bbox[0], majorStep[0]);
        startY = Mat.roundToStep(bbox[1], majorStep[1]);

        // check if number of grid elements side by side is not too large
        finite = isFinite(startX) && isFinite(startY) &&
            isFinite(bbox[2]) && isFinite(bbox[3]) &&
            Math.abs(bbox[2]) < Math.abs(majorStep[0] * maxLines) &&
            Math.abs(bbox[3]) < Math.abs(majorStep[1] * maxLines);

        // POI finite = false means that no grid is drawn. Should we change this?

        // draw grid elements
        for (y = startY; finite && y >= bbox[3]; y -= majorStep[1]) {
            for (x = startX; finite && x <= bbox[2]; x += majorStep[0]) {

                if (
                    (!drawZero0 && Math.abs(y) < eps && Math.abs(x) < eps) ||
                    (!drawZeroX && Math.abs(y) < eps && Math.abs(x) >= eps) ||
                    (!drawZeroY && Math.abs(x) < eps && Math.abs(y) >= eps) ||
                    (!includeBoundaries && (
                        x <= bbox[0] + majorRadiusX ||
                        x >= bbox[2] - majorRadiusX ||
                        y <= bbox[3] + majorRadiusY ||
                        y >= bbox[1] - majorRadiusY
                    ))
                ) {
                    continue;
                }

                dataArr = createDataArrayForFace(face, majorGrid, x, y, majorRadiusX, majorRadiusY, bbox);
                this.dataX = this.dataX.concat(dataArr[0]);
                this.dataY = this.dataY.concat(dataArr[1]);
            }
        }
    };

    minorGrid.updateDataArray = function () {
        var bbox = this.board.getBoundingBox(),
            startX, startY,
            x, y,
            dataArr,
            finite,

            minorStep = [],
            minorRadius=[],
            XdisTo0, XdisFrom0, YdisTo0, YdisFrom0, // {Number} absolute distances of minor grid elements center to next major grid element center
            dis0To, dis1To, dis2To, dis3To,         // {Number} absolute distances of borders of the boundingBox to the next major grid element.
            dis0From, dis1From, dis2From, dis3From,

            minorElements = Type.evaluate(this.visProp.minorelements),
            minorSizeX = Type.evaluate(this.visProp.sizex),
            minorSizeY = Type.evaluate(this.visProp.sizey),
            minorFace = Type.evaluate(this.visProp.face),
            minorDrawZeroX = Type.evaluate(this.visProp.drawzerox),
            minorDrawZeroY = Type.evaluate(this.visProp.drawzeroy),

            majorFace = Type.evaluate(this.majorGrid.visProp.face),
            majorDrawZero0 = Type.evaluate(this.majorGrid.visProp.drawzero0),
            majorDrawZeroX = Type.evaluate(this.majorGrid.visProp.drawzerox),
            majorDrawZeroY = Type.evaluate(this.majorGrid.visProp.drawzeroy),

            includeBoundaries = Type.evaluate(this.visProp.includeboundaries);

        this.dataX = [];
        this.dataY = [];

        // set minorStep
        // minorElements can be 'auto' or a number (also a number like '20')
        if (!Type.isArray(minorElements)) {
            minorElements = [minorElements, minorElements];
        }
        if (minorElements.length < 2) {
            minorElements = [minorElements[0], minorElements[0]];
        }

        if (Type.isNumber(minorElements[0], true)) {
            minorElements[0] = parseFloat(minorElements[0]);

        } else { // minorElements[0]  === 'auto'
            minorElements[0] = 0; // parentAxes[0] may not be defined
            if (Type.exists(parentAxes[0])) {
                minorElements[0] = Type.evaluate(parentAxes[0].getAttribute('ticks').minorticks);
            }
        }
        minorStep[0] = majorStep[0] / (minorElements[0] + 1);

        if (Type.isNumber(minorElements[1], true)) {
            minorElements[1] = parseFloat(minorElements[1]);

        } else { // minorElements[1] === 'auto'
            minorElements[1] = 0; // parentAxes[1] may not be defined
            if (Type.exists(parentAxes[1])) {
                minorElements[1] = Type.evaluate(parentAxes[1].getAttribute('ticks').minorticks);
            }
        }
        minorStep[1] = majorStep[1] / (minorElements[1] + 1);

        // Set minorSizeX and minorSizeY here because otherwise strokeWidth for line/point not usable
        // and if only one size specified symmetric adaption of other size not possible
        // POI: I think we should proceed differently here
        if (!Type.exists(minorSizeX)) {
            if (Type.exists(minorSizeY)) {
                minorSizeX = minorSizeY;
            } else {
                minorSizeX = 3;
            }
        }
        if (!Type.exists(minorSizeY)) {
            if (Type.exists(minorSizeX)) {
                minorSizeY = minorSizeX;
            } else {
                minorSizeY = 3;
            }
        }

        minorRadius[0] = Type.parseNumber(minorSizeX, minorStep[0] / 2, 1 / this.board.unitX);
        minorRadius[1] = Type.parseNumber(minorSizeY, minorStep[1] / 2, 1 / this.board.unitY);

        // calculate start position of curve
        startX = Mat.roundToStep(bbox[0], minorStep[0]);
        startY = Mat.roundToStep(bbox[1], minorStep[1]);

        // check if number of grid elements side by side is not too large
        finite = isFinite(startX) && isFinite(startY) &&
            isFinite(bbox[2]) && isFinite(bbox[3]) &&
            Math.abs(bbox[2]) <= Math.abs(minorStep[0] * maxLines) &&
            Math.abs(bbox[3]) < Math.abs(minorStep[1] * maxLines);

        // POI finite = false means that no grid is drawn. Should we change this?

        // draw grid elements
        for (y = startY; finite && y >= bbox[3]; y -= minorStep[1]) {
            for (x = startX; finite && x <= bbox[2]; x += minorStep[0]) {

                /* explanation:
                     |<___XdisTo0___><___________XdisFrom0___________>
                     |                .                .               .
                 ____|____            .                .           _________
                |    |    |         ____              ____        |         |
                |    |    |        |    |            |    |       |         |
                |    |    |        |____|            |____|       |         |
                |____|____|           | |              .          |_________|
                     |    |           . \              .              .
                     |  \             . minorRadius[0]   .              .
                     |   majorRadiusX .                .              .
                     |                .                .              .
                     |<----------->   .                .              .
                     |    \           .                .              .
                     |     XdisTo0 - minorRadius[0] <= majorRadiusX ? -> exclude
                     |                .                .              .
                     |                .  <--------------------------->
                     |                             \
                     |                              XdisFrom0 - minorRadius[0] <= majorRadiusX ? -> exclude
                     |
               -——---|————————-————---|----------------|---------------|-------->
                     |
                     |<______________________majorStep[0]_____________________>
                     |
                     |<__minorStep[0]____><__minorStep[0]_____><__minorStep[0]_____>
                     |
                     |
                */
                XdisTo0 = Mat.roundToStep(Math.abs(x), majorStep[0]);
                XdisTo0 = Math.abs(XdisTo0 - Math.abs(x));
                XdisFrom0 = majorStep[0] - XdisTo0;

                YdisTo0 = Mat.roundToStep(Math.abs(y), majorStep[1]);
                YdisTo0 = Math.abs(YdisTo0 - Math.abs(y));
                YdisFrom0 = majorStep[1] - YdisTo0;

                if (majorFace === 'line') {
                    // for majorFace 'line' do not draw minor grid elements on lines
                    if (
                        XdisTo0 - minorRadius[0] - majorRadiusX < eps ||
                        XdisFrom0 - minorRadius[0] - majorRadiusX < eps ||
                        YdisTo0 - minorRadius[1] - majorRadiusY < eps ||
                        YdisFrom0 - minorRadius[1] - majorRadiusY < eps
                    ) {
                        continue;
                    }

                } else {
                    if ((
                        XdisTo0 - minorRadius[0] - majorRadiusX < eps ||
                        XdisFrom0 - minorRadius[0] - majorRadiusX < eps
                    ) && (
                        YdisTo0 - minorRadius[1] - majorRadiusY < eps ||
                        YdisFrom0 - minorRadius[1] - majorRadiusY < eps
                    )) {
                        // if major grid elements (on 0 or axes) are not existing, minor grid elements have to exist. Otherwise:
                        if ((
                            majorDrawZero0 ||
                            majorRadiusY - Math.abs(y) + minorRadius[1] < eps ||
                            majorRadiusX - Math.abs(x) + minorRadius[0] < eps
                        ) && (
                            majorDrawZeroX ||
                            majorRadiusY - Math.abs(y) + minorRadius[1] < eps ||
                            majorRadiusX + Math.abs(x) - minorRadius[0] < eps
                        ) && (
                            majorDrawZeroY ||
                            majorRadiusX - Math.abs(x) + minorRadius[0] < eps ||
                            majorRadiusY + Math.abs(y) - minorRadius[1] < eps
                        )) {
                            continue;
                        }
                    }
                }
                if (
                    (!minorDrawZeroY && Math.abs(x) < eps) ||
                    (!minorDrawZeroX && Math.abs(y) < eps)
                ) {
                    continue;
                }

                /* explanation of condition below:

                      |         __dis2To___> _dis2From_      // dis2To bzw. dis2From >= majorRadiusX
                      |      __/_          \/         _\__
                      |     |    |  []     >         |    |
                      |     |____|         >         |____|
                      |                    >
                      |                    >
                      |      x-minorSizeX  > bbox[2]
                      0               .    >/
                   -——|————————-————.-.——.—>
                      |             . .  . >
                      |             . .  . >
                      |             . .  . > dis2From (<= majorRadiusX)
                      |             . .  .__/\____
                      |             . .  | >      |
                      |             . [] | > \/   |
                      |             .    | > /\   |
                      |             .    |_>______|
                      |             .    . >
                      |             .    . >
                      |             .    bbox[2]+dis2From-majorRadiusX
                      |             .      >
                      |             .______>_
                      |             |      > |
                      |         []  |   \/ > |
                      |             |   /\ > |
                      |             |______>_|
                      |             .    \_/
                      |             .     dis2To (<= majorRadiusX)
                      |             .      >
                      |             .      >
                      |             bbox[2]-dis2To-majorRadiusX
                 */
                dis0To = Math.abs(bbox[0] % majorStep[0]);
                dis1To = Math.abs(bbox[1] % majorStep[1]);
                dis2To = Math.abs(bbox[2] % majorStep[0]);
                dis3To = Math.abs(bbox[3] % majorStep[1]);
                dis0From = majorStep[0] - dis0To;
                dis1From = majorStep[1] - dis1To;
                dis2From = majorStep[0] - dis2To;
                dis3From = majorStep[1] - dis3To;

                if (
                    !includeBoundaries && (
                        (x - minorRadius[0] - bbox[0] - majorRadiusX + dis0From < eps && dis0From - majorRadiusX < eps) ||
                        (x - minorRadius[0] - bbox[0] - majorRadiusX - dis0To < eps && dis0To - majorRadiusX < eps) ||
                        (-x - minorRadius[0] + bbox[2] - majorRadiusX + dis2From < eps && dis2From - majorRadiusX < eps) ||
                        (-x - minorRadius[0] + bbox[2] - majorRadiusX - dis2To < eps && dis2To - majorRadiusX < eps) ||

                        (-y - minorRadius[1] + bbox[1] - majorRadiusY + dis1From < eps && dis1From - majorRadiusY < eps) ||
                        (-y - minorRadius[1] + bbox[1] - majorRadiusY - dis1To < eps && dis1To - majorRadiusY < eps) ||
                        (y - minorRadius[1] - bbox[3] - majorRadiusY + dis3From < eps && dis3From - majorRadiusY < eps) ||
                        (y - minorRadius[1] - bbox[3] - majorRadiusY - dis3To < eps && dis3To - majorRadiusY < eps) ||

                        (-y - minorRadius[1] + bbox[1] < eps) ||
                        (x - minorRadius[0] - bbox[0] < eps) ||
                        (y - minorRadius[1] - bbox[3] < eps) ||
                        (-x - minorRadius[0] + bbox[2] < eps)
                    )
                ) {
                    continue;
                }

                dataArr = createDataArrayForFace(minorFace, minorGrid, x, y, minorRadius[0], minorRadius[1], bbox);
                this.dataX = this.dataX.concat(dataArr[0]);
                this.dataY = this.dataY.concat(dataArr[1]);
            }
        }
    };

    board.grids.push(majorGrid);
    board.grids.push(minorGrid);

    return majorGrid;
};

JXG.registerElement("grid", JXG.createGrid);
