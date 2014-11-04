BASE.require([
    "jQuery",
    "components.ui.layouts.collections.ListLayout",
    "Array.prototype.asQueryable"
], function () {
    BASE.namespace("components.ui.layouts");

    var ListLayout = components.ui.layouts.collections.ListLayout;

    components.ui.layouts.UICollection = function (elem, tags) {
        var self = this;
        var $elem = $(elem);

        var $scroll = $(tags['scroll']);
        var scroll = $scroll.data("controller");
        var currentLength = 0;
        var currentIndexes = [];

        var availableItems = [];
        var itemsByIndex = {};

        var onResizeWindow = function () {
            self.resize();
            self.redraw();
        };

        var layout = new ListLayout();
        var queryable = [].asQueryable();
        var resizeFuture = new BASE.async.Future();

        var visibleItemIndexes = function (layoutIndexes) {
            // This is just a helper method to filter indexes out of range.

            var result = layoutIndexes.filter(function (index) {
                return index < currentLength && index >= 0;
            });

            return result;
        };

        var getCss = function (index) {
            var css = layout.getCss(index);
            //css.transition = "all 1000ms cubic-bezier(0.190, 1.000, 0.220, 1.000)";
            return css;
        };


        $elem.on("enteredView", function () {
            window.addEventListener("resize", onResizeWindow);
        });

        var reusableRegion = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        };

        self.redraw = function () {

            var top = scroll.top;
            var left = scroll.left;
            var width = scroll.width;
            var height = scroll.height;
            resizeFuture = new BASE.async.Future();

            // We reuse the object so we dont have unwanted garbage collection.
            reusableRegion = {
                top: top,
                right: left + width,
                bottom: top + height,
                left: left
            };

            // Update the scrollView port.
            layout.scrollViewport = { width: width, height: height };

            var layoutIndexes = layout.getIndexes(reusableRegion);

            var newCurrentIndexes = visibleItemIndexes(layoutIndexes);
            // remove everything that is either not in the new set (newCurrentIndexes) or not in view (layoutIndexes)
            var indexesToRemove = currentIndexes.except(newCurrentIndexes);
            currentIndexes.except(layoutIndexes).forEach(function (i) {
                if (indexesToRemove.indexOf(i) === -1) {
                    indexesToRemove.push(i);
                }
            });
            var indexesToAdd = newCurrentIndexes.except(currentIndexes);
            var indexesToRefresh = currentIndexes.except(indexesToRemove);

            //console.log("---");
            //console.log("Layout Indexes: " + layoutIndexes);
            //console.log("Current Indexes: " + currentIndexes);
            //console.log("Indexes to remove: " + indexesToRemove);
            //console.log("Indexes to add: " + indexesToAdd);
            //console.log("Indexes to refresh: " + indexesToRefresh);

            indexesToRemove.forEach(function (index) {
                removeItemAtIndex(index);
            });

            indexesToAdd.forEach(function (index) {
                self.loadItemToIndex(index);
            });

            // This is too costly, we need to find a better way to handle this.

            //indexesToRefresh.forEach(function (index) {
            //    self.refreshItemAtIndex(index);
            //});

            currentIndexes = newCurrentIndexes;
            $elem.triggerHandler("redrawn");
        };

        self.createItem = function () {
            var itemFuture;

            if (availableItems.length > 0) {
                itemFuture = availableItems.pop();
                itemFuture.then(function (item) { item.style.display = "block"; });
            }

            if (!itemFuture) {

                var itemController = "";
                if (layout.componentController) {
                    itemController = 'controller="' + layout.componentController + '"';
                }

                var item = "<div tag=\"collectionItemContent\" " + itemController + "></div>";
                if (layout.component) {
                    item = "<div tag=\"collectionItemContent\" component=\"" + layout.component + "\" " + itemController + "></div>";
                }

                itemFuture = BASE.web.components.createComponent("ui-collection-item", item).then(function (lastElement) {
                    var $collectionItem = $(lastElement);
                    var collectionItemController = $collectionItem.data("controller");
                    var $item = $(collectionItemController.getItem());
                    $item.css({
                        width: "100%",
                        height: "100%"
                    });
                });

            }

            itemFuture.then(function (item) {
                item.style.display = "block";
                item.style.position = "absolute";
                item.style.top = 0;
                item.style.left = 0;
            });

            return itemFuture;
        };

        self.resize = function () {
            resizeFuture.cancel();

            resizeFuture = queryable.count().then(function (length) {
                currentLength = length;
                var width = layout.getWidth(length);
                var height = layout.getHeight(length);

                if (height === 0 || height === "0px") {
                    height = "auto";
                }

                scroll.contentWidth = width;
                scroll.contentHeight = height;
            });

            return resizeFuture;
        };

        var reusableLayout = { width: 0, height: 0 };
        self.prepareLayout = function () {
            var width = scroll.width;
            var height = scroll.height;

            reusableLayout.width = width;
            reusableLayout.height = height;

            layout.scrollViewport = reusableLayout;

            self.update();
        };

        self.loadItemToIndex = function (index) {
            var itemFuture = self.createItem();
            var css = layout.getCss(index);

            itemFuture.then(function (item) {
                var itemController = $(item).data("controller");
                itemController.uiCollection = self;
                itemController.setQueryable(queryable);
                itemController.setIndex(index);
                $(item).css(css);
                scroll.appendContent(item);
                $(item).triggerHandler("enteredView");
            });
            itemsByIndex[index] = itemFuture;
        };

        self.refreshItemAtIndex = function (index) {
            var itemFuture = itemsByIndex[index];
            var css = getCss(index);

            itemFuture.then(function (item) {
                //layout.cleanElement($(item).find('[tag="collectionItemContent"]')[0]);
                var itemController = $(item).data("controller");
                itemController.setQueryable(queryable);
                $(item).css(css);
            });
        };

        var removeItemAtIndex = function (index) {
            var itemFuture = itemsByIndex[index];
            delete itemsByIndex[index];

            availableItems.push(itemFuture);

            itemFuture.then(function (item) {
                $(item).css({
                    display: "none",
                    transition: ""
                });
                $(item).triggerHandler("enteredView");
                //layout.cleanElement($(item).find('[tag="collectionItemContent"]')[0]);
            });
        };

        self.setQueryable = function (q) {
            queryable = q;
            self.prepareLayout();
        };

        self.getQueryable = function () {
            return queryable;
        };

        self.setLayout = function (l) {
            layout = l;
            self.prepareLayout();
        };

        self.getLayout = function () {
            return layout;
        };

        self.update = function () {
            self.resize().then(function () {
                currentIndexes.forEach(function (index) {
                    self.refreshItemAtIndex(index);
                });

                self.redraw();
            });
        };

        $scroll.on("scroll", function (e) {
            self.redraw();
            $elem.triggerHandler(e);
        });

        $scroll.on("resize", function () {
            self.update();
        });

    };
});