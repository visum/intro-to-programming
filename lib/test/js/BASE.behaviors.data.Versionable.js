BASE.require([
    "BASE.behaviors.data.Versionable",
    "BASE.unitTest.createInstance"
], function () {
    var makeTest = BASE.unitTest.createInstance;
    var Versionable = BASE.behaviors.data.Versionable;

    var makeTestObject = function () {
        var person = {
            firstName: "Benjamin",
            lastName: "Howe",
            birthDate: 24,
            birthMonth: 7,
        };

        var neighbor = {
            firstName: "Brent"
        };

        person.neighbor = neighbor;

        Versionable.call(person);

        return person;
    };

    var prepare = function (scope) {
        scope.obj = makeTestObject();
    };

    var testInterface = makeTest("BASE.behaviors.data.Versionable: Checking interface");
    testInterface.prepare = prepare;
    testInterface.test(function (expect, scope) {
        expect(typeof scope.obj.snapshot === "function").toBeEqualTo(true);
        expect(typeof scope.obj.revert === "function").toBeEqualTo(true);
        expect(typeof scope.obj.getSnapshot === "function").toBeEqualTo(true);
    }).run();

    var testAnonymousRevisions = makeTest("BASE.behaviors.data.Versionable: Testing anonymous revisions.");
    testAnonymousRevisions.prepare = prepare;
    testAnonymousRevisions.test(function (expect, scope) {
        var person = scope.obj;

        var mikesNeighbor = { firstName: "Buzz" };
        var franklinsNeighbor = {firstName: "Congress" };

        person.snapshot();
        person.firstName = "Mike";
        person.lastName = "K";
        person.neighbor = mikesNeighbor;
        person.birthDate = 12;
        person.birthMonth = 1;

        person.snapshot();

        person.firstName = "Franklin";
        person.lastName = "Roosevelt";
        person.birthDate = 11;
        person.birthMonth = 2;
        person.neighbor = franklinsNeighbor;

        person.revert();

        expect(person.lastName).toBeEqualTo("K");
        expect(person.neighbor).toBeEqualTo(mikesNeighbor);

        person.revert();
        expect(person.firstName).toBeEqualTo("Benjamin");

    }).run();

    var testNamedRevisions = makeTest("BASE.behaviors.data.Versionable: Testing named revisions.");
    testNamedRevisions.prepare = prepare;
    testNamedRevisions.test(function (expect, scope) {
        var person = scope.obj;
        person.snapshot("original");

        var mikesNeighbor = { firstName: "Buzz" };
        var franklinsNeighbor = { firstName: "Congress" };

        person.firstName = "Mike";
        person.lastName = "K";
        person.neighbor = mikesNeighbor;
        person.birthDate = 12;
        person.birthMonth = 1;

        person.snapshot("mike");

        person.firstName = "Franklin";
        person.lastName = "Roosevelt";
        person.birthDate = 11;
        person.birthMonth = 2;
        person.neighbor = franklinsNeighbor;

        person.snapshot("franklin");

        person.revert("original");

        expect(person.firstName).toBeEqualTo("Benjamin");
        
        person.revert("franklin");

        expect(person.firstName).toBeEqualTo("Franklin");
        expect(person.neighbor).toBeEqualTo("franklinsNeighbor");

    }).run();


});