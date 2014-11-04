BASE.require([
    "jQuery",
    "jQuery.support.transform",
    "jQuery.fn.transition"
], function () {
    BASE.namespace("components.ui.widgets");

    components.ui.widgets.UITimePicker = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var $clockContainer = $(tags['clock-container']);
        var $clock = $(tags['clock']);
        var $clockChildren = $clock.children().find('span');
        var $exactTime = $(tags['exact-time']);
        var $exactTimeChildren = $exactTime.children();
        var $time = $(tags['time']);
        var $hours = $(tags['hours']);
        var $minutes = $(tags['minutes']);
        var $secondsSeparator = $(tags['seconds-separator']);
        var $seconds = $(tags['seconds']);
        var $period = $(tags['period']);
        var $keypad = $(tags['keypad']);
        var keypadState = 1;

        if ($.support.transform) {
            $clock.addClass('transform-supported');
        }

        if ($elem.is('[seconds]')) {
            $secondsSeparator.removeClass('hide');
            $seconds.removeClass('hide');
        }

        var setActiveClockNumber = function (value) {
            $clockChildren.removeClass('active increase-font-size');
            if ($clockChildren.filter(function () {
                var $this = $(this);
                return $.trim($this.text()) === value && $this.is(':visible');
            }).addClass('active increase-font-size').length === 0) {
                $exactTimeChildren.addClass('active increase-font-size');
            }
        }

        var hideKeypad = function () {
            $keypad.transition({
                transform: {
                    to: 'scale(0)',
                    ease: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $keypad.addClass('invisible');
            });
            keypadState = 1;
            $keypad.find('.second-only').attr('disabled', '');
            $time.find('.keypad-first').removeClass('keypad-first');
            $time.find('.keypad-second').removeClass('keypad-second');
        }

        $keypad.find('[ui-button]').on('click', function () {
            var $this = $(this);
            var $active = $time.find('.active');
            var value = parseInt($this.text(), 10);
            if (keypadState === 2) {
                var text = $active.text().substring(0, 1);
                $active.text(text + value);
                hideKeypad();
                if ($seconds.is(':visible')) {
                    $seconds.trigger('click');
                }
                else {
                    $minutes.trigger('click');
                }
            }
            else if (value < 6) {
                var text = $active.text().substring(1);
                $active.text(value + text);
                $keypad.find('.second-only').removeAttr('disabled');
                keypadState = 2;
                $active.removeClass('keypad-first').addClass('keypad-second');
            }
        });

        $hours.on('click', function () {
            hideKeypad();
            $exactTime.addClass('invisible');

            $hours.transition({
                transform: {
                    to: 'scale(0.8)',
                    easing: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $hours.transition({
                    transform: {
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 200
                    }
                });
            });

            $clock.find('.minutes-seconds').each(function () {
                var $this = $(this);
                var translateString = '';
                translateString = $this.is('.twelve') ? 'translate3d(0, 100%, 0)' : translateString;
                translateString = $this.is('.one') ? 'translate3d(-40%, 120%, 0)' : translateString;
                translateString = $this.is('.two') ? 'translate3d(-100%, 80%, 0)' : translateString;
                translateString = $this.is('.three') ? 'translate3d(-100%, 0, 0)' : translateString;
                translateString = $this.is('.four') ? 'translate3d(-100%, -80%, 0)' : translateString;
                translateString = $this.is('.five') ? 'translate3d(-40%, -120%, 0)' : translateString;
                translateString = $this.is('.six') ? 'translate3d(0, -100%, 0)' : translateString;
                translateString = $this.is('.seven') ? 'translate3d(40%, -120%, 0)' : translateString;
                translateString = $this.is('.eight') ? 'translate3d(100%, -80%, 0)' : translateString;
                translateString = $this.is('.nine') ? 'translate3d(100%, 0, 0)' : translateString;
                translateString = $this.is('.ten') ? 'translate3d(100%, 80%, 0)' : translateString;
                translateString = $this.is('.eleven') ? 'translate3d(40%, 120%, 0)' : translateString;
                $this.transition({
                    opacity: {
                        to: '0',
                        easing: 'easeOutExpo',
                        duration: 500
                    },
                    transform: {
                        to: translateString,
                        easing: 'easeOutExpo',
                        duration: 500
                    }
                }).then(function () {
                    $this.addClass('invisible');
                });
            });
            $clock.find('.hours').removeClass('invisible').each(function () {
                var $this = $(this);
                $this.transition({
                    opacity: {
                        to: '1',
                        easing: 'easeOutExpo',
                        duration: 500
                    },
                    transform: {
                        to: 'translate3d(0, 0, 0)',
                        easing: 'easeOutExpo',
                        duration: 500
                    }
                });
            });
            $time.find('.active').removeClass('active');
            $hours.addClass('active');
            setActiveClockNumber($hours.text());
        });

        $minutes.add($seconds).on('click', function () {
            var $this = $(this);
            hideKeypad();
            $exactTime.removeClass('invisible');

            $this.transition({
                transform: {
                    to: 'scale(0.8)',
                    easing: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $this.transition({
                    transform: {
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 200
                    }
                });
            });

            $clock.find('.hours').each(function () {
                var $this = $(this);
                var translateString = '';
                translateString = $this.is('.twelve') ? 'translate3d(0, -100%, 0)' : translateString;
                translateString = $this.is('.one') ? 'translate3d(40%, -120%, 0)' : translateString;
                translateString = $this.is('.two') ? 'translate3d(100%, -80%, 0)' : translateString;
                translateString = $this.is('.three') ? 'translate3d(100%, 0, 0)' : translateString;
                translateString = $this.is('.four') ? 'translate3d(100%, 80%, 0)' : translateString;
                translateString = $this.is('.five') ? 'translate3d(40%, 120%, 0)' : translateString;
                translateString = $this.is('.six') ? 'translate3d(0, 100%, 0)' : translateString;
                translateString = $this.is('.seven') ? 'translate3d(-40%, 120%, 0)' : translateString;
                translateString = $this.is('.eight') ? 'translate3d(-100%, 80%, 0)' : translateString;
                translateString = $this.is('.nine') ? 'translate3d(-100%, 0, 0)' : translateString;
                translateString = $this.is('.ten') ? 'translate3d(-100%, -80%, 0)' : translateString;
                translateString = $this.is('.eleven') ? 'translate3d(-40%, -120%, 0)' : translateString;
                $this.transition({
                    opacity: {
                        to: '0',
                        easing: 'easeOutExpo',
                        duration: 500
                    },
                    transform: {
                        to: translateString,
                        easing: 'easeOutExpo',
                        duration: 500
                    }
                }).then(function () {
                    $this.addClass('invisible');
                });
            });
            var $minutesSeconds = $clock.find('.minutes-seconds');
            $minutesSeconds.removeClass('invisible').each(function () {
                var $this = $(this);
                $this.transition({
                    opacity: {
                        to: '1',
                        easing: 'easeOutExpo',
                        duration: 500
                    },
                    transform: {
                        to: 'translate3d(0, 0, 0)',
                        easing: 'easeOutExpo',
                        duration: 500
                    }
                });
            });
            var $active = $time.find('.active').removeClass('active');
            $this.addClass('active');
            setActiveClockNumber($this.text());
            if (($active.is($minutes) && !$this.is($minutes)) || ($active.is($seconds) && !$this.is($seconds))) {   
                $minutesSeconds.each(function () {
                    var $this = $(this);
                    $this.transition({
                        transform: {
                            to: 'scale(0)',
                            easing: 'easeOutExpo',
                            duration: 400
                        }
                    }).then(function () {
                        $minutesSeconds.each(function () {
                            var $this = $(this);
                            $this.transition({
                                transform: {
                                    to: 'scale(1)',
                                    easing: 'easeOutExpo',
                                    duration: 400
                                }
                            });
                        });
                    });
                });
            }
        });

        $period.on('click', function () {
            var $this = $(this);
            var text = $this.text();
            if (text === 'AM') {
                $this.text('PM');
            }
            else {
                $this.text('AM');
            }
            $period.transition({
                transform: {
                    to: 'scale(0.8)',
                    easing: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $period.transition({
                    transform: {
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 200
                    }
                });
            });
        });

        $clockChildren.on('click', function () {
            var $this = $(this);
            $clockChildren.removeClass('increase-font-size active');
            $this.addClass('increase-font-size active');
            var text = $this.text();
            if (text !== '') {
                $time.find('.active').text(text);
            }
            var timeout = 0;
            if ($.support.transform) {
                timeout = 400;
            }
            setTimeout(function () {
                if ($this.parent().is($exactTime)) {
                    $keypad.removeClass('invisible').transition({
                        transform: {
                            from: 'scale(0)',
                            to: 'scale(1)',
                            ease: 'easeOutExpo',
                            duration: 200
                        }
                    });
                    $time.find('.active').addClass('keypad-first');
                }
                else if ($hours.is('.active')) {
                    $minutes.trigger('click');
                }
                else if ($minutes.is('.active')) {
                    if ($seconds.is(':visible')) {
                        $seconds.trigger('click');
                    }
                }
            }, timeout);
        });

        self.reset = function () {
            $hours.trigger('click');
        }

        self.setTime = function (time) {
            if (time instanceof Date) {
                var hours = time.getHours();
                var minutes = time.getMinutes();
                var seconds = time.getSeconds();
            }
            else {
                var hours = time.hours;
                var minutes = time.minutes;
                var seconds = time.seconds;
            }

            $period.text(hours >= 12 ? 'PM' : 'AM');
            hours = hours % 12;
            hours = hours ? hours : 12;
            $hours.text(hours);
            minutes = minutes < 10 ? '0' + minutes : minutes;
            $minutes.text(minutes);
            seconds = seconds < 10 ? '0' + seconds : seconds;
            if ($seconds.is(':visible')) {
                $seconds.text(seconds);
            }          
            $hours.trigger('click');
        };

        self.getTime = function () {
            var time = {}
            var hours = parseInt($hours.text(),10);
            if ($period.text() === 'AM') {
                if (hours === 12) {
                    hours = 0;
                }
            }
            else {
                if (hours !== 12) {
                    hours = hours + 12;
                }
            }
            time.hours = hours;
            time.minutes = parseInt($minutes.text(),10);
            time.seconds = parseInt($seconds.text(), 10);
            return time;
        }

        self.setTime(new Date());
    };
});