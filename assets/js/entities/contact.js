ContactManager.module("Entities", function(Entities, ContactManager, Backbone, Marionette, $, _){
  Entities.Contact = Entities.BaseModel.extend({
    urlRoot: "contacts",

    initialize: function(){
      this.on("change", function(){
        this.set("fullName", this.get("firstName") + " " + this.get("lastName"));
      });
    },

    defaults: {
      firstName: "",
      lastName: "",
      phoneNumber: "",

      changedOnServer: false
    },

    parse: function(response){
      var data = response;
      if(response && response.contact){
        data = response.contact;
      }
      data.fullName = data.firstName + " ";
      data.fullName += data.lastName;
      return data;
    },

    validation: {
      firstName: {
        required: true
      },

      lastName: {
        required: true,
        minLength: 2
      }
    },

    sync: function(method, model, options){
      console.log("Contact's sync function called.");

      return Entities.BaseModel.prototype.sync.call(this, method, model, options);
    }
  });

  _.extend(Entities.Contact.prototype, Backbone.Validation.mixin);

  Entities.ContactCollection = Backbone.PageableCollection.extend({
    mode: "client",
    url: "contacts",
    model: Entities.Contact,
    comparator: "firstName",

    initialize: function(models, options){
      options || (options = {});
      var params = options.parameters || { page: 1 };
      this.parameters = new Backbone.Model(params);
      var self = this;
      this.listenTo(this.parameters, "change:page", function(params){
        Backbone.$.when(self.getPage(parseInt(self.parameters.get("page"), 10))).then(function(){
          self.trigger("page:change:after");
        });
      });
    },

    state: {
      firstPage: 1,
      currentPage: 1,
      pageSize: 10
    }
  });

  var API = {
    getContactEntities: function(options){
      var contacts = new Entities.ContactCollection();
      var defer = $.Deferred();
      options || (options = {});
      defer.then(options.success, options.error);
      var response = contacts.fetch(_.omit(options, 'success', 'error'));
      response.done(function(){
        defer.resolveWith(response, [contacts]);
      });
      response.fail(function(){
        defer.rejectWith(response, arguments);
      });
      return defer.promise();
    },

    getContactEntity: function(contactId, options){
      var contact = new Entities.Contact({id: contactId});
      var defer = $.Deferred();
      options || (options = {});
      defer.then(options.success, options.error);
      var response = contact.fetch(_.omit(options, 'success', 'error'));
      response.done(function(){
        defer.resolveWith(response, [contact]);
      });
      response.fail(function(){
        defer.rejectWith(response, arguments);
      });
      return defer.promise();
    }
  };

  ContactManager.reqres.setHandler("contact:entities", function(options){
    return API.getContactEntities(options);
  });

  ContactManager.reqres.setHandler("contact:entity", function(id, options){
    return API.getContactEntity(id, options);
  });
});
