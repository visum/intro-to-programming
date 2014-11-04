BASE.require([
    "jQuery"
], function () {
    BASE.namespace("components.leavitt");


    // TODO: In the best world, this would be able to pull the dataContext out of scope, along with the API domain
    components.leavitt.LeavittProfileImage = function (elem, tags) {
        var self = this;
        var $elem = $(elem);
        var $imgElement = $(tags['imgElement']);
        var loadImageEndpoint = "https://api.leavitt.com/core/ProfilePictureAttachmentFiles/";

        var personId = $elem.attr("person-id") ? $elem.attr("person-id") : null;
        var width = $elem.attr("width") ? $elem.attr("width") : 100;

        var dataContext = null;
        var ajaxProvider = null;

        var getProfileImage = function (attachment) {
            return new BASE.async.Future(function (setValue, setError) { 
                var req = new XMLHttpRequest();
                req.open("GET", loadImageEndpoint + attachment.id)
                req.setRequestHeader("X-LGToken", ajaxProvider.defaultHeaders["X-LGToken"]);
                req.setRequestHeader("X-LGAppId", ajaxProvider.defaultHeaders["X-LGAppId"]);
                req.responseType = "arraybuffer";
                req.onload = function (event) {
                    var arrayBuffer = req.response;
                    if (arrayBuffer) {
                        var sv = new StringView(arrayBuffer);
                        setValue("data:image/jpeg;base64," + sv.toBase64());
                    }
                };
                req.send(null);
            });
        };

        var loadImage = function () {
            if (dataContext && personId) {
                dataContext.profilePictureAttachments.where(function (e) {
                    return e.property("ownerId").isEqualTo(personId);
                }).first().then(function (attachment) {
                    getProfileImage(attachment).then(function (imageSrc) {
                        $imgElement.attr("src", imageSrc);
                    });
                });
            }
        };

        self.setDataContext = function (value) {
            if (dataContext !== value) {
                dataContext = value;
                if (ajaxProvider !== null) {
                    loadImage();
                }
                
            }
        };

        self.setAjaxProvider = function (value) {
            ajaxProvider = value;
            if (dataContext !== null) {
                loadImage();
            }
        };

        self.setPerson = function (value) {
            if (personId !== value.id) {
                personId = value.id;
                loadImage();
            }
        }

        self.setPersonId = function (value) {
            personId = value;
            loadImage();
        };

    };
});