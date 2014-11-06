BASE.require([
  "jQuery"
], function(){
  BASE.namespace("app");

  app.AppMain = function(elem, tags, scope){
    var self = this;
    var stateManager = $(tags['state-manager']).controller();

    var back = [];
    var forward = ["console", "console-2", "variables", "objects", "objects-2"];
    var currentState = "welcome";
    
    stateManager.data.app = self;
    self.stateManager = stateManager;
    
    self.next = function(){
        var nextState = forward.shift();
        back.unshift(currentState);
        stateManager.replace(nextState);
        currentState = nextState;
    };
    
    self.previous = function(){
        var lastState = back.shift();
        forward.unshift(currentState);
        stateManager.replace(lastState);
        currentState = lastState;
    };
    
    
    window.tut = self;
    
  };

});
