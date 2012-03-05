// REQUIRES SpaceManager.js
Dudes = (function(){
    ////////////////////////////////////////////////////
    // View

    var Sprites = function(gfx) {
        // A manages rendering from the image
        // to the graphics context. 
	this.gfx = gfx;
    };

    Sprites.prototype.clearRect = function(x, y, width, height) {
        this.gfx.clearRect(x, y, width, height);
    };

    /**
     * posX, posY : x and y offsets
     */
    Sprites.prototype.draw = function(posX, posY, width) {
	this.gfx.strokeStyle = "#000";
	this.gfx.lineWidth = 1;
	this.gfx.strokeRect(posX, posY, width, width);
    };

    //////////////////////////////////////////////////////////
    // MODEL - DRIVES THE VIEW

    var INITIAL_DUDE_WIDTH = 10;

    var Dudes = function(gfx, 
			 xLowBound, xHighBound,
			 yLowBound, yHighBound,
			 count, strategy) {
        // A COLLECTION of 'model' Dudes, who scurry around.
	this.time = null;
	this.sprites = new Sprites(gfx);
        this.dudes = [];
	this.bounds = {
	    left: xLowBound,
	    right: xHighBound,
	    top: yLowBound,
	    bottom: yHighBound
	};
	this.neighborhoodSize = INITIAL_DUDE_WIDTH; 

	this.strategy = strategy;
	this.space = SpaceManager.treeSpace(this.bounds.left,
					    this.bounds.right,
					    this.bounds.top,
					    this.bounds.bottom);

	var fieldWidth = xHighBound - xLowBound;
	var fieldHeight = yHighBound - yLowBound;

        for( var i = 0; i < count ; i++) {
	    var posX =
		xLowBound + (Math.random() * fieldWidth);
	    var posY =
		yLowBound + (Math.random() * fieldHeight);

	    var newDude = {
                posX : posX,
                posY : posY,
		heading : Math.random() * Math.PI * 2,
		width : INITIAL_DUDE_WIDTH
            };
            this.dudes.push(newDude);
	    newDude.spaceHandle = 
		this.space.add(newDude, 
			       newDude.posX, newDude.posX + newDude.width,
			       newDude.posY, newDude.posY + newDude.width);
	}
    };

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

    Dudes.prototype.positionFromHeading = function(dude, distance) {
	var heading = dude.heading;

	var dx = Math.cos(heading) * distance;
	var dy = Math.sin(heading) * distance;
	    
	var posX = dude.posX + dx;
	var posY = dude.posY + dy;	    

	dude.posX = this.wrap(posX, this.bounds.left, this.bounds.right);
	dude.posY = this.wrap(posY, this.bounds.top, this.bounds.bottom);
	dude.heading = this.wrap(heading, 0, 2.0 * Math.PI);
    };

    Dudes.prototype.neighbors = function(dude) {
	var expand = this.neighborhoodSize;

	var dudeLeft = dude.posX;
	var dudeTop = dude.posY;
	var dudeRight = dudeLeft + dude.width;
	var dudeBottom = dudeTop + dude.width;
	
	// TODO: wrap around bounds when checking for neighbors.
	//  that is
	//  if(dudeLeft < bounds.left) also find in
        //     bounds.right - (bounds.left - dudeLeft) 
	var neighbors = this.space.find(
	    dudeLeft - expand,
	    dudeRight + expand,
	    dudeTop - expand,
	    dudeBottom + expand
	);

	if(neighbors.length < 2) {
	    this.neighborhoodSize = expand + 1;
	}
	else if((neighbors.length > 20) && (expand > 1)) {
	    // we need an underflow guard or neighborhood
	    // size grounds out at 0
	    this.neighborhoodSize = expand - 1;
	}

	return neighbors;
    };

    Dudes.prototype.update = function(absTime) {
	if(this.time) {
	    var ticks = absTime - this.time;	
	    this.move(ticks);

	    this.clean();
	    this.draw(ticks);
	}
	this.time = absTime;
    };

    Dudes.prototype.clean = function() {
	this.sprites.clearRect(
	    this.bounds.left, this.bounds.top,
	    this.bounds.right - this.bounds.left,
	    this.bounds.bottom - this.bounds.top);
    };

    Dudes.prototype.move = function(ticks) {
	var speed = 5;
	var distance = speed * ticks;

	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];

	    var neighbors = this.neighbors(nextDude);
	    this.strategy.call(window, nextDude, neighbors, this.bounds, ticks);
	    
	    if(isNaN(Number(nextDude.heading))){
		throw "Something is wrong, dude came back with a heading of " + nextDude.heading;
	    }	    

	    this.positionFromHeading(nextDude, distance);

	    this.space.remove(nextDude.spaceHandle);
	    nextDude.spaceHandle = 
		this.space.add(nextDude, 
			       nextDude.posX, 
			       nextDude.posX + nextDude.width,
			       nextDude.posY, 
			       nextDude.posY + nextDude.width);
	}
    };

    Dudes.prototype.draw = function(ticks) {
	for(var dudeIx=0; dudeIx < this.dudes.length; dudeIx++) {
	    var nextDude = this.dudes[dudeIx];
	    this.sprites.draw(nextDude.posX, 
			      nextDude.posY,
			      nextDude.width);
	}
    };

    return Dudes;
})();
