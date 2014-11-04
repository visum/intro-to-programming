BASE.require([
    "jQuery",
    "BASE.async.Future",
    "Array.prototype.asQueryable"
], function () {
    BASE.namespace("components.ui.layouts");

    components.ui.layouts.UICollectionItem = function (elem, tags) {
        var self = this;
        var $elem = $(elem);

        var loading = false;
        var itemFuture = new BASE.async.Future();
        var index = -1;
        var throttleTimeout = null;
        var $itemContainer = $(tags["item"]);
        var listItem = $itemContainer.children()[0];

        self.uiCollection = null;

        var queryable = [].asQueryable();

        var updateItem = function () {
            itemFuture.cancel();
            clearTimeout(throttleTimeout);
            throttleTimeout = setTimeout(function () {
                itemFuture = queryable.skip(index).take(1).toArray(function (entities) {
                    if (self.uiCollection && entities.length > 0) {
                        if (!listItem) {
                            throw new Error("Expected to have a list item provider to the Collection.");
                        }
                        self.uiCollection.getLayout().prepareElement(listItem, entities[0], index);
                        self.setLoading(false);
                    }
                }).ifError(function (err) {
                    throw err;
                });
            });
        };

        $elem.on("enteredView", function () {
            $(listItem).triggerHandler("enteredView");
        });

        self.setQueryable = function (value) {
            queryable = value;
            updateItem();
        };

        self.getItem = function () {
            return listItem;
        };

        self.setIndex = function (value) {
            index = value;
            updateItem();
        };

        self.getIndex = function () {
            return index;
        };

        self.setLoading = function (value) {
            if (value) {
                loading = true;
                $(tags.loading).show();
                $(tags.item).hide();
            } else {
                loading = false;
                $(tags.loading).hide();
                $(tags.item).show();
            }
        };

        self.getLoading = function () {
            return loading;
        };

    };
});