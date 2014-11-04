BASE.require([
    "jQuery",
    "BASE.web.queryString",
    "components.ui.states.UIStateManager",
    "BASE.async.Sequence"
], function () {
    BASE.namespace("components.ui.states");

    components.ui.states.HistoricalStateManager = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var autoInit;

        var redirects = {};

        if (typeof $(elem).attr("autoinit") === "undefined") {
            autoInit = true;
        } else if ($(elem).attr("autoinit") === "true") {
            autoInit = true;
        } else {
            autoInit = false;
        }

        // Extend the base StateManager
        components.ui.states.UIStateManager.apply(self, arguments);

        var currentStateStack;
        var queryString = BASE.web.queryString;

        var originalPush = self.push;
        var originalPop = self.pop;
        var originalReplace = self.replace;
        var originalSetStates = self.setStates;
        var routeObserver = null;

        var optionsToQueryString = function (options) {
            return BASE.web.queryString.toString(options);
        };

        var queryStringToOptions = function(string){
            return BASE.web.queryString.parse(string);
        };

        var parseStateName = function (stateName) {
            var parts = stateName.split("?");
            var name = parts[0];
            var options = {};
            if (parts[1]) {
                options = queryStringToOptions(parts[1]);
            }
            return { name: name, options: options }
        };

        var stateToString = function (state) {
            var str = state.name;
            if (typeof state.options === "object" && state.options !== null) {
                var queryString = BASE.web.queryString.toString(state.options);
                if (queryString !== "?") {
                    str += queryString;
                }
            }
            return str;
        };

        var routeHandler = function (hash) {

            var stateStack = hash.split("/").filter(function (str) {
                if (str === "") {
                    return false;
                }
                return true;
            }).map(function (str) {
                return parseStateName(str);
            });

            
            var newTopState = stateStack[stateStack.length - 1];

            // replace the redirects
            stateStack.forEach(function (state) {
                if (redirects[state.name]) {
                    state.name = redirects[state.name];
                }
            });
            var newStateStackHash = "/" + stateStack.map(function (state) {
                return stateToString(state);
            }).join("/");

            if (newStateStackHash !== hash) {
                document.location.hash = newStateStackHash;
                return;
            }
            
            
            
            
            if (currentStateStack) {

                // Decide how much of the existing stack matches the new one
                if (currentStateStack.length < stateStack.length) {
                    // we'll be doing some pushing
                    var matchingDepth = 0;
                    currentStateStack.every(function (state, index) {
                        if (state.name === stateStack[index].name) {
                            matchingDepth++;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (matchingDepth === currentStateStack.length) {
                        // just push in the remainder of the states
                        var pushSequence = new BASE.async.Sequence();
                        stateStack.slice(matchingDepth).forEach(function (state) {
                            pushSequence.add(originalPush(state.name, state.options));
                        });
                        pushSequence.start();
                    } else {
                        originalSetStates(stateStack);
                    }
                } else if (currentStateStack.length > stateStack.length) {
                    // we'll be popping here
                    var matchingDepth = 0;
                    stateStack.every(function (state, index) {
                        if (state.name === currentStateStack[index].name) {
                            matchingDepth++;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (matchingDepth === stateStack.length) {
                        // pop the difference
                        originalPop(currentStateStack.length - stateStack.length);
                    } else {
                        originalSetStates(stateStack);
                    }
                } else if (currentStateStack.length === stateStack.length) {
                    // Should we swap a sibling state?
                    var matchingDepth = 0;
                    stateStack.every(function (state, index) {
                        if (state.name === currentStateStack[index].name) {
                            matchingDepth++;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (matchingDepth === currentStateStack.length - 1) {
                        // only the last one is different, it's a swap
                        originalReplace(newTopState.name, newTopState.options);
                    } else if (matchingDepth === currentStateStack.length) {
                        // complete match, reload the existing state
                        self.updateState(newTopState.options);
                    } else {
                        originalSetStates(stateStack);
                    }

                }

            }

            currentStateStack = stateStack.slice(0);
        };

        self.loadInitial = function (state) {
            // Do nothing. Disable base UIStateManager's initial loading.
        };

        self.push = function (stateName, options) {
            // make sure the new state isn't already in the stack
            if (self.getStateStack().indexOf(stateName) > -1) {
                return false;
            }

            var newHash = location.hash + "/" + stateName;
            if (options) {
                newHash += optionsToQueryString(options);
            }
            location.hash = newHash;
        };

        self.pop = function (howMany) {
            if (typeof howMany !== "number") {
                howMany = 1;
            }

            if (self.getStateStack().length < howMany + 1) {
                return;
            }

            var parts = location.hash.substr(1).split("/");

            for (var i = 0; i < howMany; i++) {
                parts.pop();
            }

            var newHash = parts.join("/");
            location.hash = newHash;
        };

        self.replace = function (stateName, options) {
            // make sure the new state isn't already in the stack
            if (self.getStateStack().indexOf(stateName) > -1) {
                return false;
            }

            var parts = location.hash.substr(1).split("/");
            parts.pop();
            var newState = stateName;
            if (options) {
                newState += optionsToQueryString(options);
            }
            parts.push(newState);
            location.hash = parts.join("/");
        };

        self.setStates = function (newStack) {
            // todo: support query params here
            var hashParts = newStack.map(function (state) {
                return stateToString(state);
            });
            location.hash = "/" + hashParts.join("/");
        };

        self.startObserving = function () {
            if (!routeObserver) {
                routeObserver = new BASE.web.Route("/").observe().onEach(routeHandler);

                
                var originalHash = location.hash.substr(1); // strip the #
                if (originalHash == "") {
                    routeObserver.stop();
                    var initialName = $(self.getActiveState()).attr("name");
                    location.hash = "#/" + initialName;
                    currentStateStack = [parseStateName(initialName)];
                    routeObserver.start();
                } 

            } else {
                routeObserver.start();
            }
            
        };

        self.stopObserving = function () {
            routeObserver.stop();
        };

        self.redirect = function (oldState, newState) {
            redirects[oldState] = newState;
        }

        self.removeRedirect = function (state) { 
            redirects[state] = false;
        }

        $elem.on("enteredView", function () {
            if (autoInit) {
                self.startObserving();
            }
        });

    };
});