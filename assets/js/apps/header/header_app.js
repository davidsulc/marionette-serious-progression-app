ContactManager.module("HeaderApp", function(Header, ContactManager, Backbone, Marionette, $, _){
  var API = {
    listHeader: function(){
      Header.List.Controller.listHeader();
    }
  };

  ContactManager.commands.setHandler("set:active:header", function(name){
    ContactManager.HeaderApp.List.Controller.setActiveHeader(name);
  });

  this.listenTo(Header, "start", function(){
    API.listHeader();
  });

  this.listenTo(ContactManager, "language:changed", function(){
    API.listHeader();
  });
});
