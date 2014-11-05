BASE.require([
  "jQuery",
  "components.ui.states.UIStateBehavior"
], function(){
  BASE.namespace("app");

  app.TwoConsole = function(elem, tags, scope){
    var self = this;
    components.ui.states.UIStateBehavior.call(self);
    var slider = $(tags['slider']).controller();
    var $next = $(tags['next']);

    var sliderStates = ["two", "three"];

    self.stateActive = function(){
      console.log("/*****************************************/");
      console.log("/*                                       */");
      console.log("/* Hey! Over here!  This is the console! */");
      console.log("/* If you can see me, type               */");
      console.log("/* hi()                                  */");
      console.log("/* here in the console and               */");
      console.log("/* press enter/return.                   */");
      console.log("/*                                       */");
      console.log("/*****************************************/");

      window.hi = function(){
        console.log("Good job! Now, look back at the main window.");
        self.stateManager.data.app.next();
      };

    };

    self.prepareToDeactivate = function(){
      delete window.hi;
      return new BASE.async.Future.fromResult();
    };

    $next.on("click", function(){
      slider.replace(sliderStates.shift());
      if (sliderStates.length === 0) {
        $next.addClass("hide");
      }
    });

  };


});
