BASE.require([
    "jQuery",
    "BASE.async.Future",
    "BASE.web.components"
], function () {
    BASE.namespace("components.ui.layouts");

    var Future = BASE.async.Future;
    var components = BASE.web.components;

    components.ui.layouts.UIPopover = function (elem, tags) {
        var self = this;
        var $elem = $(elem);

        var $popover = $(tags.popover);
        var $popoverTitle = $(tags.popoverTitle);
        var $popoverContent = $(tags.popoverContent);
        var $popoverComponent = $(tags.popoverComponent);
        var $arrow = $(tags.arrow);

        self.placement = 'top';
        self.popover = $popover;

        self.show = function () {
            return new Future(function (setValue, setError) {
                $popover.show();
                setValue();
            }).then();
            
        }

        self.hide = function () {
            return new Future(function (setValue, setError) {
                $popover.hide();
                setValue();
            }).then();
        }

        self.setOptions = function (options) {
            options = options || {};
            if (options.hideArrow === true) {
                $arrow.hide();
            }
            else {
                $arrow.show();
            }
            if (typeof options.placement !== 'undefined') {
                self.placement = options.placement;
                $popover.removeAttr('class').addClass(options.placement);
            }            
            if (typeof options.title === 'undefined') {
                $popoverTitle.hide();
            }
            else {
                $popoverTitle.show();
                $popoverTitle.html(options.title);
            }
            if (typeof options.content === 'undefined') {
                $popoverContent.hide();
            }
            else {
                $popoverContent.show();
                $popoverContent.html(options.content);
            }
            if (typeof options.component === 'undefined') {
                $popoverComponent.hide();
            }
            else {
                $popoverComponent.show();
                $popoverComponent.html();
                components.createComponent(options.component, options.componentContent, options.componentAttributes).then(function (component) {
                    $popoverComponent.append(component);
                    $(component).find("[component]").addBack().triggerHandler('enteredView');
                });
            }
        }
    };
});