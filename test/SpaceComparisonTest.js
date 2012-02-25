
spaceComparisonTest = function() {
    
    var hashManagerFactory = function() { return SpaceManager.hashSpace(0.2); };
    var treeManagerFactory = function() { return SpaceManager.treeSpace(0, 1, 0, 1); }; 

    var CELL_WIDTH = 0.01;

    // DELETE ME- once you've found edge cases, just enumerate them here.
    var randomCell = function() {
	var ret = {
	    left : Math.random(),
	    top : Math.random()
	};

	ret.right = ret.left + CELL_WIDTH;
	ret.bottom = ret.top + CELL_WIDTH;

	return ret;
    };

    // Require numeric or string or otherwise trivially hashable contents
    var identicalContents = function(l1, l2) {
	var l1Clone = l1.concat();
	var l2Clone = l2.concat();

	while(l1Clone.length) {
	    var nextTry = l1Clone.shift();
	    var l2Found = l2Clone.indexOf(nextTry); // NOT PORTABLE!
	    if(-1 == l2Found) {
		return false;
	    }
	    else {
		l2Clone.splice(l2Found, 1);
	    }
	}

	return (! l2Clone.length );
    };

    var treeHandles = [];
    var hashHandles = [];


    var treeManager = treeManagerFactory();
    var hashManager = hashManagerFactory();

    for(var trial=0; trial < 10000; trial++) {

	var newRect = randomCell();
	var treeHandle = 
	    treeManager.makeHandle(trial, newRect.left, newRect.right, newRect.top, newRect.bottom);
	var hashHandle =
	    hashManager.makeHandle(trial, newRect.left, newRect.right, newRect.top, newRect.bottom);

	treeManager.addHandle(treeHandle);
	hashManager.addHandle(hashHandle);

	treeHandles.push(treeHandle);
	hashHandles.push(hashHandle);

	if(! (trial % 10)) {
	    var deleteTreeHandle = treeHandles.shift();
	    treeManager.remove(deleteTreeHandle);

	    var deleteHashHandle = hashHandles.shift();
	    hashManager.remove(deleteHashHandle);
	}

	if(! (trial % 1000)) {
	    console.log("Managing " + hashManager.dump().length + " nodes.");
	}

	var queryLeft  = Math.random() - CELL_WIDTH;
	var queryRight = queryLeft + (2 * CELL_WIDTH);
	var queryTop   = Math.random() - CELL_WIDTH;
	var queryBottom = queryTop + (2 * CELL_WIDTH);
	
	var treeFound = treeManager.find(queryLeft, queryRight, queryTop, queryBottom);
	var hashFound = hashManager.find(queryLeft, queryRight, queryTop, queryBottom);

	if(! identicalContents(treeFound, hashFound) ) {
	    throw "DIFFERENT RESULTS FOR SEARCH";
	}
    }

}
