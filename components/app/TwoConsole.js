BASE.require([
  "jQuery",
  "components.ui.states.UIStateBehavior"
], function(){
  BASE.namespace("app");

  app.TwoConsole = function(elem, tags, scope){
    var self = this;
    components.ui.states.UIStateBehavior.call(self);

    self.stateActive = function(){
      console.log("/*****************************************/");
      console.log("/*                                       */");
      console.log("/* Hey! Over here!  This is the console! */");
      console.log("/* If you can see me, type \"hi()\" and    */");
      console.log("/* press enter.                          */");
      console.log("/*                                       */");
      console.log("/*****************************************/");

      window.hi = function(){
        self.stateManager.replace("console-2");
      };

    };

    self.prepareToDeactivate = function(){
      delete window.hi;
      return new BASE.async.Future.fromResult();
    };

  };


});
