ContactManager.module("ContactsApp", function(ContactsApp, ContactManager, Backbone, Marionette, $, _){
  ContactsApp.Router = Marionette.AppRouter.extend({
    appRoutes: {
      "contacts(/filter/:params)": "listContacts",
      "contacts/:id": "showContact",
      "contacts/:id/edit": "editContact"
    }
  });

  var parseParams = function(params){
    var options = {};
    if(params && params.trim() !== ''){
      params = params.split('+');
      _.each(params, function(param){
        var values = param.split(':');
        if(values[1]){
          if(values[0] === "page"){
            options[values[0]] = parseInt(values[1], 10);
          }
          else{
            options[values[0]] = values[1];
          }
        }
      });
    }
    _.defaults(options, { page: 1 });
    return options;
  };

  var serializeParams = function(options){
    options = _.pick(options, "criterion", "page");
    return (_.map(_.filter(_.pairs(options), function(pair){ return pair[1]; }), function(pair){ return pair.join(":"); })).join("+");
  };

  var API = {
    listContacts: function(params){
      var options = parseParams(params);
      ContactsApp.List.Controller.listContacts(options);
      ContactManager.execute("set:active:header", "contacts");
    },

    showContact: function(id){
      ContactsApp.Show.Controller.showContact(id);
      ContactManager.execute("set:active:header", "contacts");
    },

    editContact: function(id){
      ContactsApp.Edit.Controller.editContact(id);
      ContactManager.execute("set:active:header", "contacts");
    }
  };

  this.listenTo(ContactManager, "page:change", function(options){
    ContactManager.navigate("contacts/filter/" + serializeParams(options));
  });

  this.listenTo(ContactManager, "contacts:list", function(){
    ContactManager.navigate("contacts");
    API.listContacts();
  });

  this.listenTo(ContactManager, "contacts:filter", function(options){
    ContactManager.navigate("contacts/filter/" + serializeParams(options));
  });

  this.listenTo(ContactManager, "contact:show", function(id){
    ContactManager.navigate("contacts/" + id);
    API.showContact(id);
  });

  this.listenTo(ContactManager, "contact:edit", function(id){
    ContactManager.navigate("contacts/" + id + "/edit");
    API.editContact(id);
  });

  ContactsApp.on("start", function(){
    new ContactsApp.Router({
      controller: API
    });
  });
});
