ContactManager.Behaviors = {
  Confirmable: Marionette.Behavior.extend({
    defaults: {
      message: function(){ return t("generic.confirmationMessage"); }
    },
    events: {
      "click .js-behavior-confirmable": "confirmAction"
    },

    confirmAction: function() {
      var message = this.options.message;
      if(typeof(this.options.message) === "function"){
        message = this.options.message(this.view);
      }
      if(confirm(message)){
        this.view.trigger(this.options.event, { model: this.view.model });
        if(this.options.callback){
          this.options.callback();
        }
      }
    }
  })
};

Marionette.Behaviors.behaviorsLookup = function(){
  return ContactManager.Behaviors;
}
