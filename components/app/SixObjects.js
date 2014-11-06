BASE.require([
    "jQuery",
    "components.ui.states.UIStateBehavior"
], function(){
    BASE.namespace("app")
    
    var BoxInterface = function(boxElement){
        var self = this;
        Object.defineProperties(self, {
            "top":{
                set: function(value){
                    if (typeof value !== "number") {
                        throw new Error("I need a Number to do that");
                    }
                    boxElement.style.top = value + "px";
                },
                get: function(){
                    return boxElement.style.top.split("px")[0];
                }
            },
            "left":{
                set: function(value){
                    if (typeof value !== "number") {
                        throw new Error("I need a Number to do that");
                    }
                    boxElement.style.left = value + "px";
                },
                get: function(){
                    return boxElement.style.left.split("px")[0];
                }
            },
            "width":{
                set: function(value){
                    if (typeof value !== "number") {
                        throw new Error("I need a Number to do that");
                    }
                    boxElement.style.width = value + "px";
                },
                get: function(){
                    return boxElement.style.width.split("px")[0];
                }
            },
            "height":{
                set: function(value){
                    if (typeof value !== "number") {
                        throw new Error("I need a Number to do that");
                    }
                    boxElement.style.height = value + "px";
                },
                get: function(){
                    return boxElement.style.height.split("px")[0];
                }
            }
            
        });
    };
    
    app.SixObjects = function(elem, tags, scope){
        var self = this;
        components.ui.states.UIStateBehavior.call(self);
        var box = tags['box'];
        
        
        self.stateActive = function(){
            
            window.box = new BoxInterface(box);
        };
        
        self.prepareToDeactivate = function(){
            delete window.box;
            return new BASE.async.Future.fromResult(null);
        };
        
    };
});