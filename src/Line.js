/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview The geometry object Line is defined in this file. Line stores all
 * style and functional properties that are required to draw and move a line on
 * a board.
 * @author graphjs
 * @version 0.1
 */

/**
 * Constructs a new Line object.
 * @class This is the Line class.
 * It is derived from @see JXG.GeometryElement.
 * It stores all properties required
 * to move, draw a line.
 * @constructor
 * @param {String,JXG.Board} board The board the new line is drawn on.
 * @param {Point} p1 Startpoint of the line.
 * @param {Point} p2 Endpoint of the line.
 * @param {String} id Unique identifier for this object. If null or an empty string is given,
 * an unique id will be generated by Board
 * @param {String} name Not necessarily unique name. If null or an
 * empty string is given, an unique name will be generated.
 * @see JXG.Board#generateName
 */
JXG.Line = function (board, p1, p2, id, name) {
    /* Call the constructor of GeometryElement */
    this.constructor();

    this.init(board, id, name);

    /**
     * Sets type of GeometryElement, value is OBJECT_TYPE_LINE.
     * @final
     * @type int
     */
    this.type = JXG.OBJECT_TYPE_LINE;

    /**
     * Class of element, value is OBJECT_CLASS_LINE;
     */
    this.elementClass = JXG.OBJECT_CLASS_LINE;

    /**
     * Startpoint of the line.
     * @type JXG.Point
     */
    this.point1 = JXG.GetReferenceFromParameter(this.board, p1);

    /**
     * Endpoint of the line.
     * @type JXG.Point
     */
    this.point2 = JXG.GetReferenceFromParameter(this.board, p2);

    /**
     * Image bound to this line
     * @type JXG.Image
     */
    this.image = null;
    this.imageTransformMatrix = [[1,0,0],[0,1,0],[0,0,1]];

    /**
     * This is just for the hasPoint() method.
     * @type int
     */
    this.r = this.board.options.precision.hasPoint;

    this.visProp['fillColor'] = this.board.options.line.fillColor;
    this.visProp['highlightFillColor'] = this.board.options.line.highlightFillColor;
    this.visProp['strokeColor'] = this.board.options.line.strokeColor;
    this.visProp['highlightStrokeColor'] = this.board.options.line.highlightStrokeColor;

    /**
     * Determines if a line is drawn on over the firstpoint.
     * @type bool
     * @see #straightLast
     */
    this.visProp['straightFirst'] = this.board.options.line.straightFirst;
    /**
     * Determines if a line is drawn on over the lastpoint.
     * @type bool
     * @see #straightFirst
     */
    this.visProp['straightLast'] = this.board.options.line.straightLast;

    /**
     * True when the object is visible, false otherwise.
     * @type bool
     */
    this.visProp['visible'] = true;

    /**
     * Determines if a line has an arrow at its firstpoint.
     * @type bool
     * @see #lastArrow
     */
    this.visProp['firstArrow'] = this.board.options.line.firstArrow;

    /**
     * Determines if a line has an arrow at its firstpoint.
     * @type bool
     * @see #firstArrow
     */
    this.visProp['lastArrow'] = this.board.options.line.lastArrow;

    /**
     * Array of Coords storing the coordinates of all ticks.
     * @type Array
     * @see JXG.Coords
     */
    this.ticks = [];

    /**
     * Reference of the ticks created automatically when constructing an axis.
     * @type JXG.Ticks
     * @see JXG.Ticks
     */
    this.defaultTicks = null;

    /**
    * If the line is the border of a polygon, the polygone object is stored, otherwise null.
    * @type JXG.Polygon
    */
    this.parentPolygon = null;

    /* Register line at board */
    this.id = this.board.addLine(this);

    /* Add arrow as child to defining points */
    this.point1.addChild(this);
    this.point2.addChild(this);
    this.update();
};

JXG.Line.prototype = new JXG.GeometryElement;

/**
 * Checks whether (x,y) is near the line.
 * @param {int} x Coordinate in x direction, screen coordinates.
 * @param {int} y Coordinate in y direction, screen coordinates.
 * @return {bool} True if (x,y) is near the line, False otherwise.
 */
 JXG.Line.prototype.hasPoint = function (x, y) {
    var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [x,y], this.board);

    var has = false;
    var i;

    var slope = this.getSlope();
    var rise = this.getRise();

    if(this.visProp['straightFirst'] && this.visProp['straightLast']) {
        var c = [];
        // Compute the stdform of the line in screen coordinates.
        c[0] = this.stdform[0] -
            this.stdform[1]*this.board.origin.scrCoords[1]/(this.board.unitX*this.board.zoomX)+
            this.stdform[2]*this.board.origin.scrCoords[2]/(this.board.unitY*this.board.zoomY);
        c[1] = this.stdform[1]/(this.board.unitX*this.board.zoomX);
        c[2] = this.stdform[2]/(-this.board.unitY*this.board.zoomY);
        var s = this.board.algebra.innerProduct(c,coords.scrCoords,3);
        return (Math.abs(s)<0.5)?true:false; // this.r
    }
    else {
        var p1Scr = this.point1.coords.scrCoords;
        var p2Scr = this.point2.coords.scrCoords;
        if(slope != "INF") {
            for(i = -this.r; i < this.r; i++) {
                   has = has | (Math.abs(y - (slope*(x+i) + rise)) < this.r);
               }
               if(has) {
                   var distP1P = coords.distance(JXG.COORDS_BY_SCREEN, this.point1.coords);
                   var distP2P = coords.distance(JXG.COORDS_BY_SCREEN, this.point2.coords);
                   var distP1P2 = this.point1.coords.distance(JXG.COORDS_BY_SCREEN, this.point2.coords);
                   if((distP1P > distP1P2) || (distP2P > distP1P2)) { // P(x|y) liegt nicht zwischen P1 und P2
                       if(distP1P < distP2P) { // P liegt auf der Seite von P1
                           if(!this.visProp['straightFirst']) {
                               has = false;
                           }
                       }
                       else { // P liegt auf der Seite von P2
                           if(!this.visProp['straightLast']) {
                               has = false;
                           }
                       }
                   }
               }
        }
        else { // senkrechte Gerade
            has = (Math.abs(x-p1Scr[1]) < this.r);
            if(has) { // sonst muss nicht weiter geprueft werden
                if(!this.visProp['straightFirst']) {
                    if(p1Scr[2] < p2Scr[2]) {
                        if(y < p1Scr[2]) {
                           has = false;
                        }
                    }
                    else if(p1Scr[2] > p2Scr[2]) {
                        if(y > p1Scr[2]) {
                           has = false;
                        }
                    }
                }
                if(!this.visProp['straightLast']) {
                    if(p1Scr[2] < p2Scr[2]) {
                        if(y > p2Scr[2]) {
                           has = false;
                        }
                    }
                    else if(p1Scr[2] > p2Scr[2]) {
                        if(y < p2Scr[2]) {
                           has = false;
                        }
                    }
                }
            }
        }
    }

    return has;
};
JXG.Line.prototype.hasPointOld = function (x, y) {
    var p1Scr = this.point1.coords.scrCoords;
    var p2Scr = this.point2.coords.scrCoords;
    var coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [x,y], this.board);

    var has = false;
    var i;

    var slope = this.getSlope();
    var rise = this.getRise();

    if(this.visProp['straightFirst'] && this.visProp['straightLast']) {
        if(slope != "INF") {
            for(i = -this.r; i < this.r; i++) {
                   has = has | (Math.abs(y - (slope*(x+i) + rise)) < this.r);
               }
        }
        else { // senkrechte Gerade
            has = (Math.abs(x-p1Scr[1]) < this.r);
        }
    }
    else {
        if(slope != "INF") {
            for(i = -this.r; i < this.r; i++) {
                   has = has | (Math.abs(y - (slope*(x+i) + rise)) < this.r);
               }
               if(has) {
                   var distP1P = coords.distance(JXG.COORDS_BY_SCREEN, this.point1.coords);
                   var distP2P = coords.distance(JXG.COORDS_BY_SCREEN, this.point2.coords);
                   var distP1P2 = this.point1.coords.distance(JXG.COORDS_BY_SCREEN, this.point2.coords);
                   if((distP1P > distP1P2) || (distP2P > distP1P2)) { // P(x|y) liegt nicht zwischen P1 und P2
                       if(distP1P < distP2P) { // P liegt auf der Seite von P1
                           if(!this.visProp['straightFirst']) {
                               has = false;
                           }
                       }
                       else { // P liegt auf der Seite von P2
                           if(!this.visProp['straightLast']) {
                               has = false;
                           }
                       }
                   }
               }
        }
        else { // senkrechte Gerade
            has = (Math.abs(x-p1Scr[1]) < this.r);
            if(has) { // sonst muss nicht weiter geprueft werden
                if(!this.visProp['straightFirst']) {
                    if(p1Scr[2] < p2Scr[2]) {
                        if(y < p1Scr[2]) {
                           has = false;
                        }
                    }
                    else if(p1Scr[2] > p2Scr[2]) {
                        if(y > p1Scr[2]) {
                           has = false;
                        }
                    }
                }
                if(!this.visProp['straightLast']) {
                    if(p1Scr[2] < p2Scr[2]) {
                        if(y > p2Scr[2]) {
                           has = false;
                        }
                    }
                    else if(p1Scr[2] > p2Scr[2]) {
                        if(y < p2Scr[2]) {
                           has = false;
                        }
                    }
                }
            }
        }
    }

    return has;
};


JXG.Line.prototype.update = function() {
    if (this.needsUpdate) {
        if (true || !this.board.geonextCompatibilityMode) {
            this.updateStdform();
        }
        for(var i=0; i<this.ticks.length; i++) {
            // i don't know why we need this, but if we don't check it, an error will be reported
            // when the origin is moved. it seems like this.ticks.length is lying.
            if(typeof this.ticks[i] != 'undefined')
                this.ticks[i].calculateTicksCoordinates();
        }
    }
    if(this.traced) {
        this.cloneToBackground(true);
    }
};

JXG.Line.prototype.updateStdform = function() {
   /*
    var nx = -(this.point2.coords.usrCoords[2]-this.point1.coords.usrCoords[2]);
    var ny =  this.point2.coords.usrCoords[1]-this.point1.coords.usrCoords[1];
    var c = -(nx*this.point1.coords.usrCoords[1]+ny*this.point1.coords.usrCoords[2]);

    this.stdform[0] = c;
    this.stdform[1] = nx;
    this.stdform[2] = ny;
    */
    var v = [];
    v = this.board.algebra.crossProduct(this.point1.coords.usrCoords,this.point2.coords.usrCoords);
    this.stdform[0] = v[0];
    this.stdform[1] = v[1];
    this.stdform[2] = v[2];
    this.stdform[3] = 0;
    this.normalize();
};

/**
 * Uses the boards renderer to update the line.
 */
 JXG.Line.prototype.updateRenderer = function () {
    if (this.needsUpdate && this.visProp['visible']) {
        var wasReal = this.isReal;
        this.isReal = (isNaN(this.point1.coords.usrCoords[1]+this.point1.coords.usrCoords[2]+this.point2.coords.usrCoords[1]+this.point2.coords.usrCoords[2]))?false:true;
        if (this.isReal) {
            if (wasReal!=this.isReal) {
                this.board.renderer.show(this);
                //if(this.label.show) this.board.renderer.show(this.label);
            }
            this.board.renderer.updateLine(this);
        } else {
            if (wasReal!=this.isReal) {
                this.board.renderer.hide(this);
                //if(this.label.show) this.board.renderer.hide(this.label);
            }
        }

        //this.board.renderer.updateLine(this); // Why should we need this?
        this.needsUpdate = false;
    }
};

/**
 * Calculates the rise of the line (Achsenabschnitt)
 * @type float
 * @return The rise of the line
 */
JXG.Line.prototype.getRise = function () {
    var p1Scr = this.point1.coords.scrCoords;
    var p2Scr = this.point2.coords.scrCoords;

    return Math.round((p1Scr[2] - (p1Scr[1]*(p2Scr[2]-p1Scr[2]))/(p2Scr[1]-p1Scr[1])));
};

/**
 * Calculates the slope of the line described by the arrow. (Steigung)
 * @type float
 * @return The slope of the line or INF if the line is parallel to the y-axis.
 */
JXG.Line.prototype.getSlope = function () {
    var p1scr = this.point1.coords.scrCoords;
    var p2scr = this.point2.coords.scrCoords;

    var p1usr = this.point1.coords.usrCoords;
    var p2usr = this.point2.coords.usrCoords;
    
    // let's see which one of the coordinates is more useful for us.
    if(Math.abs(p2scr[1]-p1scr[1]) <= Math.abs(p2usr[1]-p1usr[1])) {
        p2scr = p2usr;
        p1scr = p1usr;
    }

    if(Math.abs(p2scr[1]-p1scr[1]) >= JXG.Math.eps) {
        return ((p2scr[2]-p1scr[2])/(p2scr[1]-p1scr[1]));
    }
    else {
        return "INF";
    }
};

/**
 * Determines whether the line is drawn on over start and end point and updates the line.
 * @param {bool} straightFirst True if the Line shall be drawn on over the startpoint, false otherwise.
 * @param {bool} straightLast True if the Line shall be drawn on over the endpoint, false otherwise.
 * @see #straightFirst
 * @see #straightLast
 */
 JXG.Line.prototype.setStraight = function (straightFirst, straightLast) {
    this.visProp['straightFirst'] = straightFirst;
    this.visProp['straightLast'] = straightLast;

    this.board.renderer.updateLine(this);
};

/**
 * Determines whether the line has arrows at start or end of the line.
 * @param {bool} firstArrow True if there is an arrow at the start of the line, false otherwise.
 * @param {bool} lastArrow True if there is an arrow at the end of the line, false otherwise.
 * Is stored at visProp['firstArrow'] and visProp['lastArrow']
 */
JXG.Line.prototype.setArrow = function (firstArrow, lastArrow) {
     this.visProp['firstArrow'] = firstArrow;
     this.visProp['lastArrow'] = lastArrow;

     this.board.renderer.updateLine(this);
};

/**
 * Calculates TextAnchor.
 * @type JXG.Coords
 * @return Text anchor coordinates as JXG.Coords object.
 */
JXG.Line.prototype.getTextAnchor = function() {
    return new JXG.Coords(JXG.COORDS_BY_USER, [0.5*(this.point2.X() - this.point1.X()),0.5*(this.point2.Y() - this.point1.Y())],this.board);
};

/**
 * Copy the element to the background.
 * @param {bool} addToTrace Not used.
 */
JXG.Line.prototype.cloneToBackground = function(addToTrace) {
    var copy = {};
    copy.id = this.id + 'T' + this.numTraces;
    this.numTraces++;
    copy.point1 = this.point1;
    copy.point2 = this.point2;

    copy.stdform = this.stdform;

    copy.board = {};
    copy.board.unitX = this.board.unitX;
    copy.board.unitY = this.board.unitY;
    copy.board.zoomX = this.board.zoomX;
    copy.board.zoomY = this.board.zoomY;
    copy.board.origin = this.board.origin;
    copy.board.canvasHeight = this.board.canvasHeight;
    copy.board.canvasWidth = this.board.canvasWidth;
    copy.board.dimension = this.board.dimension;
    copy.board.algebra = this.board.algebra;

    copy.visProp = this.visProp;
    var s = this.getSlope();
    var r = this.getRise();
    copy.getSlope = function() { return s; };
    copy.getRise = function() { return r; };

    this.board.renderer.enhancedRendering = true;
    this.board.renderer.drawLine(copy);
    this.board.renderer.enhancedRendering = false;
    this.traces[copy.id] = document.getElementById(copy.id);

    delete copy;

/*
    var id = this.id + 'T' + this.numTraces;
    this.traces[id] = this.board.renderer.cloneSubTree(this,id,'lines');
    this.numTraces++;
*/
};

JXG.Line.prototype.addTransform = function (transform) {
    var list;
    if (JXG.IsArray(transform)) {
        list = transform;
    } else {
        list = [transform];
    }
    for (var i=0;i<list.length;i++) {
        this.point1.transformations.push(list[i]);
        this.point2.transformations.push(list[i]);
    }
};

JXG.Line.prototype.setPosition = function (method, x, y) {
    //var oldCoords = this.coords;
    //if(this.group.length != 0) {
    // AW: Do we need this for lines?
        // this.coords = new JXG.Coords(method, [x,y], this.board);
        // this.group[this.group.length-1].dX = this.coords.scrCoords[1] - oldCoords.scrCoords[1];
        // this.group[this.group.length-1].dY = this.coords.scrCoords[2] - oldCoords.scrCoords[2];
        // this.group[this.group.length-1].update(this);
    //} else {
        var t = this.board.createElement('transform',[x,y],{type:'translate'});
        if (this.point1.transformations.length>0 && this.point1.transformations[this.point1.transformations.length-1].isNumericMatrix) {
            this.point1.transformations[this.point1.transformations.length-1].melt(t);
        } else {
            this.point1.addTransform(this.point1,t);
        }
        if (this.point2.transformations.length>0 && this.point2.transformations[this.point2.transformations.length-1].isNumericMatrix) {
            this.point2.transformations[this.point2.transformations.length-1].melt(t);
        } else {
            this.point2.addTransform(this.point2,t);
        }
        //this.addTransform(t);
        //this.update();
    //}
};

/**
* Treat the line as parametric curve in homogeneuous coordinates.
* x = 1 * sin(theta)*cos(phi)
* y = 1 * sin(theta)*sin(phi)
* z = 1 * sin(theta)
* and the line is the set of solutions of a*x+b*y+c*z = 0
* It follows:
* sin(theta)*(a*cos(phi)+b*sin(phi))+c*cos(theta) = 0
* Define:
*   A = (a*cos(phi)+b*sin(phi))
*   B = c
* Then
* cos(theta) = A/sqrt(A*A+B*B)
* sin(theta) = -B/sqrt(A*A+B*B)
* and X(phi) = x from above.
* phi runs from 0 to 1
* @return X(phi)
*/
JXG.Line.prototype.X = function (phi) {
    phi *= Math.PI;
    var a = this.stdform[1];
    var b = this.stdform[2];
    var c = this.stdform[0];
    var A = a*Math.cos(phi)+b*Math.sin(phi);
    var B = c;
    var sq = Math.sqrt(A*A+B*B);
    var sinTheta = -B/sq;
    var cosTheta = A/sq;
    if (Math.abs(cosTheta)<this.board.algebra.eps) { cosTheta = 1.0; }
    return sinTheta*Math.cos(phi)/cosTheta;
}

/**
* Treat the line as parametric curve in homogeneous coordinates.
* @return Y(phi)
*/
JXG.Line.prototype.Y = function (phi) {
    phi *= Math.PI;
    var a = this.stdform[1];
    var b = this.stdform[2];
    var c = this.stdform[0];
    var A = a*Math.cos(phi)+b*Math.sin(phi);
    var B = c;
    var sq = Math.sqrt(A*A+B*B);
    var sinTheta = -B/sq;
    var cosTheta = A/sq;
    if (Math.abs(cosTheta)<this.board.algebra.eps) { cosTheta = 1.0; }
    return sinTheta*Math.sin(phi)/cosTheta;
}

/**
* Treat the line as parametric curve in homogeneous coordinates.
* @return Z(phi)
*/
JXG.Line.prototype.Z = function (phi) {
    phi *= Math.PI;
    var a = this.stdform[1];
    var b = this.stdform[2];
    var c = this.stdform[0];
    var A = a*Math.cos(phi)+b*Math.sin(phi);
    var B = c;
    var sq = Math.sqrt(A*A+B*B);
    var cosTheta = A/sq;
    if (Math.abs(cosTheta)>=this.board.algebra.eps) {
        return 1.0;
    } else {
        return 0.0;
    }
}

/**
* Treat the circle as parametric curve:
* t runs from 0 to 1
**/
JXG.Line.prototype.minX = function () {
    return 0.0;
}

/**
* Treat the circle as parametric curve:
* t runs from 0 to 1
**/
JXG.Line.prototype.maxX = function () {
    return 1.0;
}

/**
 * Adds ticks to this line.
 * @param {JXG.Ticks} ticks Reference to a ticks object.
 * @type String
 * @return Id of the ticks object.
 */
JXG.Line.prototype.addTicks = function(ticks) {
    if(ticks.id == '' || typeof ticks.id == 'undefined')
        ticks.id = this.id + '_ticks_' + (this.ticks.length+1);

    this.board.renderer.drawTicks(ticks);
    this.ticks.push(ticks);

    this.ticks[this.ticks.length-1].updateRenderer();

    return ticks.id;
};

/**
 * Removes all ticks from a line.
 */
JXG.Line.prototype.removeAllTicks = function() {
    for(var t=this.ticks.length; t>0; t--) {
        this.board.renderer.remove(this.ticks[t-1].rendNode);
    }
    this.ticks = new Array();
}

/**
 * Removes ticks identified by parameter named tick.
 * @param {JXG.Ticks} tick Reference to tick object to remove.
 */
JXG.Line.prototype.removeTicks = function(tick) {
    if(this.defaultTicks != null && this.defaultTicks == tick) {
        this.defaultTicks = null;
    }

    for(var t=this.ticks.length; t>0; t--) {
        if(this.ticks[t-1] == tick) {
            this.board.renderer.remove(this.ticks[t-1].rendNode);

            for(var j=0; j<this.ticks[t-1].ticks.length; j++) {
                if(this.ticks[t-1].labels[j] != null)
                    if (this.ticks[t-1].labels[j].show) this.board.renderer.remove(this.ticks[t-1].labels[j].rendNode);
            }
            delete(this.ticks[t-1]);
        }
    }
}

/**
 * Creates a new line.
 * @param {JXG.Board} board The board the line is put on.
 * @param {Array} parents Array of two points defining the line or three coordinates for a free line
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Line
 * @return Reference to the created line object.
 */
JXG.createLine = function(board, parents, atts) {
    var el;

    if((parents[0].elementClass == JXG.OBJECT_CLASS_POINT) && (parents[1].elementClass == JXG.OBJECT_CLASS_POINT)) {
        // line through two points
        var p1 =  JXG.GetReferenceFromParameter(board,parents[0]);
        var p2 =  JXG.GetReferenceFromParameter(board,parents[1]);
        el = new JXG.Line(board, p1.id, p2.id, atts['id'], atts['name']);
    } else if (parents.length==3) {
        // free line
        var c = [];
        for (var i=0;i<3;i++) {
            if (typeof parents[i]=='number') {
                c[i] = function(z){ return function() { return z; }; }(parents[i]);
            } else if (typeof parents[i]=='function') {
                c[i] = parents[i];
            } else {
                throw ("Can't create line with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "' and '" + (typeof parents[2])+ "'.");
                return;
            }
        }
        // point 1: (0,c,-b)
        var p1 = board.createElement('point',[
                function() { return 0.0;},
                function() { return c[2]();},
                function() { return -c[1]();}],{visible:false,name:' '});
        // point 2: (b^2+c^2,-ba+c,-ca-b)
        var p2 = board.createElement('point',[
                function() { return c[2]()*c[2]()+c[1]()*c[1]();},
                function() { return -c[1]()*c[0]()+c[2]();},
                function() { return -c[2]()*c[0]()-c[1]();}],{visible:false,name:' '});
        el = new JXG.Line(board, p1.id, p2.id, atts['id'], atts['name']);
    } else if ((parents.length == 2) && (parents[0].length>1 && parents[1].length>1)) {
        var point1 = new JXG.Point(board, parents[0], '', '', false);
        var point2 = new JXG.Point(board, parents[1], '', '', false);

        /* Make the points fixed */
        point1.fixed = true;
        point2.fixed = true;

        el = new JXG.Line(board, point1.id, point2.id, atts['id'], atts['name']);
    } else
        throw ("Can't create line with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'.");
    return el;
};

JXG.JSXGraph.registerElement('line', JXG.createLine);

/**
 * Creates a new segment, i.e. a line with <tt>visProp['straight*'] = true</tt>.
 * @param {JXG.Board} board The board the segment is put on.
 * @param {Array} parents Array of two points defining the segment or three coordinates for a free line
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Line
 * @return Reference to the created line object.
 */
JXG.createSegment = function(board, parents, atts) {
    var el;

    if(atts == null)
        atts = new Object();
    
    atts.straightFirst = false;
    atts.straightLast = false;
    el = board.createElement('line', parents, atts);

    return el;
};

JXG.JSXGraph.registerElement('segment', JXG.createSegment);

/**
 * Creates a new arrow.
 * @param {JXG.Board} board The board the arrow is put on.
 * @param {Array} parents Array of two points defining the arrow.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Line
 * @return Reference to the created line object.
 */
JXG.createArrow = function(board, parents, attributes) {
    var el;

    if ( (JXG.IsPoint(parents[0])) && (JXG.IsPoint(parents[1])) ) {
        el = new JXG.Line(board, parents[0], parents[1], attributes['id'], attributes['name']);
        el.setStraight(false,false);
        el.setArrow(false,true);
    } // Ansonsten eine fette Exception um die Ohren hauen
    else
        throw ("Can't create arrow with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'.");

    return el;
};

JXG.JSXGraph.registerElement('arrow', JXG.createArrow);

/**
 * Creates a new axis.
 * @param {JXG.Board} board The board the arrow is put on.
 * @param {Array} parents Array of two points defining the arrow.
 * @param {Object} attributs Object containing properties for the element such as stroke-color and visibility. See @see JXG.GeometryElement#setProperty
 * @type JXG.Line
 * @return Reference to the created axis object.
 */
JXG.createAxis = function(board, parents, attributes) {
    // Arrays oder Punkte, mehr brauchen wir nicht.
    if ( (JXG.IsArray(parents[0]) || JXG.IsPoint(parents[0]) ) && (JXG.IsArray(parents[1]) || JXG.IsPoint(parents[1])) ) {
        var point1;
        if( JXG.IsPoint(parents[0]) )
            point1 = parents[0];
        else
            point1 = new JXG.Point(board, parents[0],'','',false);

        var point2;
        if( JXG.IsPoint(parents[1]) )
            point2 = parents[1];
        else
            point2 = new JXG.Point(board,parents[1],'','',false);

        /* Make the points fixed */
        point1.fixed = true;
        point2.fixed = true;

        if(attributes == null)
            attributes = new Object();

        attributes.lastArrow = true;
        attributes.straightFirst = true;
        attributes.straightLast = true;
        if(attributes.strokeWidth == null)
            attributes.strokeWidth = 1;

        var line = board.createElement('line', [point1, point2], attributes);
        line.needsRegularUpdate = false;  // Axes only updated after zooming and moving of  the origin.

        if(attributes.minorTicks == 'undefined' || attributes.minorTicks == null)
            attributes.minorTicks = 4;

        if((attributes.insertTicks == 'undefined') || (attributes.insertTicks == null))
            attributes.insertTicks = 'true';

        var dist;
        if(attributes.ticksDistance != 'undefined' && attributes.ticksDistance != null) {
            dist = attributes.ticksDistance;
        } else {
            var c1 = new JXG.Coords(JXG.COORDS_BY_USER, [line.point1.coords.usrCoords.slice(1)],board);
            var c2 = new JXG.Coords(JXG.COORDS_BY_USER, [line.point2.coords.usrCoords.slice(1)],board);
            board.renderer.calcStraight(line, c1, c2);
            var len = c1.distance(JXG.COORDS_BY_USER,c2);
            len *= 0.25;
            if (len>=1) {
                len = Math.round(len*0.2)*5;
                dist = len;
            } else {
                dist = 0.25;
                while (4*dist>len) { dist *= 0.5; }
            }
        }

        var defTicks = board.createElement('ticks', [line, dist], attributes);
        line.defaultTicks = defTicks;
    }
    else
        throw ("Can't create point with parent types '" + (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'.");

    return line;
};

JXG.JSXGraph.registerElement('axis', JXG.createAxis);

/**
 * Create a tangent to a curve, line or circle c through a point p
 * @param {JXG.Board} board Reference to the board the tangent is drawn on.
 * @param {Array} parents Array containing a glider object p.
 * @param {Object} attributes Define color, width, ... of the tangent
 * @type JXG.Curve
 * @return Returns reference to an object of type JXG.Line.
 */
JXG.createTangent = function(board, parents, attributes) {
    var p = parents[0];
    var c = p.slideObject;
    if (c.elementClass == JXG.OBJECT_CLASS_LINE) {
        return board.createElement('line', [c.point1,c.point2], attributes);
    } else if (c.elementClass == JXG.OBJECT_CLASS_CURVE) {
        var g = c.X;
        var f = c.Y;
        return board.createElement('line', [
                    function(){ return -p.X()*board.D(f)(p.position)+p.Y()*board.D(g)(p.position);},
                    function(){ return board.D(f)(p.position);},
                    function(){ return -board.D(g)(p.position);}
                    ], attributes );
    } else if (c.elementClass == JXG.OBJECT_CLASS_CIRCLE) {
        var Dg = function(t){ return -c.getRadius()*Math.sin(t); };
        var Df = function(t){ return c.getRadius()*Math.cos(t); };
        return board.createElement('line', [
                    function(){ return -p.X()*Df(p.position)+p.Y()*Dg(p.position);},
                    function(){ return Df(p.position);},
                    function(){ return -Dg(p.position);}
                    ], attributes );
    }
}

/**
 * Register the element type tangent at JSXGraph
 * @private
 */
JXG.JSXGraph.registerElement('tangent', JXG.createTangent);
