BASE.require([
    "jQuery",
    "jQuery.allEasings",
    "BASE.async.Future"
], function () {
    BASE.namespace("components.ui.inputs");

    var Future = BASE.async.Future;

    components.ui.inputs.UIProgressBar = function (elem) {
        var self = this;
        var $elem = $(elem);
        var isPaused = true;
        var backgroundX = 0

        var animateProgressBar = function (x) {
            var duration = 600;
            if (x) {
                duration = 600 - (15 * x);
            }
            else {
                x = 0;
            }
            if (!isPaused) {
                var $bar = $elem.find('.bar');
                $({ backgroundPositionX: x }).animate({ backgroundPositionX: 40 }, {
                    duration: duration,
                    easing: 'linear',
                    step: function () {
                        var position = Math.round(this.backgroundPositionX) + 'px 0';
                        $bar.css('background-position', position);
                    },
                    progress: function () {
                        if (isPaused) {
                            backgroundX = Math.round(this.backgroundPositionX);
                            $(this).stop(true, true);
                        }
                    },
                    complete: function () {
                        animateProgressBar();
                    }
                });
            }
        }

        self.setPercentage = function (value, bar) {
            bar = bar || 0;
            var $bar = $elem.children().eq(bar);
            return new Future(function (setValue, setError) {
                $bar.stop(true, true).animate({ width: value+'%' }, 600, 'easeOutExpo', setValue);
            }).then();
        }

        self.setClass = function (value, bar) {
            bar = bar || 0
            var $bar = $elem.children().eq(bar);
            $bar.removeAttr('class').addClass('bar ' + value);
        }

        self.addBar = function (style) {
            if(style){
                style = ' '+style;
            }
            else {
                style = '';
            }
            $elem.append($('<div class="bar'+style+'"></div>'));
        }

        self.removeBar = function (bar) {
            bar = bar || 0;
            $elem.children().eq(bar).remove();
        }

        self.pause = function () {
            isPaused = true;
        }

        self.start = function () {
            if (isPaused) {
                isPaused = false;
                animateProgressBar(backgroundX);
            }
        }

        if ($elem.is('[active]')) {
            self.start();
        }        
    };
});