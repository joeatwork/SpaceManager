
RunSpec = function(description, managerFactory) {

    describe(description, function() {

	var manager;
	var someObject;

	beforeEach(function() {
	    manager = managerFactory();
	    someObject = { howAreYou: "PRETTY OK I GUESS" };
	});

	it("should be able to create and unwrap handles", function() {
	    var handle = manager.makeHandle(someObject, 0, 0, 0, 0);
	    var content = manager.contentFromHandle(handle);
	    expect(content).toBe(someObject);
	});


	it("should be able to accept and query a rectangle", function() {
	    var handle = manager.add(someObject, 1, 2, 1, 2);
	    var found = manager.find(1.5, 1.5, 1.5, 1.5);
	    expect(found[0]).toBe(someObject);
	});

	it("shouldn't find a rectangle that has been removed", function() {
	    var handle = manager.add(someObject, 1, 2, 1, 2);
	    manager.remove(handle);

	    var found = manager.find(1.5, 1.5, 1.5, 1.5);
	    expect(found.length).toEqual(0);
	});


	it("adds and removes should change the contents of the space", function() {
	    var all, firstFound;

	    var none = manager.dump();
	    expect(none.length).toEqual(0);

	    var handle1 = manager.add("A ONE", 1, 1, 1, 1);
	    var handle2 = manager.add("B TWO", 2, 2, 2, 2);

	    var compareHandles = function(aH,bH) {  
		var a = manager.contentFromHandle(aH);
		var b = manager.contentFromHandle(bH);
		if(a < b) return -1;
		else if(a > b) return 1;
		else return 0;
	    };

	    all = manager.dump();
	    all.sort(compareHandles);
	    expect(all.length).toEqual(2);
	    firstFound = manager.contentFromHandle(all[0]);
	    expect(firstFound).toEqual("A ONE");

	    manager.remove(handle1);
	    all = manager.dump(compareHandles);
	    expect(all.length).toEqual(1);
	    firstFound = manager.contentFromHandle(all[0])
	    expect(firstFound).toEqual("B TWO");	
	});

	it("should have the ability to add and remove identical rectangles", function() {
	    var handles = [
		manager.add("A", 1, 2, 3, 4),
		manager.add("B", 1, 2, 3, 4),
		manager.add("C", 1, 2, 3, 4)
	    ];
	    
	    var found = manager.find(1.5, 1.5, 3.5, 3.5);
	    expect(found.length).toEqual(3);

	    for(var i=0; i < handles.length; i++) {
		manager.remove(handles[i]);

		var found = manager.find(1.5, 1.5, 3.5, 3.5);
		expect(found.length).toEqual(2);
		
		manager.addHandle(handles[i]);
	    }
	});

	describe("A Manager with a couple of rectangles", function() {

	    var handles;

	    beforeEach(function() {
		handles = [
		    manager.add("A Left One", 1, 10, 1, 100),
		    manager.add("B Right One", 50, 100, 1, 100),
		    manager.add("C Bottom One", 1, 100, 50, 100),
		    manager.add("D Top One", 5, 90, 5, 10)
		];
	    });

	    it("should not find rects that don't intersect with query", function() {
		var found = manager.find(11, 20, 11, 20);
		expect(found.length).toEqual(0);
	    });

	    it("should find rects that do intersect with query", function() {
		var found = manager.find(2, 3, 2, 3);
		expect(found.length).toEqual(1);
		expect(found[0]).toEqual("A Left One");

		var found = manager.find(70, 110, 30, 49);
		expect(found.length).toEqual(1);
		expect(found[0]).toEqual("B Right One");

		var found = manager.find(20, 30, 8, 55);
		expect(found.length).toEqual(2);
		found.sort();
		expect(found[0]).toEqual("C Bottom One");
		expect(found[1]).toEqual("D Top One");
	    });

	    it("shouldn't be able to find deleted rects", function() {
		for(var i=0; i<handles.length; i++) {
		    manager.remove(handles[i]);
		}

		var found = manager.find(2, 3, 2, 3);
		expect(found.length).toEqual(0);

		var found = manager.find(70, 110, 30, 49);
		expect(found.length).toEqual(0);

		var found = manager.find(20, 30, 8, 55);
		expect(found.length).toEqual(0);
		
	    });

	});// a couple of rects

    });
};// runSpec

RunSpec("TreeSpace", function() { return SpaceManager.treeSpace(0, 100, 0, 100); });
RunSpec("HashSpace", function() { return SpaceManager.hashSpace(2.0) });
