BASE.require([
    "jQuery",
    "components.ui.states.UIStateBehavior"
], function(){
    BASE.namespace("app")
    
    app.TEMPLATE = function(elem, tags, scope){
        var self = this;
        components.ui.states.UIStateBehavior.call(self);
        
        
        
    };
});