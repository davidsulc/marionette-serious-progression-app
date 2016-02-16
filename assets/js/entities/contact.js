ContactManager.module("Entities", function(Entities, ContactManager, Backbone, Marionette, $, _){
  Entities.Contact = Backbone.AssociatedModel.extend({
    urlRoot: "contacts_paginated",

    relations: [
      {
        type: Backbone.Many,
        key: "acquaintances",
        collectionType: "ContactManager.Entities.ContactCollection"
      },
      {
        type: Backbone.Many,
        key: "strangers",
        collectionType: "ContactManager.Entities.ContactCollection"
      }
    ],

    initialize: function(options){
      options || (options = {});

      if(options.configureRelationships){
        this.set("acquaintances", new Entities.ContactCollection());
        this.get("acquaintances").url = this.url() + "/acquaintances?";

        this.set("strangers", new Entities.ContactCollection());
        this.get("strangers").url = this.url() + "/strangers?";

        var self = this;
        this.listenTo(this.get("acquaintances"), "add", function(model){
          $.ajax({
            url: this.url() + "/acquaintances/add/" + model.get("id"),
            type: "POST",
            dataType: "json",
            success: function(){
              self.get("strangers").remove(model);
            },
            error: function(){
              self.get("acquaintances").remove(model);
            }
          });
        });
        this.listenTo(this.get("acquaintances"), "remove", function(model){
          $.ajax({
            url: this.url() + "/acquaintances/remove/" + model.get("id"),
            type: "DELETE",
            dataType: "json",
            success: function(){
              self.get("strangers").add(model);
            },
            error: function(){
              self.get("acquaintances").add(model);
            }
          });
        });
      };

      this.on("change", function(){
        this.set("fullName", this.get("firstName") + " " + this.get("lastName"));
      });
    },

    defaults: {
      firstName: "",
      lastName: "",
      phoneNumber: "",

      acquaintances: [],
      strangers: [],
      changedOnServer: false
    }
  });

  _.extend(Entities.Contact.prototype, Backbone.Validation.mixin, {
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
    mode: "server",
    url: "contacts_paginated?",
    model: Entities.Contact,
    comparator: "firstName",

    initialize: function(models, options){
      options || (options = {});
      var params = options.parameters || { page: 1 };
      this.parameters = new Backbone.Model(params);
      var self = this;
      this.listenTo(this.parameters, "change:page", function(params){
        self.getPage(parseInt(self.parameters.get("page"), 10));
      });
      this.listenTo(this.parameters, "change:criterion", function(params){
        self.getPage(1);
      });

      this.on("sync", function(){
        this.trigger("page:change:after");
        this.sort({silent: true});
        this.trigger("reset");
      });
    },

    state: {
      firstPage: 1,
      currentPage: 1,
      pageSize: 10
    },
    queryParams: {
      count: function() { return this.state.pageSize },
      offset: function() { return (this.state.currentPage - 1) * this.state.pageSize },
      filter: function() { return this.parameters.get("criterion"); }
    }
  });

  _.extend(Entities.ContactCollection.prototype, {
    parseState: function (response) {
      return { totalRecords: response.resultCount };
    },
    parseRecords: function (response) {
      return response.results;
    }
  });

  var API = {
    getContactEntities: function(options){
      var contacts = new Entities.ContactCollection([], options);
      delete options.parameters;
      var defer = $.Deferred();
      options || (options = {});
      defer.then(options.success, options.error);
      var response = contacts.getPage(contacts.parameters.get("page"), _.omit(options, 'success', 'error'));
      response.done(function(){
        defer.resolveWith(response, [contacts]);
      });
      response.fail(function(){
        defer.rejectWith(response, arguments);
      });
      return defer.promise();
    },

    getContactEntity: function(contactId, options){
      var contact = new Entities.Contact({
        id: contactId,
        configureRelationships: true
      });
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
