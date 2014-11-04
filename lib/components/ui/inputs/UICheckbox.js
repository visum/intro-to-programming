BASE.require([
    "jQuery",
    "jQuery.fn.transition"
], function () {
    BASE.namespace("components.ui.inputs");

    components.ui.inputs.UICheckbox = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var $squareBlank = $(tags['square-blank']);
        var $ok = $(tags['ok']);
        var $labelBefore = $(tags['label-before']);
        var $labelAfter = $(tags['label-after']);

        self.toggle = function () {
            if ($elem.is('[checked]')) {
                $elem.removeAttr('checked');
                $ok.transition({
                    transform: {
                        to: 'scale(0)',
                        duration: 150,
                        easing: 'ease'
                    }
                }).then(function () {
                    $ok.addClass('hide');
                    $squareBlank.removeClass('hide');
                    $squareBlank.transition({
                        transform: {
                            from: 'rotate(90deg) scale(0)',
                            to: 'rotate(0deg) scale(1)',
                            duration: 150,
                            easing: 'ease'
                        }
                    });
                });

            }
            else {
                $elem.attr('checked', '');
                $squareBlank.transition({
                    transform: {
                        to: 'rotate(90deg) scale(0)',
                        duration: 150,
                        easing: 'ease'
                    }
                }).then(function () {
                    $squareBlank.addClass('hide');
                    $ok.removeClass('hide');
                    $ok.transition({
                        transform: {
                            from: 'scale(0)',
                            to: 'scale(1)',
                            duration: 150,
                            easing: 'ease'
                        }
                    });
                });
            }
        }

        self.check = function () {
            $elem.removeAttr('checked');
            self.toggle();
        }

        self.uncheck = function () {
            $elem.attr('checked', '');
            self.toggle();
        }

        self.reset = function () {
            self.uncheck();
        }

        self.isChecked = function () {
            return $elem.is('[checked]');
        }

        if ($elem.is('[checked]')) {
            $elem.removeAttr('checked');
            self.toggle();
        }

        if ($elem.is('[label-after]')) {
            $labelBefore.addClass('hide');
            $labelAfter.removeClass('hide');
            $labelAfter.text($elem.attr('label'));
        } else {
            $labelBefore.removeClass('hide');
            $labelAfter.addClass('hide');
            $labelBefore.text($elem.attr('label'));
        }

        $elem.on('click', function () {
            self.toggle();
        });

    };
});