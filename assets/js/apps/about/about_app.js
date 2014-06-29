ContactManager.module("AboutApp", function(AboutApp, ContactManager, Backbone, Marionette, $, _){
  AboutApp.startWithParent = false;

  AboutApp.onStart = function(){
    console.log("starting about app");
  };

  AboutApp.onStop = function(){
    console.log("stopping about app");
  };
});

ContactManager.module("Routers.AboutApp", function(AboutAppRouter, ContactManager, Backbone, Marionette, $, _){
  AboutAppRouter.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "about" : "showAbout"
    }
  });

  var API = {
    showAbout: function(){
      ContactManager.startSubApp("AboutApp");
      ContactManager.AboutApp.Show.Controller.showAbout();
      ContactManager.execute("set:active:header", "about");
    }
  };

  this.listenTo(ContactManager, "about:show", function(){
    ContactManager.navigate("about");
    API.showAbout();
  });

  ContactManager.Routers.on("start", function(){
    new AboutAppRouter.Router({
      controller: API
    });
  });
});
