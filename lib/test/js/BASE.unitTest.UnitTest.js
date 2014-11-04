
BASE.require(["BASE.unitTest.UnitTest", "BASE.unitTest.TeamCityUnitTest"], function () {
    var Future = BASE.async.Future;
    var UnitTest = BASE.unitTest.UnitTest;
    var TeamCityUnitTest = BASE.unitTest.TeamCityUnitTest;

    var unitTest = new TeamCityUnitTest("Unit testing the Unit test.");
    var test = new UnitTest("The unit test I'm testing.");


    test.prepare = function (scope) {
        var person = {
            firstName: "Jared",
            lastName: "Barnes",
            age: 32,
            getFutureFirstName: function () {
                return Future.fromResult(this.firstName);
            }
        };
        scope.person = person;
    };

    unitTest.test(function (expect, scope) {

        test.test(function (expect, scope) {
            expect(scope.person.firstName).toBeEqualTo("Jared");
            expect(scope.person.getFutureFirstName()).toBeEqualTo("Jared");
            expect(scope.person.firstName).toNotBeEqualTo("Jerry");
            expect(scope.person.lastName).toBeEqualTo("Bumble");
            expect(scope.person.age).toBeGreaterThan(0);
            expect(scope.person.age).toBeLessThan(40);
            expect([1, 2, 3]).toBeLike([1, 2, 3]);
            expect(scope.person).toBeLike({
                firstName: "Jared",
                lastName: "Barnes",
                age: 32
            });
        });

        expect.values(test.run()).toBeTestedWith({
            evaluate: function (value) {
                var firstCheck = value.successes[0].values[0] === value.successes[0].values[1];
                var secondCheck = value.successes[1].values[0] === value.successes[1].values[1];
                var thirdCheck = value.successes[2].values[0] !== value.successes[2].values[1];
                var fourthCheck = value.failures[0].values[0] !== value.failures[0].values[1];
                var fifthCheck = value.successes[3].values[0] > value.successes[3].values[1];
                var sixthCheck = value.successes[4].values[0] < value.successes[4].values[1];

                return firstCheck && secondCheck && thirdCheck && fourthCheck && fifthCheck && sixthCheck;

            },
            success: function () {
                return "Unit Test passed!";
            },
            failure: function (e) {
                return "Try again.";
            }
        });

    });

    unitTest.run();
});
