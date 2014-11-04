BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.data.dataStores.InMemoryDataStore"
], function () {

    var Person = function () {
        this.id = null;
        this.firstName = null;
        this.lastName = null;
        this.age = 0;
        this.addresses = [];
        this.phoneNumbers = [];
        this.department = null;
    };

    var createInstance = BASE.unitTest.createInstance;
    var Future = BASE.async.Future;
    var Task = BASE.async.Task;

    var addPrepare = function (scope) {
        var person = new Person();
        person.firstName = "Jared";
        person.lastName = "Barnes";
        person.age = 32;

        scope.person = person;
        dataStorePrepare(scope);
        var dataStore = scope.dataStore = new BASE.data.dataStores.InMemoryDataStore();

        return dataStore.add(person).then(function (response) {
            person.id = response.dto.id;
        });

    };


    var dataStorePrepare = function (scope) {
        scope.dataStore = new BASE.data.dataStores.InMemoryDataStore();
    };

    var addTest = createInstance("BASE.data.InMemoryDataStore: Adding an entity.");
    addTest.prepare = addPrepare;

    addTest.test(function (expect, scope) {

        return scope.dataStore.asQueryable().where(function (e) {
            return e.property("firstName").isEqualTo("Jared");
        }).toArray().then(function (result) {
            expect(result.length).toBeEqualTo(1, "There needs to be some result.");
            expect(result[0].firstName).toBeEqualTo("Jared", "The results should have the firstName property equal to Jared.");
            expect(result[0].id).toBeDefined("Expected an id to be present.");
        });

    }).run();


    var addTheSameEntityTest = createInstance("BASE.data.InMemoryDataStore: Adding an entity that already exist.");
    addTheSameEntityTest.prepare = addPrepare;

    addTheSameEntityTest.test(function (expect, scope) {
        return new Future(function (setValue, setError) {
            var calledThen = false;
            var calledError = false;

            scope.dataStore.add({
                id: scope.person.id,
                firstName: "Justin"
            }).then(function () {
                calledThen = true;
            }).ifError(function () {
                calledError = true;
            }).onComplete(function () {
                expect(calledThen).toBeEqualTo(false, "We Expected an Error, so this should be false.");
                expect(calledError).toBeEqualTo(true, "We Expected an Error, so this should be true.");
                setValue();
            });

        });
    }).run();

    var removeTest = createInstance("BASE.data.InMemoryDataStore: Removing an entity.");
    removeTest.prepare = addPrepare;

    removeTest.test(function (expect, scope) {

        return new Future(function (setValue, setError) {
            scope.dataStore.asQueryable().where(function (e) {
                return e.property("firstName").isEqualTo("Jared");
            }).toArray().then(function (result) {
                var entity = result[0];
                scope.dataStore.remove(entity).then(function () {

                    scope.dataStore.asQueryable().toArray().then(function (result) {
                        expect(result.length).toBeEqualTo(0, "There shouldn't be any results.");
                        setValue();
                    });
                });
            });
        });
    }).run();


    var updateTest = createInstance("BASE.data.InMemoryDataStore: Updating an entity.");
    updateTest.prepare = addPrepare;

    updateTest.test(function (expect, scope) {

        return new Future(function (setValue, setError) {
            scope.dataStore.asQueryable().where(function (e) {

                return e.property("firstName").isEqualTo("Jared");

            }).toArray().then(function (result) {
                var entity = result[0];
                var id = entity.id;

                scope.dataStore.update(id, {
                    firstName: "Jaredy"
                }).then(function () {
                    var task = new Task();

                    task.add(scope.dataStore.asQueryable().where(function (e) {
                        return e.property("firstName").isEqualTo("Jaredy");
                    }).toArray());

                    task.add(scope.dataStore.asQueryable().where(function (e) {
                        return e.property("firstName").isEqualTo("Jared");
                    }).toArray());

                    task.start().whenAll(function (futures) {
                        var firstResult = futures[0].value;
                        var secondResult = futures[1].value;

                        expect(secondResult.length).toBeEqualTo(0, "There shouldn't be any Jared now in the dataStore.");
                        expect(firstResult.length).toBeEqualTo(1, "There should be a Jaredy now in the dataStore.");
                        expect(firstResult[0].firstName).toBeEqualTo("Jaredy", "The results should have the firstName property equal to Jaredy.");
                        expect(firstResult[0].id).toBeEqualTo(id);

                        setValue();
                    });
                });
            });
        });

    }).run();

    var updateANonExistingEntityTest = createInstance("BASE.data.InMemoryDataStore: Update an entity that doesn't exist.");
    updateANonExistingEntityTest.prepare = addPrepare;

    updateANonExistingEntityTest.test(function (expect, scope) {
        return new Future(function (setValue, setError) {
            var thenCalled = false;
            var errorCalled = false;
            scope.dataStore.update("FakeId", {
                firstName: "Jared"
            }).then(function () {
                thenCalled = true;
            }).ifError(function () {
                errorCalled = true;
            }).onComplete(function () {
                expect(thenCalled).toBeEqualTo(false, "We shouldn't get a response back, because we expect it to error.");
                expect(errorCalled).toBeEqualTo(true, "We expect to be notified that the update failed.");
                setValue();
            });
        });
    }).run();

    var removeANonExistingEntityTest = createInstance("BASE.data.InMemoryDataStore: Remove an entity that doesn't exist.");
    removeANonExistingEntityTest.prepare = addPrepare;

    removeANonExistingEntityTest.test(function (expect, scope) {
        return new Future(function (setValue, setError) {

            var thenCalled = false;
            var errorCalled = false;
            scope.dataStore.remove({
                id: "FakeId",
                firstName: "Jared"
            }).then(function () {
                thenCalled = true;
            }).ifError(function () {
                errorCalled = true;
            }).onComplete(function () {
                expect(thenCalled).toBeEqualTo(false, "We shouldn't get a response back, because we expect it to error.");
                expect(errorCalled).toBeEqualTo(true, "We expect to be notified that the removal failed.");
                setValue();
            });

        });
    }).run();

});
