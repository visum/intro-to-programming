BASE.require([
    "jQuery.fn.region"
], function () {
    BASE.namespace("components.ui.layouts");

    components.ui.layouts.UINavigation = function (elem, tags) {
        var self = this;

        var $elem = $(elem);
        var $wrapper = $(tags["wrapper"]);
        var $outer = $(tags["outer"]);
        var $header = $outer.children().first();

        var redraw = function () {
            var region = $header.region();
            $wrapper.css("top", region.height + "px");
        };

        $elem.on("enteredView", redraw);

        self.redraw = function () {
            redraw();
        };
    };

});