
BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.behaviors.collections.ObservableArray"
], function () {

    var createInstance = BASE.unitTest.createInstance;
    var ObservableArray = BASE.behaviors.collections.ObservableArray;
    var prepare = function (scope) {
        var array = [];
        ObservableArray.apply(array);
        scope.array = array;
    };

    var interfaceTest = createInstance("BASE.behaviors.collections.ObservableArray: Checking interface.");
    interfaceTest.prepare = prepare;

    interfaceTest.test(function (expect, scope) {
        var array = scope.array;
        expect(typeof array.observe === "function").toBeEqualTo(true);
    }).run();

    var pushTest = createInstance("BASE.behaviors.collections.ObservableArray: Testing push. ");
    pushTest.prepare = prepare;

    pushTest.test(function (expect, scope) {
        var array = scope.array;
        array.push(1);
        expect([].concat(array)).toBeLike([1]);
    }).run();

    var pushMultipleTest = createInstance("BASE.behaviors.collections.ObservableArray: Testing push with multiple items. ");
    pushMultipleTest.prepare = prepare;

    pushMultipleTest.test(function (expect, scope) {
        var array = scope.array;
        array.push(1, 2, 3);
        expect([].concat(array)).toBeLike([1, 2, 3]);
    }).run();


    var popTest = createInstance("BASE.behaviors.collections.ObservableArray: Testing pop.");
    popTest.prepare = prepare;

    popTest.test(function (expect, scope) {
        var array = scope.array;
        array.push(1, 2);
        array.pop();

        expect([].concat(array)).toBeLike([1]);
    }).run();


    var shiftTest = createInstance("BASE.behaviors.collections.ObservableArray: Testing shift.");
    shiftTest.prepare = prepare;

    shiftTest.test(function (expect, scope) {
        var array = scope.array;
        array.push(1, 2);
        array.shift();

        expect([].concat(array)).toBeLike([2]);
    }).run();


    var unshiftTest = createInstance("BASE.behaviors.collections.ObservableArray: Testing unshift.");
    unshiftTest.prepare = prepare;

    unshiftTest.test(function (expect, scope) {
        var array = scope.array;
        array.push(1);
        array.unshift(2);

        expect([].concat(array)).toBeLike([2, 1]);
    }).run();


    var unshiftMultipleTest = createInstance("BASE.behaviors.collections.ObservableArray: Testing unshift with mutliple.");
    unshiftMultipleTest.prepare = prepare;

    unshiftMultipleTest.test(function (expect, scope) {
        var array = scope.array;
        array.push(1);
        array.unshift(2, 3);

        expect([].concat(array)).toBeLike([2, 3, 1]);
    }).run();


    var observerTest = createInstance("BASE.behaviors.collections.ObservableArray: Observer test.");
    observerTest.prepare = prepare;

    observerTest.test(function (expect, scope) {
        var array = scope.array;
        var oldItems = [];
        var newItems = [];

        var firstObserver = array.observe(function (event) {
            newItems = event.newItems;
        });

        array.push(1);
        firstObserver.dispose();

        var secondObserver = array.observe(function (event) {
            oldItems = event.oldItems;
        });
        array.pop();
        secondObserver.dispose();

        // This is to make sure that the observers are properly disposed of.
        array.push(2);
        array.pop();

        expect(oldItems).toBeLike([1]);
        expect(newItems).toBeLike([1]);
    }).run();


    var observerTestMultiple = createInstance("BASE.behaviors.collections.ObservableArray: Add more than one at a time, and remove more than one at a time, checking observers.");
    observerTestMultiple.prepare = prepare;

    observerTestMultiple.test(function (expect, scope) {
        var array = scope.array;
        var oldItems = [];
        var newItems = [];

        var firstObserver = array.observe(function (event) {
            newItems = event.newItems;
        });

        array.push(1, 2);
        firstObserver.dispose();

        var secondObserver = array.observe(function (event) {
            oldItems = event.oldItems;
        });
        array.splice(0, 2);

        secondObserver.dispose();

        // This is to make sure that the observers are properly disposed of.
        array.push(1, 2);
        array.pop();

        expect(oldItems).toBeLike([1, 2]);
        expect(newItems).toBeLike([1, 2]);
    }).run();


});
