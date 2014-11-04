BASE.require([
    "jQuery",
    "jQuery.support.transform",
    "jQuery.fn.transition"
], function () {
    BASE.namespace("components.ui.widgets");

    components.ui.widgets.UIDatePicker = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var $dateContainer = $(tags['date-container']);
        var $month = $(tags['month']);
        var $dayOfWeek = $(tags['dayOfWeek']);
        var $day = $(tags['day']);
        var $year = $(tags['year']);
        var $calendarInner = $(tags['calendar-inner']);
        var $calendarMonth = $(tags['calendar-month']);
        var $calendarYear = $(tags['calendar-year']);
        var $calendarMonths = $(tags['calendar-months']);
        var $calendarYears = $(tags['calendar-years']);
        var $calendarTable = $(tags['calendar-table']);
        var calendarMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var calendarMonthsAbbr = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        var dayOfWeekArray = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

        var setCalendarYearsHtml = function (year , howFarBack) {
            $calendarYears.html('');
            var $div = $('<div ui-button class="link"></div>');
            var beginningYear = year - howFarBack;
            $div.text((beginningYear - 10) + '-' + (beginningYear - 1));
            $calendarYears.append($div.clone().addClass('smaller'));
            for (var i = 0; i < 10; i++) {
                $div.text(beginningYear);
                $calendarYears.append($div.clone());
                beginningYear++;
            }
            $div.text(beginningYear + '-' + (beginningYear + 9));
            $calendarYears.append($div.clone().addClass('smaller'));
        }

        var showMonths = function () {
            if (!$calendarMonths.is(':visible')) {
                $calendarYears.addClass('behind');
                $calendarMonths.removeClass('hide').transition({
                    transform: {
                        from: 'scale(0)',
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 400
                    }
                }).then(function () {
                    $calendarYears.addClass('hide').removeClass('behind');
                });
            }
        }

        var showYears = function () {
            if (!$calendarYears.is(':visible')) {
                var year = parseInt($year.text(), 10);
                setCalendarYearsHtml(year, 4);
                $calendarMonths.addClass('behind');
                $calendarYears.removeClass('hide').transition({
                    transform: {
                        from: 'scale(0)',
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 400
                    }
                }).then(function () {
                    $calendarMonths.addClass('hide').removeClass('behind');
                });
            }
        }

        var showCalendar = function () {
            $calendarYears.transition({
                transform: {
                    from: 'scale(1)',
                    to: 'scale(0)',
                    easing: 'easeInExpo',
                    duration: 400
                }
            }).then(function () {
                $calendarYears.addClass('hide');
            });
            $calendarMonths.transition({
                transform: {
                    from: 'scale(1)',
                    to: 'scale(0)',
                    easing: 'easeInExpo',
                    duration: 400
                }
            }).then(function () {
                $calendarMonths.addClass('hide');
            });
        }

        self.reset = function () {
            $day.trigger('click');
        }

        self.setDate = function (date) {
            var month = date.getMonth();
            var dayOfWeek = date.getDay();
            var day = date.getDate();
            var year = date.getFullYear();
            var daysInMonth = new Date(year, month + 1, 0).getDate();
            var startDayOfMonth = new Date(year, month, 1).getDay();

            $month.text(calendarMonthsAbbr[month]);
            $calendarMonth.text(calendarMonths[month]);
            $year.text(year);
            $calendarYear.text(year);
            $dayOfWeek.text(dayOfWeekArray[dayOfWeek]);
            if (day < 10) {
                $day.text('0' + day);
            }
            else {
                $day.text(day);
            }
            
            var count = 1;
            var $div = $('<div ui-button class="calendar-cell link"></div>');
            $calendarTable.html('');
            amountOfDivs = startDayOfMonth + daysInMonth;
            var height = ((Math.ceil(amountOfDivs / 7) * 35) + 50) + 'px';
            var duration = 300;
            if (!$calendarMonths.is(':visible') && !$calendarYears.is(':visible')) {
                duration = 0;
            }
            $calendarInner.transition({
                height: {
                    to: height,
                    easing: 'easeOutExpo',
                    duration: duration
                }
            }).then(function () {
                for (i = 0; i < amountOfDivs; i++) {
                    if (i < startDayOfMonth) {
                        $calendarTable.append($div.clone());
                    }
                    else {
                        $div.text(count);
                        if (count === day) {
                            $calendarTable.append($div.clone().addClass('active'));
                        }
                        else {
                            $calendarTable.append($div.clone());
                        }
                        count++;
                    }
                }
            });
            $day.addClass('active');
            $day.trigger('click');
        }

        self.getDate = function () {
            var year = parseInt($year.text(), 10);
            var month = $.inArray($month.text(), calendarMonthsAbbr);
            var day = parseInt($day.text(), 10);
            return new Date(year, month, day);
        }

        $month.on('click', function () {
            var $this = $(this);
            $dateContainer.find('.active').removeClass('active');
            $calendarMonths.find('.active').removeClass('active');
            $this.addClass('active');
            showMonths();
            $calendarMonths.find('div').filter(function () {
                return $(this).text() === $month.text();
            }).addClass('active');
            $month.transition({
                transform: {
                    to: 'scale(0.8)',
                    easing: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $month.transition({
                    transform: {
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 200
                    }
                });
            });
        });

        $year.on('click', function () {
            var $this = $(this);
            $dateContainer.find('.active').removeClass('active');
            $calendarYears.find('.active').removeClass('active');
            $this.addClass('active');
            showYears();
            $calendarYears.find('div').filter(function () {
                return $(this).text() === $year.text();
            }).addClass('active');
            $year.transition({
                transform: {
                    to: 'scale(0.8)',
                    easing: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $year.transition({
                    transform: {
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 200
                    }
                });
            });
        });

        $day.on('click', function () {
            var $this = $(this);
            $dateContainer.find('.active').removeClass('active');
            $calendarTable.find('.active').removeClass('active');
            $this.addClass('active');
            showCalendar();
            $calendarTable.find('div').filter(function () {
                return parseInt($(this).text(), 10) === parseInt($day.text(), 10);
            }).addClass('active');
            $day.transition({
                transform: {
                    to: 'scale(0.8)',
                    easing: 'easeOutExpo',
                    duration: 200
                }
            }).then(function () {
                $day.transition({
                    transform: {
                        to: 'scale(1)',
                        easing: 'easeOutExpo',
                        duration: 200
                    }
                });
            });
        });

        $calendarMonths.on('click', 'div', function () {
            var $this = $(this);
            $calendarMonths.find('.active').removeClass('active');
            $this.addClass('active');
            $month.text($this.text());
            var date = self.getDate();
            self.setDate(date);
            $day.trigger('click');
        });

        $calendarYears.on('click', 'div', function () {
            var $this = $(this);
            var index = $this.index();
            if (index === 0) {
                var split = $this.text().split('-');
                setCalendarYearsHtml(parseInt(split[1], 10), 9);
            }
            else if (index === 11) {
                var split = $this.text().split('-');
                setCalendarYearsHtml(parseInt(split[0], 10), 0);
            }
            else {
                $calendarYears.find('.active').removeClass('active');
                $this.addClass('active');
                $year.text($this.text());
                var date = self.getDate();
                self.setDate(date);
                $day.trigger('click');
            }
        });

        $calendarTable.on('click', 'div:not(:empty)', function () {
            var $this = $(this);
            $day.text($this.text());
            $this.siblings().removeClass('active');
            $this.addClass('active');
            $elem.trigger({
                type: 'dayClicked',
                value: self.getDate()
            });
        });

        $calendarMonth.on('click', function () {
            $month.trigger('click');
        });

        $calendarYear.on('click', function () {
            $year.trigger('click');
        });

        self.setDate(new Date());
    };
});