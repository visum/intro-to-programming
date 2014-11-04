BASE.require([
    "core.effect.Scroller",
    "jQuery",
    "BASE.async.delay",
    "jQuery.fn.region"
], function () {

    BASE.namespace("components.ui.layouts");

    var Future = BASE.async.Future;
    var delay = BASE.async.delay;
    var resizeFuture = Future.fromResult(null);

    $(function () {
        $(window).resize(function () {
            resizeFuture.cancel();
            resizeFuture = delay(20).then(function () {
                $("[controller='components.ui.layouts.UIScroll']").each(function () {
                    var $scroll = $(this);

                    $scroll.controller().redraw();
                    $scroll.triggerHandler("resize");
                });
            });
        });
    });

    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };

    var docStyle = document.documentElement.style;
    global = window;

    var engine;
    if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
        engine = 'presto';
    } else if ('MozAppearance' in docStyle) {
        engine = 'gecko';
    } else if ('WebkitAppearance' in docStyle) {
        engine = 'webkit';
    } else if (typeof navigator.cpuClass === 'string') {
        engine = 'trident';
    }

    var vendorPrefix = {
        trident: 'ms',
        gecko: 'Moz',
        webkit: 'Webkit',
        presto: 'O'
    }[engine];

    var perspectiveProperty = vendorPrefix + "Perspective";
    var transformProperty = vendorPrefix + "Transform";

    var attach = function (container, scroller, isMobile) {

        var touchStart = function (e) {
            //// Don't react if initial down happens on a form element
            //if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
            //    return;
            //}

            scroller.doTouchStart(e.touches, e.timeStamp);

            document.addEventListener("touchmove", touchMove, false);
            document.addEventListener("touchend", touchEnd, false);
            document.addEventListener("touchcancel", touchEnd, false);


        };

        var touchMove = function (e) {
            scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
            e.preventDefault();
        };

        var touchEnd = function (e) {
            scroller.doTouchEnd(e.timeStamp);

            document.removeEventListener("touchmove", touchMove);
            document.removeEventListener("touchend", touchEnd);
            document.removeEventListener("touchcancel", touchEnd);
        };

        container.addEventListener("touchstart", touchStart, false);

        if (!isMobile) {
            container.addEventListener("mousewheel", function (e) {
                var direction = e.wheelDelta / Math.abs(e.wheelDelta);
                scroller.scrollBy(0, -direction * 120, true);
            }, false);
        }

    };

    components.ui.layouts.UIScroll = function (elem, tags, scope) {
        var self = this;
        var $elem = $(elem);
        var content = tags["content"];
        var $content = $(content);
        var $xHandle = $(tags["xHandle"]).children().first();
        var $yHandle = $(tags["yHandle"]).children().first();

        var yHandle = $yHandle.controller();
        var xHandle = $xHandle.controller();

        var contentWidth = content.clientWidth;
        var contentHeight = content.clientHeight;
        var scrollingX;
        var scrollingY;
        var top = 0;
        var left = 0;
        var height = 0;
        var width = 0;
        var isMobileApp = isMobile.any();
        var percentHeight = 1;
        var percentWidth = 1;
        var DEFAULT_HANDLE_SIZE = 25;
        var yHandleSize = DEFAULT_HANDLE_SIZE;
        var xHandleSize = DEFAULT_HANDLE_SIZE;

        if ($elem.attr("scroll-x") === "false") {
            scrollingX = false;
        } else {
            scrollingX = true;
        }

        if ($elem.attr("scroll-y") === "false") {
            scrollingY = false;
        } else {
            scrollingY = true;
        }

        yHandle.setContainer($yHandle.parent());
        xHandle.setContainer($xHandle.parent());

        var reusableEvent = jQuery.Event("scroll");
        reusableEvent.top = 0;
        reusableEvent.left = 0;
        reusableEvent.zoom = 1;
        reusableEvent.preventDefault = function () { throw new Error("Cannot call this."); };
        reusableEvent.stopPropagation = function () { throw new Error("Cannot call this."); };

        var calculateScrollHandlePosition = function () {
            var scrollHeightPercent = top / (contentHeight - height);
            var positionY = (height - yHandleSize) * scrollHeightPercent;
            $yHandle.css({
                transform: "translate3d(0, " + positionY + "px, 0)"
            });

            var scrollWidthPercent = width / (contentWidth - width);
            var positionX = (width - xHandleSize) * scrollWidthPercent;
            $xHandle.css({
                transform: "translate3d(0, " + positionX + "px, 0)"
            });
        };

        var calculateScrollHandleSize = function () {
            percentHeight = height / contentHeight;
            percentWidth = width / contentWidth;

            if (percentHeight * height < DEFAULT_HANDLE_SIZE) {
                self.showYScrollHandler();

                yHandleSize = DEFAULT_HANDLE_SIZE;
                $yHandle.css({
                    height: DEFAULT_HANDLE_SIZE + "px"
                });
            } else {
                yHandleSize = percentHeight * height;

                // Infinity happens when the content height is 0.
                if (percentHeight >= 1 || percentHeight === Infinity) {
                    self.hideYScrollHandler();
                } else {
                    self.showYScrollHandler();
                    $yHandle.css({
                        height: (percentHeight * 100) + "%"
                    });
                }
            }

            if (percentWidth * width < DEFAULT_HANDLE_SIZE) {
                self.showXScrollHandler();

                xHandleSize = DEFAULT_HANDLE_SIZE;
                $xHandle.css({
                    width: DEFAULT_HANDLE_SIZE + "px"
                });
            } else {
                xHandleSize = percentWidth * width;

                if (percentWidth >= 1 || percentWidth === Infinity) {
                    self.hideXScrollHandler();
                } else {
                    self.showXScrollHandler();
                    $xHandle.css({
                        width: (percentWidth * 100) + "%"
                    });
                }
            }
        };

        var scroller = new core.effect.Scroller(function (newLeft, newTop, zoom) {
            top = newTop;
            left = newLeft;

            // This help on not garbage collecting small object.
            var event = reusableEvent;
            event.top = newTop;
            event.left = newLeft;
            event.zoom = zoom;


            $elem.triggerHandler(event);

            content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
        }, {
            scrollingX: scrollingX,
            scrollingY: scrollingY,
            bouncing: false
        });

        attach(content, scroller, isMobileApp);

        self.redraw = function () {
            width = clientWidth = elem.clientWidth;
            height = clientHeight = elem.clientHeight;

            contentWidth = content.clientWidth;
            contentHeight = content.clientHeight;
            if (!isMobileApp) {
                calculateScrollHandleSize();
            }
            scroller.setDimensions(clientWidth, clientHeight, contentWidth, contentHeight);
        };

        self.appendContent = function (item) {
            $content.append(item);
        };

        self.hideXScrollHandler = function () {
            $xHandle.parent().css("display", "none");
        };

        self.hideYScrollHandler = function () {
            $yHandle.parent().css("display", "none");
        };

        self.showXScrollHandler = function () {
            $xHandle.parent().css("display", "block");
        };

        self.showYScrollHandler = function () {
            $yHandle.parent().css("display", "block");
        };

        Object.defineProperties(self, {
            top: {
                get: function () {
                    return top;
                }
            },
            left: {
                get: function () {
                    return left;
                }
            },
            width: {
                get: function () {
                    if (width === 0) {
                        width = elem.clientWidth;
                    }
                    return width;
                }
            },
            height: {
                get: function () {
                    if (height === 0) {
                        height = elem.clientHeight;
                    }
                    return height;
                }
            },
            contentHeight: {
                get: function () {
                    return contentHeight;
                },
                set: function (value) {
                    content.style.height = value;
                    self.redraw();
                }
            },
            contentWidth: {
                get: function () {
                    return contentWidth;
                },
                set: function (value) {
                    content.style.width = value;
                    self.redraw();
                }
            },
            scrollX: {
                get: function () {
                    return scroller.options.scrollingX;
                },
                set: function (value) {
                    if (typeof value === "boolean") {
                        scroller.options.scrollingX = value;
                    }
                }

            },
            scrollY: {
                get: function () {
                    return scroller.options.scrollingY;
                },
                set: function (value) {
                    if (typeof value === "boolean") {
                        scroller.options.scrollingY = value;
                    }
                }
            }

        });

        if (!isMobileApp) {
            $xHandle.css("opacity", "0");
            $yHandle.css("opacity", "0");

            self.showXScrollHandler();
            self.showYScrollHandler();

            $elem.on("scroll", function () {
                calculateScrollHandlePosition();
            });

            $yHandle.on("dragEnd", function (e) {
                var yhandlePosition = e.boundingBox.top - $elem[0].getBoundingClientRect().top;
                var scrollableHeight = (height - yHandleSize);
                var scrollYPercent = yhandlePosition / scrollableHeight;
                var top = scrollYPercent * (contentHeight - height);

                scroller.scrollTo(self.left, top);
            });

            $xHandle.on("dragEnd", function (e) {
                var xhandlePosition = e.boundingBox.left - $elem[0].getBoundingClientRect().left;
                var scrollableWidth = (width - xHandleSize);
                var scrollXPercent = xhandlePosition / scrollableWidth;
                var left = scrollXPercent * (contentWidth - width);
            });

            $elem.on("mouseenter", function () {
                $xHandle.css("opacity", "1");
                $yHandle.css("opacity", "1");
            });

            $elem.on("mouseleave", function () {
                $xHandle.css("opacity", "0");
                $yHandle.css("opacity", "0");
            });
        }



        setTimeout(function () {
            self.redraw();
        }, 0);


    };

});