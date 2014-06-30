ContactManager.module("HeaderApp.List", function(List, ContactManager, Backbone, Marionette, $, _){
  var Controller = Marionette.Controller.extend({
    listHeader: function(){
      var links = ContactManager.request("header:entities");
      var headers = new List.Headers({collection: links});

      this.listenTo(headers, "brand:clicked", function(){
        ContactManager.trigger("contacts:list");
      });

      this.listenTo(headers, "itemview:navigate", function(childView, model){
        var trigger = model.get("navigationTrigger");
        ContactManager.trigger(trigger);
      });

      this.listenTo(headers, "language:change", function(lang){
        ContactManager.request("language:change", lang);
      });

      ContactManager.headerRegion.show(headers);
    },

    setActiveHeader: function(headerUrl){
      var links = ContactManager.request("header:entities");
      var headerToSelect = links.find(function(header){ return header.get("url") === headerUrl; });
      headerToSelect.select();
      links.trigger("reset");
    }
  });

  List.Controller = new Controller();
});
