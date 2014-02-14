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

  Entities.ContactCollection = Backbone.Paginator.requestPager.extend({
    model: Entities.Contact,

    initialize: function(models, options){
      options || (options = {});
      var params = options.parameters || { page: 1 };
      this.parameters = new Backbone.Model(params);

      var self = this;
      this.listenTo(this.parameters, "change", function(model){
        if(_.has(model.changed, "criterion")){
          self.server_api.filter = self.parameters.get("criterion");
        }
        $.when(this.pager()).done(function(){
          self.trigger("page:change:after");
        });
      });

      this.on("sync", function(){
        this.sort({silent: true});
        this.trigger("reset");
      });
    },

    comparator: "firstName",
    paginator_core: {
      dataType: "json",
      url: "contacts_paginated?"
    },
    paginator_ui: {
      firstPage: 1,
      currentPage: 1,
      perPage: 10,
      pagesInRange: 2
    },
    server_api: {
      count: function() { return this.perPage },
      offset: function() { return ((this.parameters.get("page") || 1) - 1) * this.perPage },
      filter: function() { return this.parameters.get("criterion"); }
    },
    parse: function (response) {
      var data = response.results;
      this.totalRecords = response.resultCount;
      this.totalPages = Math.ceil(this.totalRecords / this.perPage);
      this.currentPage = this.parameters.get("page");
      return data;
    }
  });

  var API = {
    getContactEntities: function(options){
      var contacts = new Entities.ContactCollection([], { parameters: options.parameters });
      delete options.parameters;
      var defer = $.Deferred();
      options || (options = {});
      // for paginator, see https://github.com/backbone-paginator/backbone.paginator/pull/180
      options.reset = true;
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
