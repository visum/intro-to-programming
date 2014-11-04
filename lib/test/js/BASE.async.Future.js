BASE.require([
    "BASE.unitTest.createInstance"
], function () {
    var createInstance = BASE.unitTest.createInstance;

    var unitTest = createInstance("BASE.async.Future: Set value of future to \"true\" after 1 ms.");
    unitTest.prepare = function (scope) {
        scope.future = new BASE.async.Future(function (setValue, setError) {
            setTimeout(function () {
                setValue(true);
            }, 1);
        }).then();
    };
    unitTest.test(function (expect, scope) {
        return new BASE.async.Future(function (setValue, setError) {
            var calledError = false;
            var calledCancel = false;
            var future = scope.future;


            future.ifError(function () {
                calledError = true;
            }).ifCanceled(function () {
                calledCancel = true;
            }).then(function () {
                expect(future.value).toBeEqualTo(true, "The Future's value needs to be true.");
                expect(future.error).toBeEqualTo(null, "Future's error property was still null.");
                expect(calledError).toBeEqualTo(false, "The Future's error callback wasn't called.");
                expect(future.isComplete).toBeEqualTo(true, "The Future's isComplete property was set to true.");
                expect(calledCancel).toBeEqualTo(false, "The Future's cancel method wasn't called.");
                setValue();
            });

        });
    });

    unitTest.run();
    
    var cancelUnitTest = createInstance("BASE.async.Future: Testing Cancel handling.");

    cancelUnitTest.prepare = function (scope) {
        scope.future = new BASE.async.Future(function (setValue, setError) {
            // Do nothing.
        }).then().cancel();
    };

    cancelUnitTest.test(function (expect, scope) {
        var future = scope.future;
        return new BASE.async.Future(function (setValue, setError) {
            var calledError = false;
            var calledThen = false;
            var calledCanceled = false;

            future.then(function () {
                calledThen = true;
            }).ifCanceled(function () {
                calledCanceled = true;
            }).ifError(function () {
                calledError = true;
            }).onComplete(function () {

                expect(future.value).toBeEqualTo(null, "The Future's value was correct.");
                expect(future.error).toBeEqualTo(null, "The Future's error property was correct.");
                expect(future.isComplete).toBeEqualTo(true, "The Future's isComplete property was correct.");
                expect(calledThen).toBeEqualTo(false, "The Future didn't call the then handlers.");
                expect(calledCanceled).toBeEqualTo(true, "The Future called the cancel handlers.");
                expect(calledError).toBeEqualTo(false, "The Future didn't call the error handlers.");

                setValue();
            });

        });
    });

    cancelUnitTest.run();

    var errorUnitTest = createInstance("BASE.async.Future: Testing Error handling.");
    var error = new Error("Test error.");
    errorUnitTest.prepare = function (scope) {
        scope.future = new BASE.async.Future(function (setValue, setError) {
            setTimeout(function () {
                setError(error);
            }, 1);
        }).then();
    };

    errorUnitTest.test(function (expect, scope) {
        var future = scope.future;
        return new BASE.async.Future(function (setValue, setError) {

            var asyncFinished = false;
            var calledCancel = false;
            var calledThen = false;

            future.then(function () {
                calledThen = true;
            }).ifCanceled(function () {
                calledCancel = true;
            }).ifError(function () {
                asyncFinished = true;
            }).onComplete(function () {

                expect(future.value).toBeEqualTo(null, "The Future's value wasn't set.");
                expect(future.error).toBeEqualTo(error, "The Error was set to the error property.");
                expect(future.isComplete).toBeEqualTo(true, "The future was considered complete.");
                expect(calledThen).toBeEqualTo(false, "The Future's then handlers were not called.");
                expect(calledCancel).toBeEqualTo(false, "The Future's cancel handlers were not called.");

                setValue();
            });


        });

    });

    errorUnitTest.run();
    
});
