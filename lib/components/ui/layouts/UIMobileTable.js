BASE.require([
    "jQuery",
], function () {
    BASE.namespace("components.ui.layouts");

    components.ui.layouts.UIMobileTable = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var $th = $elem.find('th');
        var thStyle = document.createElement('style');
        thStyle.type = 'text/css';

        thStyle.innerHTML = "@media only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px)  {";
        for (i = 0; i < $th.length; i++) {
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table] td:nth-of-type(' + (i + 1) + '):before { content: "' + $th[i].innerHTML + '"; text-align: left !important; font-weight:300;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].muted td:nth-of-type(' + (i + 1) + '):before {color: #bbb !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].inverse td:nth-of-type(' + (i + 1) + '):before {color: #222222 !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].primary td:nth-of-type(' + (i + 1) + '):before {color: #00457c !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].warning td:nth-of-type(' + (i + 1) + '):before {color: #f89406 !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].danger td:nth-of-type(' + (i + 1) + '):before {color: #bd362f !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].info td:nth-of-type(' + (i + 1) + '):before {color: #2f96b4 !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].success td:nth-of-type(' + (i + 1) + '):before {color: #51a351 !important;}';
            thStyle.innerHTML = thStyle.innerHTML + '[ui-mobile-table].light td:nth-of-type(' + (i + 1) + '):before {color: #ffffff !important;}';
        }
        thStyle.innerHTML = thStyle.innerHTML + "}";
        document.body.appendChild(thStyle);
    }
});