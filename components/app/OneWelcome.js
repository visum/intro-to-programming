BASE.require([
  "jQuery",
  "components.ui.states.UIStateBehavior"
], function(){
  BASE.namespace("app");

  app.OneWelcome = function(elem, tags, scope){
    var self = this;
    components.ui.states.UIStateBehavior.call(self);

    var $button = $(tags['yes-button']);

    $button.on("click", function(){
      self.stateManager.replace("console");
    });

  };


});
