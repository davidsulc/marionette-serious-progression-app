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
        var self = this,
            acquaintances = this.get("acquaintances"),
            acquaintancesUrl = _.result(this, "url") + "/acquaintances";

        acquaintances.paginator_core.url = acquaintancesUrl + "?";
        acquaintancesUrl = acquaintancesUrl + "/";
        this.listenTo(acquaintances, "add", function(model){
          $.ajax({
            url: acquaintancesUrl + model.get("id"),
            type: "POST",
            dataType: "json",
            success: function(){
              self.get("strangers").remove(model);
            },
            error: function(){
              acquaintances.remove(model);
            }
          });
        });
        this.listenTo(acquaintances, "remove", function(model){
          $.ajax({
            url: acquaintancesUrl + model.get("id"),
            type: "DELETE",
            dataType: "json",
            success: function(){
              self.get("strangers").add(model);
            },
            error: function(){
              acquaintances.add(model);
            }
          });
        });


        this.get("strangers").paginator_core.url = function(){
          return _.result(self, "url") + "/strangers?";
        };
      }

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

  Entities.ContactCollection = Backbone.Paginator.requestPager.extend({
    model: Entities.Contact,

    initialize: function(models, options){
      options || (options = {});

      var params = options.parameters || { page: 1 };
      this.parameters = new Backbone.Model(params);

      this.paginator_core = {
        dataType: "json",
        url: "contacts_paginated?"
      };
      this.paginator_ui = {
        firstPage: 1,
        currentPage: 1,
        perPage: 10,
        pagesInRange: 2
      };
      this.server_api = {
        count: function() { return this.perPage },
        offset: function() { return ((this.parameters.get("page") || 1) - 1) * this.perPage },
        filter: function() { return this.parameters.get("criterion"); }
      };

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

    comparator: "firstName"
  });

  _.extend(Entities.ContactCollection.prototype, {
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
