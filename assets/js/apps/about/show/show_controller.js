ContactManager.module("AboutApp.Show", function(Show, ContactManager, Backbone, Marionette, $, _){
  var Controller = Marionette.Controller.extend({
    showAbout: function(){
      var view = new Show.Message();
      ContactManager.mainRegion.show(view);
    }
  });

  Show.Controller = new Controller();

  Show.Controller.listenTo(ContactManager.AboutApp, "stop", function(){
    Show.Controller.close();
  });
});
