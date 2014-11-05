BASE.require([
    "jQuery",
    "components.ui.states.UIStateBehavior"
], function(){
    BASE.namespace("app")
    
    app.FiveObjects = function(elem, tags, scope){
        var self = this;
        components.ui.states.UIStateBehavior.call(self);
        
        
        self.stateActive = function(){
            window.teach = {name:"Smarty Pants", profession:"Teacher", secretMessage:"Hey, how did you find this?"};
            
        };
        
        self.prepareToDeactivate = function(){
            delete window.teach;
            return new BASE.async.Future.fromResult(null);
        };
        
    };
});