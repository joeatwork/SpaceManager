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

    Sprites.prototype.clean = function(posX, posY) {
        this.gfx.clearRect(posX, 
			   posY, 
			   20, 20);
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

    var Dudes = function(gfx) {
        // A COLLECTION of 'model' Dudes, who scurry around.
	this.sprites = new Sprites(gfx);
        this.dudes = [];
        for( var i = 0; i < 5000 ; i++) {
            this.dudes.push({
                posX : Math.floor(Math.random() * 500),
                posY : Math.floor(Math.random() * 500),
		angle : 0
            });
	}
    };

    Dudes.ANGLE_TO_HEADING = [];

    (function() {
	var angleRange = 20;
	var radians = (2.0 * Math.PI)/angleRange;
	for(var angle=0; angle < angleRange; angle++) {
	    Dudes.ANGLE_TO_HEADING[angle] = {
		x : Math.cos(angle * radians),
		y : Math.sin(angle * radians)
	    };
	};
    })();

    // Map our 20 angles to orientations.
    // Notice angles move COUNTERCLOCKWISE FROM WEST.
    Dudes.ANGLE_TO_ORIENTATION = [
	Sprites.RIGHT, // Due West
	Sprites.RIGHT,
	Sprites.RIGHT,

	Sprites.DOWN,
	Sprites.DOWN,
	Sprites.DOWN, // Due South
	Sprites.DOWN,
	Sprites.DOWN,

	Sprites.LEFT,
	Sprites.LEFT,
	Sprites.LEFT, // Due East
	Sprites.LEFT,
	Sprites.LEFT,

	Sprites.UP,
	Sprites.UP,
	Sprites.UP, // Due North
	Sprites.UP,
	Sprites.UP,

	Sprites.RIGHT,
	Sprites.RIGHT
    ];

    Dudes.prototype.update = function(ticks /* ?? */) {
	this.clean(ticks);
	this.move(ticks);
	this.draw(ticks);
    };

    Dudes.prototype.clean = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    this.sprites.clean(nextDude.posX,
			       nextDude.posY);
	}
    };


    Dudes.prototype.move = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    var angle = Math.floor(ticks + dudeIx / 8) % 
		Dudes.ANGLE_TO_HEADING.length;

	    var heading = Dudes.ANGLE_TO_HEADING[angle];
	    var span = 5;
	    
	    nextDude.angle = angle;
	    nextDude.posX = 
		nextDude.posX + (span * heading.x);
	    nextDude.posY = 
		nextDude.posY + (span * heading.y);
	}
    };

    Dudes.prototype.draw = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    var orientation = 
		Dudes.ANGLE_TO_ORIENTATION[ nextDude.angle ];

	    this.sprites.draw(nextDude.posX, 
			      nextDude.posY, 
			      orientation, 
			      ticks);
	}
    };

    return Dudes;
})();
