BASE.require([
    "jQuery",
    "components.ui.states.UIStateBehavior"
], function () {
    BASE.namespace("stateTest");
    stateTest.StateOne = function (elem, tags) {
        var self = this;
        components.ui.states.UIStateBehavior.call(self);
    };
});