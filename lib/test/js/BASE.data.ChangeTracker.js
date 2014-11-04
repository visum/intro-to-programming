BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.data.ChangeTracker"
], function () {
    var createInstance = BASE.unitTest.createInstance;
    var Future = BASE.async.Future;

    var Person = function () {
        this.id = null;
        this.firstName = null;
        this.lastName = null;
        this.age = null;
        this.addresses = [];
        this.phoneNumbers = [];
        this.spouse = null;
        this.spouseId = null;
    };


    var unitTest = createInstance("BASE.data.ChangeTracker: ");

    unitTest.prepare = function (scope) {
        return new Future(function (setValue, setError) {
            dataStore = new BASE.data.InMemoryDataStore();

            entity = new Person();
            entity.firstName = "Jared";
            entity.lastName = "Barnes";
            entity.age = 31;

            changeTracker = new BASE.data.ChangeTracker(entity, dataStore);

            changeTracker.add();
            changeTracker.save().onComplete(setValue);

            scope.changeTracker = changeTracker;
            scope.entity = entity;
        });
    };

    
    unitTest.test(function (expect, scope) {
        
        expect(scope.entity.id).toBeDefined();
    }).run();

});




describe("BASE.data.ChangeTracker", function () {



    var dataStore;
    var entity;
    var changeTracker;
    beforeEach(function (done) {

    });

    it("Check if entity was added correctly", function () {



    });

    it("Update entity and check that events fired correctly.", function (done) {

        var updateFired = false;
        var loadedFired = false;

        changeTracker.observeType("updated", function () {
            updateFired = true;
        });

        changeTracker.observeType("loaded", function () {
            if (updateFired === true) {
                loadedFired = true;
            }
        });

        entity.setFirstName("Justin");
        changeTracker.save().then(function () {
            expect(updateFired).toBe(true);
            expect(loadedFired).toBe(true);
        }).onComplete(done);

    });

    it("Remove entity and check that events fired correctly.", function (done) {

        var removeFired = false;

        changeTracker.observeType("removed", function () {
            removeFired = true;
        });

        changeTracker.remove();

        changeTracker.save().then(function () {
            expect(removeFired).toBe(true);
        }).onComplete(done);

    });

    it("Sync entity and check that events fired correctly.", function (done) {

        var updatedFired = false;

        changeTracker.observeType("updated", function () {
            updatedFired = true;
        });

        changeTracker.sync({ firstName: "Justin" });

        expect(updatedFired).toBe(false);
        expect(entity.firstName).toBe("Justin");
        done();
    });


});