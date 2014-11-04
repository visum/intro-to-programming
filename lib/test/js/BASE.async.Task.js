BASE.require([
  "BASE.unitTest.createInstance",
  "BASE.async.Task",
  "BASE.async.delay"
], function () {

    var createInstance = BASE.unitTest.createInstance;
   
    var Task = BASE.async.Task;
    var Future = BASE.async.Future;
    var delay = BASE.async.delay;

    var prepare = function (scope) {
        var task = scope.task = new Task();
        var future1 = new Future(function (setValue, setError) {
            delay(5).then(function () {
                setValue(5);
            });
        });

        var future2 = new Future(function (setValue, setError) {
            delay(5).then(function () {
                setValue(4);
            });
        });

        var future3 = new Future(function (setValue, setError) {
            delay(5).then(function () {
                setValue(3);
            });
        });

        task.add(future1);
        task.add(future2);
        task.add(future3);

        scope.future1 = future1;
        scope.future2 = future2;
        scope.future3 = future3;
    };

    var unitTest = createInstance("BASE.async.Task: Setting three int values then checking their sum.");
    unitTest.prepare = prepare;
    
    unitTest.test(function (expect, scope) {
        return new Future(function (setValue, setError) {
            var task = scope.task;
            var whenAnyCount = 0;

            task.start().whenAny(function () {
                whenAnyCount++;
            }).whenAll(function (futures) {

                var sum = futures.map(function (future) {
                    return future.value;
                }).reduce(function (value, currentValue) {
                    return value += currentValue;
                }, 0);

                expect(sum).toBeEqualTo(12, "Sum should be 12.");
                expect(whenAnyCount).toBeEqualTo(3, "There should be 3 \"any\" calls.");

                setValue();
            });
        });
    });

    unitTest.run();

    var cancelTest = createInstance("BASE.async.Task: Canceling one of the futures.");
    cancelTest.prepare = function (scope) {
        prepare(scope);
        scope.canceledFuture = new Future(function (setValue, setError) {
            // Don't set the Value ever!
            setTimeout(function () {
                scope.canceledFuture.cancel();
            }, 1);
        });

        scope.task.add(scope.canceledFuture);
    };

    cancelTest.test(function (expect, scope) {
        return new Future(function (setValue, setError) {
            var task = scope.task;
            var sum = 0;
            var whenAnyCount = 0;
            var calledWhenAll = false;

            task.start().whenAny(function (future) {
                whenAnyCount++;
                sum += future.value;
            }).whenAll(function () {
                calledWhenAll = true;
            }).onComplete(function (futures) {

                expect(whenAnyCount).toBeLessThan(4, "There should be less than 4 \"any\" calls.");
                expect(calledWhenAll).toBeEqualTo(false, "When all shouldn't be called.");

                setValue();
            });
        });
    });

    cancelTest.run();

});
