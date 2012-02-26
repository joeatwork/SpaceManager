    // dude - this is the dude you can move or change
    // neighbors - an array of other dudes "near" your dude
    // ticks - the time, in abstract "ticks"

    // dude - this is the dude you can move or change
    // neighbors - an array of other dudes "near" your dude
    // ticks - the time, in abstract "ticks"

// ATTRACTOR- everybody just piles on
    var othersX = 0;
    var othersY = 0;
    for(var nIx=0; nIx<neighbors.length; nIx++) {
      othersX += neighbors[nIx].posX;
      othersY += neighbors[nIx].posY;
    }

    var centerX = othersX / neighbors.length;
    var centerY = othersY / neighbors.length;
    var towardsOthers = Math.atan2(centerY - dude.posY, centerX - dude.posX);

    dude.heading = towardsOthers;
      
// REPELLOR - everybody hates everybody else
    var othersX = 0;
    var othersY = 0;
    for(var nIx=0; nIx<neighbors.length; nIx++) {
      othersX += neighbors[nIx].posX;
      othersY += neighbors[nIx].posY;
    }

    var centerX = othersX / neighbors.length;
    var centerY = othersY / neighbors.length;
    var awayFromOthers = Math.atan2(dude.posY - centerY, dude.posX - centerX);

    dude.heading = awayFromOthers;

// ATTRACTOR with big turn radius
    var othersX = 0;
    var othersY = 0;
    for(var nIx=0; nIx<neighbors.length; nIx++) {
      othersX += neighbors[nIx].posX;
      othersY += neighbors[nIx].posY;
    }

    var centerX = othersX / neighbors.length;
    var centerY = othersY / neighbors.length;
    var towardsOthers = Math.atan2(centerY - dude.posY, centerX - dude.posX);
    var swerve = (towardsOthers + (dude.heading * 49))/50.0;

    dude.heading = swerve;
      
// Billiard ball

   var targetX = Math.sin(dude.heading);
   var targetY = Math.cos(dude.heading);

   var targetX = Math.cos(dude.heading);
   var targetY = Math.sin(dude.heading);

   if(dude.posX + dude.width + (targetX * dude.width) > bounds.right)
       targetX = -1;
   else if(dude.posX + (targetX * dude.width) < bounds.left)
       targetX = 1;

   if(dude.posY + dude.width + (targetY * dude.width) > bounds.bottom)
       targetY = -1;
   else if(dude.posY + (targetX * dude.width) < bounds.top)
       targetY = 1;
   
   for(var nIx=0; nIx < neighbors.length; nIx++) {
       var friend = neighbors[nIx];

       if(((friend.posX + friend.width) < dude.posX  ) ||
	  ((dude.posX   + dude.width  ) < friend.posX) ||
	  ((friend.posY + friend.width) < dude.posY  ) ||
	  ((dude.posY   + dude.width  ) < friend.posY)){
	   ; // NOTHING, we haven't collided.
       }
       else {
	   targetX += dude.posX - friend.posX;
	   targetY += dude.posY - friend.posY;
       }
   }

   dude.heading = Math.atan2(targetY, targetX);

// Simple Flocking behavior
    var personalSpace = dude.width * 5;
    var consensusForce = dude.width * 20;

    var othersX = 0;
    var othersY = 0;
    var othersHeading = 0;
    for(var nIx=0; nIx<neighbors.length; nIx++) {
	othersX += neighbors[nIx].posX;
	othersY += neighbors[nIx].posY;
	othersHeading += neighbors[nIx].heading;
    }

    var centerX = othersX / neighbors.length;
    var centerY = othersY / neighbors.length;

    var consensusHeading = othersHeading / neighbors.length;
    var consensusX = Math.cos(consensusHeading);
    var consensusY = Math.sin(consensusHeading);

    var flockX = centerX - dude.posX;
    var flockY = centerY - dude.posY;

    var flockDistance =
        Math.sqrt((flockX * flockX) + (flockY * flockY));

    var flockForce = flockDistance - personalSpace;
    var useX = 
        (consensusX * consensusForce) + (flockX * flockForce);
    var useY = 
        (consensusY * consensusForce) + (flockY * flockForce);


    if(dude.posX + dude.width + personalSpace > bounds.right)
	useX -= personalSpace;
    else if(dude.posX + personalSpace < bounds.left)
	useX += personalSpace;

    if(dude.posY + dude.width + personalSpace > bounds.bottom)
	useY -= personalSpace;
    else if(dude.posY + personalSpace < bounds.top)
	useY += personalSpace;

    dude.feedback = {
	useX : useX, useY : useY, flockForce : flockForce,
	consensusHeading : consensusHeading,
	consensusX : consensusX, consensusY : consensusY
    };

    dude.heading = Math.atan2(useY, useX);
    
