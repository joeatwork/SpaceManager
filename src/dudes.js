Dudes = (function(){
    ////////////////////////////////////////////////////
    // View

    var Sprites = function(gfx) {
        // A manages rendering from the image
        // to the graphics context. 
	this.gfx = gfx;
    };

    // There is a bit of punning on these values,
    // It isn't safe to change these numbers.
    Sprites.DOWN = 0;
    Sprites.UP = 1;
    Sprites.RIGHT = 2;
    Sprites.LEFT = 3;
    Sprites.sheet = null;

    Sprites.setSheet = function(sheet) { /* ??? */
        Sprites.sheet = sheet;
    };

    var pixelSheet = new Image();
    pixelSheet.onload = function() {
	Sprites.setSheet(pixelSheet);
    };
    pixelSheet.src =
	"resources/images/pixel-person-20x20.png";

    Sprites.prototype.clearRect = function(x, y, width, height) {
        this.gfx.clearRect(x, y, width, height);
    };

    /**
     * posX, posY : x and y offsets
     * orientation : one of UP, DOWN, LEFT, RIGHT
     * ticks : absolute animation time
     */
    Sprites.prototype.draw = function(posX, posY, orientation, ticks) {
	if(! Sprites.sheet) return;

        var cell = ticks % 2;
        var cellOffset = (orientation * 40) + (cell * 20);
        this.gfx.drawImage(Sprites.sheet,
			   0, // source x
			   cellOffset, // source Y
			   20, // source width
			   20, // source height
			   posX, // dest x
			   posY, // dest y
			   20, // dest width
			   20); // dest height
    };

    //////////////////////////////////////////////////////////
    // MODEL - DRIVES THE VIEW

    var Dudes = function(gfx, 
			 xLowBound, xHighBound,
			 yLowBound, yHighBound,
			 count, strategy) {
        // A COLLECTION of 'model' Dudes, who scurry around.
	this.sprites = new Sprites(gfx);
        this.dudes = [];
	this.bounds = {
	    left: xLowBound,
	    right: xHighBound,
	    top: yLowBound,
	    bottom: yHighBound
	};
	this.strategy = strategy;

        for( var i = 0; i < count ; i++) {
            this.dudes.push({
                posX : Math.floor(Math.random() * 500),
                posY : Math.floor(Math.random() * 500),
		heading : 0,
            });
	}
    };

    // Angle zero is DUE EAST, so we have to
    // wrap around.
    var ANGLE_SCALE = (Math.PI/4.0);
    var ANGLE_TO_ORIENTATION = [
	Sprites.RIGHT,
	Sprites.DOWN,
	Sprites.DOWN,
	Sprites.LEFT,
	Sprites.LEFT,
	Sprites.UP,
	Sprites.UP,
	Sprites.RIGHT
    ];

    Dudes.prototype.orientToward = function(heading) {
	var orientIx = 
	    Math.floor(heading / ANGLE_SCALE ) % ANGLE_TO_ORIENTATION.length;
	return ANGLE_TO_ORIENTATION[orientIx];
    }

    Dudes.prototype.update = function(ticks /* ?? */) {
	this.clean();
	this.move(ticks);
	this.draw(ticks);
    };

    Dudes.prototype.clean = function() {
	this.sprites.clearRect(
	    this.bounds.left, this.bounds.top,
	    this.bounds.right - this.bounds.left,
	    this.bounds.bottom - this.bounds.top);
    };


    Dudes.prototype.move = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    
	    this.strategy.call(window, nextDude, [], ticks);
	    
	    /***
	    var angle = Math.floor(ticks + dudeIx / 8) % 
		Dudes.ANGLE_TO_HEADING.length;

	    var heading = Dudes.ANGLE_TO_HEADING[angle];
	    var span = 5;
	    
	    nextDude.angle = angle;
	    **/
	    var span = 5; // SHOULD BE 5 * deltaTicks
	    var heading = nextDude.heading;
	    var dx = Math.cos(heading) * span;
	    var dy = Math.sin(heading) * span;

	    nextDude.posX = 
		(nextDude.posX + dx) % this.bounds.right;
	    nextDude.posY = 
		(nextDude.posY + dy) % this.bounds.bottom;
	}
    };

    Dudes.prototype.draw = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    
	    var orientation = this.orientToward(nextDude.heading);

	    this.sprites.draw(nextDude.posX, 
			      nextDude.posY, 
			      orientation, 
			      ticks);
	}
    };

    return Dudes;
})();
