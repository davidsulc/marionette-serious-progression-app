ContactManager.module("ContactsApp", function(ContactsApp, ContactManager, Backbone, Marionette, $, _){
  ContactsApp.startWithParent = false;

  ContactsApp.onStart = function(){
    console.log("starting contacts app");
  };

  ContactsApp.onStop = function(){
    console.log("stopping contacts app");
  };
});

ContactManager.module("Routers.ContactsApp", function(ContactsAppRouter, ContactManager, Backbone, Marionette, $, _){
  ContactsAppRouter.Router = Marionette.AppRouter.extend({
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
    return (_.map(_.filter(_.pairs(options), function(pair){ return pair[1]; }),
                            function(pair){ return pair.join(":"); })).join("+");
  };

  var executeAction = function(action, arg){
    ContactManager.startSubApp("ContactsApp");
    action(arg);
    ContactManager.execute("set:active:header", "contacts");
  };

  var API = {
    listContacts: function(params){
      var options = parseParams(params);
      executeAction(ContactManager.ContactsApp.List.Controller.listContacts, options);
    },

    showContact: function(id){
      executeAction(ContactManager.ContactsApp.Show.Controller.showContact, id);
    },

    editContact: function(id){
      executeAction(ContactManager.ContactsApp.Edit.Controller.editContact, id);
    }
  };

  this.listenTo(ContactManager, "page:change", function(options){
    ContactManager.navigate("contacts/filter/" + serializeParams(options));
  });

  this.listenTo(ContactManager, "contacts:list", function(){
    ContactManager.navigate("contacts");
    API.listContacts();
  });

  this.listenTo(ContactManager, "contact:show", function(id){
    ContactManager.navigate("contacts/" + id);
    API.showContact(id);
  });

  this.listenTo(ContactManager, "contact:edit", function(id){
    ContactManager.navigate("contacts/" + id + "/edit");
    API.editContact(id);
  });

  ContactManager.Routers.on("start", function(){
    new ContactsAppRouter.Router({
      controller: API
    });
  });
});
