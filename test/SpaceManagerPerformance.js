// Requires SpaceManager

spaceManagerPerformance = function() {

    var CELL_WIDTH = 0.01;

    var randomCell = function() {
	var ret = {
	    left : Math.random(),
	    top : Math.random()
	};

	ret.right = ret.left + CELL_WIDTH;
	ret.bottom = ret.top + CELL_WIDTH;

	return ret;
    };

    var timing = function(name, f) {
	var tBefore = (new Date()).getTime();
	f();
	var tAfter = (new Date()).getTime();
	var tSpent = tAfter - tBefore;

	console.log("Timed " + name + " at " + tSpent + " ticks");
    };

    // var TEST_SIZE = 50000;
    var TEST_SIZE = 100000;

    // Approximately our target use case
    var intNoise = [];
    var randomCells = [];
    for(var nextNoise=0 ; nextNoise < TEST_SIZE; nextNoise++) {
	intNoise.push(Math.floor(Math.random() * TEST_SIZE));
	randomCells.push(randomCell());
    }

    for(var trialSize=1000;
	trialSize <= TEST_SIZE;
	trialSize = trialSize * 10) {
	
	console.log("TRIAL " + trialSize);

	var manager = SpaceManager.treeSpace(0, 1, 0, 1);
    
	var handles = [];
	for(var handleIx=0; handleIx<TEST_SIZE;handleIx++) {
	    var cell = randomCells[handleIx];
	    var handle = 
		manager.makeHandle(handleIx, cell.left, cell.right, cell.top, cell.bottom);
	    handles.push(handle);
	}

	timing("Adding " + handles.length/2.0 + " cells", function() {
	    for(var handleIx=0; handleIx<handles.length; handleIx++) {		
		if(handleIx % 2) manager.addHandle(handles[handleIx]);
	    }
	});

	var queryOperations = 0;
	var queryHits = 0;

	timing("SHUFFLING " + trialSize, function() {
	    for(var shuffleIx=0; shuffleIx < trialSize; shuffleIx++) {
		var nextHandle = handles[ intNoise[ shuffleIx ] ];
		
		if(manager.containsHandle(nextHandle)) {
		    manager.remove(nextHandle);
		}
		else {
		    manager.addHandle(nextHandle);
		}
		
		var found = manager.find(nextHandle.left - CELL_WIDTH,
					 nextHandle.right + CELL_WIDTH,
					 nextHandle.top - CELL_WIDTH,
					 nextHandle.bottom + CELL_WIDTH);
		
		queryOperations += found.findOperations;
		queryHits += found.length;
	    }
	});
	
	console.log("With ops: " + queryOperations + ", hits: " + queryHits + 
		    " (" + queryOperations/trialSize + " ops/trial)" +
		    " (" + queryOperations/queryHits + " ops/hit)");
	
	if(trialSize < 10000) {
	    console.log("CHECKING SPACE");
	    console.log(manager.checkSpace());
	}
	
	console.log("COMPLETED.");
    }// for trialSize < TEST_SIZE

    console.log("ALL TRIALS COMPLETED");

};

