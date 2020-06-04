/* 
    File: game-of-life2.js
    Date: 5/2/20
    Author: Andrew Chupka
    Purpose: This javascript file is meant to define a custom html element that
        is meant to emulate the board in the Game of Life simulation as 
        defined by John Conway in 1970. 
*/

class GameOfLife extends HTMLElement {
    constructor() {
        super();

        this.createButtons(); // set up the buttons to control the game
        this.createCanvas(); // sets up the front canvas
        this.createBack(); // sets up the back context and canvas

        this.rows = Math.floor(Number(this.dataset.height) / this.dataset.size);
        this.cols = Math.floor(Number(this.dataset.width) / this.dataset.size);
        this.size = Number(this.dataset.size);

        // initialize the array to represent the state of the game
        this.gameArray = new Array(this.rows + 2);
        for (var i = 0; i < this.gameArray.length; i++) {
            this.gameArray[i] = new Array(this.cols + 2);
            for (var j = 0; j < this.gameArray[i].length; j++) {
                this.gameArray[i][j] = 0;
            }
        }

        // console.log(this.gameArray);

        this.interval = 250; // drawing interval
        this.running = false; // boolean to control the animation

        // draws the backing context with the lines
        this.drawBack();
        this.ctx.drawImage(this.back, 0, 0);
    }

    // creates the main canvas
    createCanvas() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = Number(this.dataset.width);
        this.canvas.height = Number(this.dataset.height);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = this.dataset.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.addEventListener("click", this.clicked.bind(this));
        this.appendChild(this.canvas);
    }

    // creates the back canvas
    createBack() {
        this.back = document.createElement('canvas');
        this.back.width = Number(this.dataset.width);
        this.back.height = Number(this.dataset.width);
        this.backCtx = this.back.getContext('2d');
        this.backCtx.fillStyle = this.dataset.bg;
        this.backCtx.fillRect(0, 0, this.back.width, this.back.height);
    }

    // sets up the buttons to control the animation
    createButtons() {
        // setup div
        this.buttonDiv = document.createElement('div');

        // set up buttons
        this.start = document.createElement("button");
        this.stop = document.createElement("button");
        this.reset = document.createElement("button");

        this.start.innerText = "Start";
        this.stop.innerText = "Stop";
        this.reset.innerText = "Reset";

        this.start.addEventListener("click", this.startGame.bind(this));
        this.stop.addEventListener("click", this.stopGame.bind(this));
        this.reset.addEventListener("click", this.resetGame.bind(this));

        this.stop.disabled = true;

        // setup dropdown
        this.initDrop = document.createElement("select");

        var option = document.createElement("option");
        option.text = "-- None --";
        this.initDrop.add(option);

        option = document.createElement("option");
        option.text = "Blinker";
        this.initDrop.add(option);

        option = document.createElement("option");
        option.text = "Toad";
        this.initDrop.add(option);

        option = document.createElement("option");
        option.text = "Beacon";
        this.initDrop.add(option);

        option = document.createElement("option");
        option.text = "Glider";
        this.initDrop.add(option);

        option = document.createElement("option");
        option.text = "LWSS";
        this.initDrop.add(option);

        // set up the environment with the selected initial configuration
        this.initDrop.addEventListener("change", this.preDefInit.bind(this));

        // append elements
        this.buttonDiv.appendChild(this.start);
        this.buttonDiv.appendChild(this.stop);
        this.buttonDiv.appendChild(this.reset);
        this.buttonDiv.appendChild(this.initDrop);

        this.appendChild(this.buttonDiv);
    }

    // function to handle when the user clicks in the canvas
    clicked() {
        // do nothing if the game is running
        if (this.running) {
            return;
        }

        // calculate the row and column the cell belongs to
        var col = Math.floor(event.offsetX / this.size);
        var row = Math.floor(event.offsetY / this.size);

        // check if the cell if being drawn or cleared
        if (event.getModifierState("Shift") || event.getModifierState("CapsLock")) {
            this.ctx.fillStyle = this.dataset.bg;
            this.gameArray[row + 1][col + 1] = 0;
        } else {
            this.ctx.fillStyle = this.dataset.fg;
            this.gameArray[row + 1][col + 1] = 1;
        }

        // draw the cell on the front and back canvas
        this.drawBack();
        this.ctx.drawImage(this.back, 0, 0);
        //console.log(this.gameArray);
    }

    // function to clear the canvases when the reset button is pressed
    resetGame() {
        // clear the canvases
        this.ctx.fillStyle = this.dataset.bg;
        this.backCtx.fillStyle = this.dataset.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.backCtx.fillRect(0, 0, this.back.width, this.back.height);

        // reset the gameArray
        for (var i = 0; i < this.gameArray.length; i++) {
            for (var j = 0; j < this.gameArray[i].length; j++) {
                this.gameArray[i][j] = 0;
            }
        }

        // change the button status
        this.start.disabled = false;
        this.stop.disabled = true;
        this.initDrop.disabled = false;
        this.running = false;

        console.log("Resetting board");
        this.drawBack();
        this.ctx.drawImage(this.back, 0, 0);
        // console.log(this.gameArray);
    }

    // function to start the game of life simulation
    startGame() {
        this.start.disabled = true;
        this.stop.disabled = false;
        this.initDrop.disabled = true;
        this.running = true;

        // draw the current state to the back canvas before running the simualtion
        this.backCtx.drawImage(this.canvas, 0, 0);

        console.log("Starting");
        this.run();
    }

    // function to stop the game of life simulation
    stopGame() {
        this.start.disabled = false;
        this.stop.disabled = true;
        this.initDrop.disabled = false;
        this.running = false;
        console.log("Stopping");
    }

    // function to handle running the simulation
    run() {
        if (this.running) {
            // console.log("Updating");
            this.step();
            requestAnimationFrame(() => {
                this.ctx.drawImage(this.back, 0, 0);
                setTimeout(this.run.bind(this), this.interval);
            });
        }
    }

    // function to handle a single step in the animation
    step() {
        // console.log("Step");

        // create a temp array to store the new live and dead values
        var tempArray = new Array(this.gameArray.length);
        for (var i = 0; i < tempArray.length; i++) {
            tempArray[i] = new Array(this.gameArray[i].length);
            for (var j = 0; j < tempArray[i].length; j++) {
                tempArray[i][j] = 0;
            }
        }

        // evaluate the live and dead status of each of the cells
        for (var i = 1; i < this.gameArray.length - 1; i++) {
            for (var j = 1; j < this.gameArray[i].length - 1; j++) {
                var status = this.getLiveStatus(j, i);
                //console.log("x: " + j + " y: " + i + " status: " + status);
                tempArray[i][j] = status;
            }
        }

        // save the new game array
        this.gameArray = tempArray;

        // console.log("Temp Array");
        // console.log(tempArray);
        // console.log(tempArray == this.gameArray);

        // draw the new backing context
        this.drawBack();
    }

    // checks if the specified cell will be alive or dead
    getLiveStatus(x, y) {
        var liveNeighbors = 0; // count of living neighbors a cell has
        var living = this.gameArray[y][x]; // current cell's living status

        // count the number of living neighbors a cell has
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (i == x && j == y) {
                    continue;
                }

                if (this.gameArray[j][i] == 1) {
                    liveNeighbors++;
                }
            }
        }

        // checks if the cell is currently living
        if (living == 1) {

            // console.log("x: " + x + " y: " + y + " living");
            // if (liveNeighbors != 0) {
            //     console.log(liveNeighbors);
            // }

            // cell dies
            if (liveNeighbors > 3) {
                return 0;
            }
            //cell dies
            else if (liveNeighbors < 2) {
                return 0;
            }
            //cell lives
            else {
                return 1;
            }
        }

        // checks if the cell is currently dead
        else {

            // if (liveNeighbors != 0) {
            //     console.log("x: " + x + " y: " + y + " dead");
            //     console.log(liveNeighbors);
            // }

            // cells lives 
            if (liveNeighbors == 3) {
                return 1;
            }
            //cell is dead
            else {
                return 0;
            }
        }
    }

    // draw the back canvas with the current gameArray data
    drawBack() {
        // console.log("drawing");

        // blank the canvas
        this.backCtx.fillStyle = this.dataset.bg;
        this.backCtx.fillRect(0, 0, this.back.width, this.back.height);

        // for every cell, check if it is living and draw a square if so
        for (var i = 1; i < this.gameArray.length - 1; i++) {
            for (var j = 1; j < this.gameArray[i].length - 1; j++) {

                // draw cell
                if (this.gameArray[i][j] == 1) {
                    var topCornerX = (j - 1) * this.size;
                    var topCornerY = (i - 1) * this.size;
                    this.backCtx.fillStyle = this.dataset.fg;
                    this.backCtx.fillRect(topCornerX, topCornerY, this.size, this.size);
                }
            }
        }
        // draw the grid lines over top
        this.drawLines();
    }

    // function to handle drawing grid lines to make the board more
    // visually appealing
    drawLines() {
        this.backCtx.beginPath();
        // draw vertical lines
        for (var i = 1; i < this.rows; i++) {
            this.backCtx.moveTo(i * this.size, 0);
            this.backCtx.lineTo(i * this.size, this.back.height);
        }

        // draw horizontal lines
        for (var i = 0; i < this.cols; i++) {
            this.backCtx.moveTo(0, i * this.size);
            this.backCtx.lineTo(this.back.width, i * this.size);
        }

        // set the styles
        this.backCtx.strokeStyle = 'black';
        this.backCtx.lineWidth = 1;

        // draw the lines
        this.backCtx.stroke();
    }

    // function to handle setting up the predefined configurations in the 
    // simulation
    preDefInit() {
        console.log("init");

        // reset the environment to draw the configuration by itself
        this.resetGame();

        // console.log(Number(this.initDrop.selectedIndex));

        // switch statment to change the array for the predefined 
        // configurations. 
        switch (Number(this.initDrop.selectedIndex)) {
            // blinker
            case 1:
                this.gameArray[1][2] = 1;
                this.gameArray[2][2] = 1;
                this.gameArray[3][2] = 1;
                break;

                // toad
            case 2:
                this.gameArray[2][2] = 1;
                this.gameArray[2][3] = 1;
                this.gameArray[2][4] = 1;
                this.gameArray[3][1] = 1;
                this.gameArray[3][2] = 1;
                this.gameArray[3][3] = 1;
                break;

                // beacon
            case 3:
                this.gameArray[1][1] = 1;
                this.gameArray[1][2] = 1;
                this.gameArray[2][1] = 1;
                this.gameArray[2][2] = 1;
                this.gameArray[3][3] = 1;
                this.gameArray[3][4] = 1;
                this.gameArray[4][3] = 1;
                this.gameArray[4][4] = 1;
                break;

                // glider
            case 4:
                this.gameArray[1][1] = 1;
                this.gameArray[2][2] = 1;
                this.gameArray[2][3] = 1;
                this.gameArray[3][1] = 1;
                this.gameArray[3][2] = 1;
                break;

                // LWSS
            case 5:
                this.gameArray[2][2] = 1;
                this.gameArray[2][3] = 1;
                this.gameArray[2][4] = 1;
                this.gameArray[2][5] = 1;
                this.gameArray[3][5] = 1;
                this.gameArray[4][5] = 1;
                this.gameArray[5][4] = 1;
                this.gameArray[3][1] = 1;
                this.gameArray[5][1] = 1;
                break;
            default:
                break;
        }

        // draw the backing context with this new information
        // this then draws the lines on the environment and copies
        // the back canvas to the front
        this.drawBack();
        this.ctx.drawImage(this.back, 0, 0);
    }

}

customElements.define('game-of-life', GameOfLife);