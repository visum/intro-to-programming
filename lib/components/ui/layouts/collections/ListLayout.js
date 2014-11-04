BASE.require([
    "jQuery"
], function () {
    BASE.namespace("components.ui.layouts.collections");

    var _globalObject = this;

    components.ui.layouts.collections.ListLayout = function (itemHeight) {
        var self = this;
        itemHeight = itemHeight || 100;

        if (this === _globalObject) {
            throw new Error("Constructor run with global context.  Use new.");
        }

        self.component = null;

        self.componentController = null;

        self.scrollViewport = { width: 0, height: 0 };

        self.getWidth = function (length) {
            return "100%";
        };

        self.getHeight = function (length) {
            return (length * itemHeight) + "px";
        };

        self.setItemHeight = function (value) {
            var oldValue = itemHeight;
            if (oldValue !== value) {
                itemHeight = value;
            }
        };

        // region has {top: 0, left: 0, right: 0, bottom:0}
        // scrollViewport has {width: 0, height: 0}
        self.getIndexes = function (region) {
            var startIndex = Math.floor(region.top / itemHeight);
            var endIndex = Math.ceil(region.bottom / itemHeight);

            var indexes = [];
            for (var x = startIndex ; x <= endIndex; x++) {
                indexes.push(x);
            }

            return indexes;
        };

        self.getCss = function (index) {
            //return {
            //    "width": "100%",
            //    "height": itemHeight + "px",
            //    "left": "0px",
            //    "top": (index * itemHeight) + "px"
            //};

            return {
                "width": "100%",
                "height": itemHeight + "px",
                "transform": "translate3d(0px, " + (index * itemHeight) + "px, 0px)"
            };
        };

        self.prepareElement = function (element, item, index) {
            element.innerHTML = index;
        };

        self.cleanElement = function (element) {
            element.innerHTML = "";
        };
    };
});