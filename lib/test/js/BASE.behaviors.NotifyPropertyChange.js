BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.behaviors.NotifyPropertyChange"
], function () {
    var Person = function () {
        this.id = null;
        this.firstName = null;
        this.lastName = null;
        this.age = null;
        this.addresses = [];
        this.spouse = null;
        this.spouseId = null;
    };

    var prepare = function (scope) {
        jared = new Person();
        jared.id = 0;
        jared.firstName = "Jared";
        scope.jared = jared;
    };

    var createInstance = BASE.unitTest.createInstance;

    var checkGettersAndSettersTest = createInstance("BASE.behaviors.NotifyPropertyChange: Check if object has the getters and setters.");
    checkGettersAndSettersTest.prepare = prepare;

    checkGettersAndSettersTest.test(function (expect, scope) {
        var jared = scope.jared;
        BASE.behaviors.NotifyPropertyChange.apply(jared);
        expect(typeof jared.getSpouse === "function").toBeEqualTo(true);
        expect(typeof jared.setSpouse === "function").toBeEqualTo(true);
    });

    checkGettersAndSettersTest.run();


    var changePropertiesTest = createInstance("BASE.behaviors.NotifyPropertyChange: Change the properties, and be notified.");
    changePropertiesTest.prepare = prepare;

    changePropertiesTest.test(function (expect, scope) {
        var jared = scope.jared;
        BASE.behaviors.NotifyPropertyChange.apply(jared);
        var firstNameObserverCalledCount = 0;

        var observer = jared.observeProperty("firstName", function () {
            firstNameObserverCalledCount++;
        });

        jared.setFirstName("Jaredy");
        observer.stop();
        jared.setFirstName("Jared");
        observer.start();
        jared.setFirstName("Jaredy");
        observer.dispose();
        jared.setFirstName("Jared");

        expect(firstNameObserverCalledCount).toBeEqualTo(2);
        expect(jared.getFirstName()).toBeEqualTo(jared.firstName);
    });

    changePropertiesTest.run();

});