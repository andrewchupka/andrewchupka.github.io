/*

    File: sierpinski-gasket.js
    Date: 4/1/2020
    Author: Andrew Chupka
    Purpose: The purpose of this file is to define the sierpinski-triangle
        custom tag. This tag has a width, foreground color, background color,
        and level attributes which define how the sierpinski triangle is 
        to be drawn in the tag's canvas. Each sierpinski-triangle element
        has its own canvas in which the specfied triangle is drawn.
*/

class SierpinskiGasket extends HTMLElement {
    constructor() {
        super();

        // save the width and height of the canvas
        this.width = Number(this.getAttribute('width'));
        this.height = this.width / (2 * Math.tan(Math.PI / 6));

        // make the canvas 
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;

        // the height is 10 greater than the calculated value to avoid 
        // cutting of any pixels in the bottom row
        this.canvas.height = this.height + 10;

        //this.canvas.style.border = '1px solid';
        this.appendChild(this.canvas);

        // set the color of the foreground and background
        // as well as the recursion level 
        this.foreground = this.getAttribute('foreground');
        this.background = this.getAttribute('background');
        this.level = Number(this.getAttribute('level'));

        // get the graphics context and flip it to allow easier 
        // coordinate math
        this.ctx = this.canvas.getContext('2d');
        this.ctx.translate(0, this.height);
        this.ctx.scale(1, -1);

        // make the first three vertext points
        var v1 = this.makePoint(0, 0);
        var v2 = this.makePoint(this.width, 0);
        var v3 = this.makePoint(this.width / 2, this.height);

        // for some FAT debugging purposes
        console.log(v1);
        console.log(v2);
        console.log(v3);

        // fill the initial triangle with the background color
        this.fillTriangle(v1, v2, v3, this.background);

        // recursively draw the triangle
        this.drawTriangle(v1, v2, v3, this.foreground, this.level);
    }

    drawTriangle(v1, v2, v3, color, level) {

        // get the midpoints of the three vertexes
        var temp12 = this.makePoint((v1.x + v2.x) / 2,
            (v1.y + v2.y) / 2);
        var temp13 = this.makePoint((v1.x + v3.x) / 2,
            (v1.y + v3.y) / 2);
        var temp23 = this.makePoint((v3.x + v2.x) / 2,
            (v3.y + v2.y) / 2);

        // fill the triangle defined by the mid points
        this.fillTriangle(temp12, temp13, temp23, color);

        // recursively draw the three subsequent triangles;
        if (level != 0) {
            this.drawTriangle(v1, temp12, temp13, color, level - 1);
            this.drawTriangle(v2, temp23, temp12, color, level - 1);
            this.drawTriangle(v3, temp13, temp23, color, level - 1);
        }
    }

    // fill the path defined by the verticies with the color specified
    fillTriangle(v1, v2, v3, color) {
        this.ctx.beginPath();
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        this.ctx.moveTo(v1.x, v1.y);
        this.ctx.lineTo(v2.x, v2.y);
        this.ctx.lineTo(v3.x, v3.y);
        this.ctx.lineTo(v1.x, v1.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        return;
    }

    // makes an assoc array such that x and y can be easily accessed 
    makePoint(xCoord, yCoord) {
        return { x: xCoord, y: yCoord };
    }
}

customElements.define('sierpinski-gasket', SierpinskiGasket);