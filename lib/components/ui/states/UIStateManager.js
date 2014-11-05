BASE.require([
    "jQuery",
    "BASE.util.Observable",
    "BASE.web.Route",
    "BASE.web.queryString",
    "BASE.async.Sequence"
], function () {
    BASE.namespace("components.ui.states");
    var queryString = BASE.web.queryString;
    components.ui.states.UIStateManager = function (elem, tags) {
        var self = this;
        var $elem = $(elem);

        var $statesContainer = $(tags['states-container']);

        var initialized = false;
        var activeStates = [];
        var states = {};

        var autoInit;
        if (typeof $(elem).attr("autoinit") === "undefined") {
            autoInit = true;
        } else if ($(elem).attr("autoinit") === "true") {
            autoInit = true;
        } else {
            autoInit = false;
        }


        var logStateStackNames = function () {
            console.log(activeStates.map(function (s) {
                return $(s).attr("name");
            }));
        };

        var stateTransitionFutures = {};

        BASE.util.Observable.call(self);

        var push = function (state, options) {
            return new BASE.async.Future(function (setValue, setError) {
                var controller = $(state).controller();
                if (controller) {
                  var prepareToActivate = controller.prepareToActivate || function () { };
                  var prepare = prepareToActivate.call(controller, options);

                  if (!(prepare instanceof BASE.async.Future)) {
                      prepare = BASE.async.Future.fromResult(prepare);
                  }
                  prepare.then(function () {
                      // really don't know why this is  getting set to relative
                      $(state).css({ "position": "absolute", "z-index": activeStates.length });
                      $(state).removeClass("inactive");
                      activeStates.push(state);
                      var stateActive = controller.stateActive || function () { };
                      stateActive.call(controller);
                      setValue();
                  });
                } else {
                  $(state).addClass("currenty-active-state");
                  $(state).css({ "position": "absolute", "z-index": activeStates.length });
                  $(state).removeClass("inactive");
                  activeStates.push(state);
                  setValue();
                }

                //logStateStackNames();
            }).then();
        };

        var pop = function (howMany) {
            if (typeof howMany !== "number") {
                howMany = 1;
            }
            return new BASE.async.Future(function (setValue, setError) {
                var popSequence = new BASE.async.Sequence();
                for (var i = 0; i < howMany; i++) {
                    popSequence.add(new BASE.async.Future(function (setValue, setError) {
                        var controller = $(topState).controller();
                        var topState = activeStates.pop();
                        //logStateStackNames();
                        var prepare = new BASE.async.Future.fromResult(null);

                        if (controller) {
                            var prepare = controller.prepareToDeactivate();
                        }
                        if (!(prepare instanceof BASE.async.Future)) {
                            prepare = BASE.async.Future.fromResult(prepare);
                        }
                        prepare.then(function () {
                            $(topState).addClass("inactive");
                            $(topState).removeClass("currenty-active-state");
                            if (controller) {
                                controller.stateBlur();
                            }
                            setValue();
                        });
                    }));
                }
                popSequence.start();
                popSequence.whenAll(function () {
                    var newTopState = activeStates[activeStates.length - 1];
                    if (newTopState) {
                        $(newTopState).controller().stateFocus();
                    }
                    setValue();
                });
            }).then();
        };

        var replace = function (state, options) {
            return new BASE.async.Future(function (setValue, setError) {
                pop().then(function () {
                    push(state, options).then(setValue);
                });
            }).then();
        };

        var clear = function () {
            $statesContainer.children().each(function () {
                $(this).removeClass("currenty-active-state");
                $(this).addClass("inactive");
            });

            activeStates = [];
        };

        var setStates = function (newStates) {
            clear();
            newStates.forEach(function (state) {
                push(state.state, state.options);
            });
        };

        var updateState = function (options) {
            var controller = $(activeStates[activeStates.length - 1]).controller();
            if (controller) {
                controller.updateState(options);
            }
        };

        var initialize = function () {
            if (!initialized) {
                initialized = true;
                // Go through the inactive state container, pulling out
                // each state.
                // The default state should be the first one given, or the last one with the
                // [initial] attribute
                // If the element has a controller, try to call "init" on it.
                var initial;
                $statesContainer.children().each(function () {
                    var elem = this;
                    var name = $(elem).attr("name");
                    if (name) {
                        if (!initial) {
                            initial = elem;
                        }
                        states[name] = elem;
                        $(elem).addClass("inactive");
                        if ($(elem).is("[initial]")) {
                            initial = elem;
                        }
                    }
                });

                for (var stateName in states) {
                    var controller = $(states[stateName]).data("controller");
                    if (controller && (typeof controller.init === "function")) {
                        controller.init(self);
                    }
                };

                var initialName = $(initial).attr("name");
                push(states[initialName]);
                $statesContainer.removeClass("initializing");
            }
        };

        self.getActiveState = function () {
            return activeStates[activeStates.length - 1];
        };

        self.getStateStack = function () {
            return activeStates.map(function (state) {
                return $(state).attr("name");
            });
        };

        self.push = function (name, options) {
            return push(states[name], options);
        };

        self.pop = function (howMany) {
            return pop(howMany);
        };

        self.replace = function (name, options) {
            return replace(states[name], options);
        };

        self.clear = function () {
            return clear();
        };

        self.getState = function (stateName) {
            return states[stateName];
        };

        self.setStates = function (stateNames) {
            var newStates = stateNames.map(function (state) {
                return { state: states[state.name], options: state.options };
            });
            setStates(newStates);
        };

        self.updateState = function (options) {
            return updateState(options);
        };

        self.data = {};

        self.initialize = function () {
            initialize();
        };

        $elem.on("enteredView", function () {
            if (autoInit) {
                self.initialize();
            }
        });
    };
});
