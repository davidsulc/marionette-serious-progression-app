var ContactManager = new Marionette.Application();

ContactManager.navigate = function(route,  options){
  options || (options = {});
  route = ContactManager.i18n.currentLanguage + "/" + route;
  Backbone.history.navigate(route, options);
};

ContactManager.getCurrentRoute = function(){
  return Backbone.history.fragment
};

ContactManager.startSubApp = function(appName, args){
  var currentApp = ContactManager.module(appName);
  if (ContactManager.currentApp === currentApp){ return; }

  if (ContactManager.currentApp){
   ContactManager.currentApp.stop();
  }

  ContactManager.currentApp = currentApp;
  currentApp.start(args);
};

ContactManager.reqres.setHandler("language:change", function(lang){
  var defer = $.Deferred(),
      currentRoute = ContactManager.getCurrentRoute().split("/").slice(1).join("/");
  if(ContactManager.i18n.acceptedLanguages.indexOf(lang) > -1){
    if(ContactManager.i18n.currentLanguage !== lang){
      var translationFetched = $.get("languages/" + lang);
      $.when(translationFetched).done(function(translation){
        polyglot.extend(translation);
        ContactManager.i18n.currentLanguage = lang;
        ContactManager.trigger("language:changed");
        ContactManager.navigate(currentRoute, {trigger: true})
        defer.resolve();
      }).fail(function(){
        defer.reject();
        alert(t("contact").generic.unprocessedError);
      });
    }
    else{
      defer.resolve();
    }
  }
  else{
    defer.reject();
    ContactManager.navigate(currentRoute);
  }
  return defer.promise();
});

ContactManager.on("before:start", function(options){
  options || (options = {});
  ContactManager.i18n = {
    acceptedLanguages: options.acceptedLanguages || [],
    currentLanguage: "en"
  };

  _.templateSettings = {
    interpolate: /\{\{=(.+?)\}\}/g,
    escape: /\{\{-(.+?)\}\}/g,
    evaluate: /\{\{(.+?)\}\}/g
  };

  var RegionContainer = Marionette.LayoutView.extend({
    el: "#app-container",

    regions: {
      header: "#header-region",
      main: "#main-region",
      dialog: "#dialog-region"
    }
  });

  ContactManager.regions = new RegionContainer();
  ContactManager.regions.dialog.onShow = function(view){
    var self = this;
    var closeDialog = function(){
      self.stopListening();
      self.empty();
      self.$el.dialog("destroy");
    };

    this.listenTo(view, "dialog:close", closeDialog);

    var configureDialog = function(){
      self.$el.dialog({
        modal: true,
        title: view.title,
        width: "auto",
        position: "center",
        close: function(e, ui){
          closeDialog();
        }
      });
    };
    configureDialog();

    this.listenTo(view, "render", configureDialog);
  };
});

ContactManager.on("start", function(){
  if(Backbone.history){
    Backbone.history.start();

    if(this.getCurrentRoute() === ""){
      ContactManager.trigger("contacts:list");
    }
  }
});
