BASE.require.loader.setObject("jQuery.fn.select2", "lib/plugins/select2351/select2.js");
//BASE.require.loader.setObject("jQuery.fn.select2", "/libcdn/v1.1/plugins/select2/select2.js");

BASE.require([
    "jQuery",
    "jQuery.fn.select2",
    "BASE.collections.Hashmap"
], function () {
    BASE.namespace("components.ui.inputs");

    var Hashmap = BASE.collections.Hashmap;

    components.ui.inputs.UIMultiSelect = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var $selectInput = $(tags['select-input']);

        var selectedObjects = new Hashmap();

        var hash = new Hashmap();

        var queryFunction = function (query) {
            var queryableFuture = self.filter(query.term);

            // make it a future if it isn't already
            if (!queryableFuture.hasOwnProperty("then")) {
                queryableFuture = BASE.async.Future.fromResult(queryableFuture);
            }

            queryableFuture.then(function (q) {
                q.toArray().then(function (results) {
                    hash = new Hashmap();
                    selectedObjects.getValues().forEach(function (selectedObject) {
                        hash.add(selectedObject, selectedObject);
                    });

                    var data = [];
                    results.forEach(function (result) {
                        hash.add(result, result);
                        var obj = {
                            id: result._hash
                        };

                        data.push(obj);
                    });
                    query.callback({ results: data });
                });
            });

        };

        var formatFunction = function (item, container) {
            return self.titleForItem(hash.get(item.id));
        };

        var initSelection = function (element, callback) {
            var data = [];

            var values = selectedObjects.getValues();
            values.forEach(function (selectedObject) {
                hash.add(selectedObject, selectedObject);
                data.push({ id: selectedObject._hash });
            });

            callback(data);
        };

        var placeholder = $elem.attr("placeholder") || "-- Select --";

        var $selectControl = $selectInput.select2({ multiple: true, query: queryFunction, formatResult: formatFunction, formatSelection: formatFunction, initSelection: initSelection, placeholder: placeholder });

        self.focus = function () {
            $selectInput.select2('open'); 
        }

        self.filter = function (search) {
            throw new Error("Filter function not implemented.");
        };

        self.titleForItem = function (item) {
            return item.toString();
        };

        self.getValue = function () {
            return selectedObjects.getValues();
        };

        self.setValue = function (value) {
            value = value || [];
            if (!value.length || (value.length === 0)) {
                $selectInput.select2("val", "", true);
            } else {
                var oldValue = selectedObjects.getValues() || [];
                var perfectMatch = oldValue.every(function (item) {
                    return value.indexOf(item) > -1;
                });
                if (!perfectMatch || oldValue.length === 0) {
                    var valueIds = [];
                    value.forEach(function (item) {
                        selectedObjects.add(item, item);
                        valueIds.push({ id: item._hash });
                    });
                    // Calling this should trigger an update on the select2 field, using selectedObject.
                    $selectInput.select2("val", valueIds, true);
                }
            }
        };

        self.clear = function () {
            $selectControl.select2("val", "");
        };

        $selectControl.on("change", function (e) {
            selectedObjects = new Hashmap();

            var values = e.val.map(function (key) {
                var value = hash.get(key);
                selectedObjects.add(value, value);
                return value;
            });
            $elem.trigger({ type: "change", value: values });

            e.stopPropagation();
        });

    };
});
