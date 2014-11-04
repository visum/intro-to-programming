BASE.require([
    "jQuery"
], function () {
    BASE.namespace("components.ui.inputs");

    components.ui.inputs.UIFileInputBehavior = function (elem) {
        var self = this;
        var $elem = $(elem);
        var $fileInput = $('<input type="file">');

        $elem.data('fileInput', self);

        $fileInput.css({
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0,
            overflow: 'hidden',
            border: 0,
            top: 0,
            left: 0
        });

        $elem.append($fileInput);

        $fileInput.on('change', function (event) {
            event.stopPropagation();
            $(elem).trigger({
                type: 'change',
                value: $fileInput.val().split('\\').pop(),
                files: $fileInput[0].files
            });
        });

        $fileInput.on('click', function () {
            this.value = null;
        });

        self.getFileInput = function () {
            return $fileInput[0];
        };

        self.setFileInputName = function (name) {
            $fileInput.attr('name', name);
        };

        self.triggerClick = function () {
            $fileInput.trigger('click');
        }
    };
});