// REQUIRES SpaceManager.js
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

    Sprites.SHEET_CELL_SIZE = 20;
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
    Sprites.prototype.draw = function(posX, posY, width, orientation, ticks) {
	if(! Sprites.sheet) return;

        var cell = ticks % 2;	
        var cellOffset = 
	    (orientation * Sprites.SHEET_CELL_SIZE * 2) + 
	    (cell * Sprites.SHEET_CELL_SIZE);
        this.gfx.drawImage(Sprites.sheet,
			   0, // source x
			   cellOffset, // source Y
			   Sprites.SHEET_CELL_SIZE, // source width
			   Sprites.SHEET_CELL_SIZE, // source height
			   posX, // dest x
			   posY, // dest y
			   width, // dest width
			   width); // dest height
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
	this.space = SpaceManager.treeSpace(this.bounds.left,
					    this.bounds.right,
					    this.bounds.top,
					    this.bounds.bottom);

        for( var i = 0; i < count ; i++) {
	    var newDude = {
                posX : Math.floor(Math.random() * 500),
                posY : Math.floor(Math.random() * 500),
		heading : 0,
		width : 10 // CHANGEME TO 20
            };
            this.dudes.push(newDude);
	    newDude.spaceHandle = this.space.add(newDude, 
						 newDude.posX, newDude.posY,
						 newDude.posX + newDude.width,
						 newDude.posY + newDude.width);
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

    // Will FAIL SILENTLY if distance from point to region 
    // is much larger than maxBound - minBound
    Dudes.prototype.wrap = function(point, minBound, maxBound) {
	var sane = 100;

	while(sane && (minBound > point)) {
	    sane--
	    point = maxBound - (minBound - point);
	}

	while(sane && (maxBound < point)) {
	    sane --
	    point = minBound + (point - maxBound);
	}

	return point;
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

	    var span = 5; // WRONG. should depend on ticks?
	    var heading = nextDude.heading;
	    var dx = Math.cos(heading) * span;
	    var dy = Math.sin(heading) * span;
	    
	    var posX = nextDude.posX + dx;
	    var posY = nextDude.posY + dy;

	    nextDude.posX = this.wrap(posX, this.bounds.left, this.bounds.right);
	    nextDude.posY = this.wrap(posY, this.bounds.top, this.bounds.bottom);
	}
    };

    Dudes.prototype.draw = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    
	    var orientation = this.orientToward(nextDude.heading);

	    this.sprites.draw(nextDude.posX, 
			      nextDude.posY,
			      nextDude.width,
			      orientation, 
			      ticks);
	}
    };

    return Dudes;
})();
