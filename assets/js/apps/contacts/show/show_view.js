ContactManager.module("ContactsApp.Show", function(Show, ContactManager, Backbone, Marionette, $, _){
  Show.MissingContact = Marionette.ItemView.extend({
    template: "#missing-contact-view"
  });

  Show.Contact = Marionette.LayoutView.extend({
    template: "#contact-view",

    regions: {
      acquaintancesRegion: "#acquaintances-region",
      strangersRegion: "#strangers-region"
    },

    events: {
      "click a.js-edit": "editClicked"
    },

    onShow: function(){
      var contact = this.model;
      var acquaintances = contact.get("acquaintances");
      var strangers = contact.get("strangers");

      var acquaintancesView = new ContactManager.Common.Views.PaginatedView({
        collection: acquaintances,
        mainView: Show.Acquaintances,
        propagatedEvents: ["childview:acquaintance:remove"]
      });

      var strangersView = new ContactManager.Common.Views.PaginatedView({
        collection: strangers,
        mainView: Show.Strangers,
        propagatedEvents: ["childview:acquaintance:add"]
      });

      this.listenTo(acquaintancesView, "childview:acquaintance:remove", function(view, args){
        contact.get("acquaintances").remove(args.model);
      });
      this.listenTo(strangersView, "childview:acquaintance:add", function(view, args){
        contact.get("acquaintances").add(args.model);
      });

      var acquaintancesFetched = contact.get("acquaintances").fetch({silent: true}),
          strangersFetched = contact.get("strangers").fetch({silent: true});
      var self = this;
      $.when(acquaintancesFetched, strangersFetched).done(function(){
        self.acquaintancesRegion.show(acquaintancesView);
        self.strangersRegion.show(strangersView);
      });
    }
  });

  _.extend(Show.Contact.prototype, {
    editClicked: function(e){
      e.preventDefault();
      this.trigger("contact:edit", this.model);
    }
  });

  Show.Acquaintance = Marionette.ItemView.extend({
    tagName: "li",
    template: "#contact-acquaintance-view",

    behaviors: {
      Confirmable: {
        event: "acquaintance:remove"
      }
    }
  });

  Show.Acquaintances = Marionette.CollectionView.extend({
    tagName: "ul",
    childView: Show.Acquaintance
  });

  Show.Stranger = Marionette.ItemView.extend({
    tagName: "li",
    template: "#contact-stranger-view",

    behaviors: {
      Confirmable: {
        event: "acquaintance:add",
        message: function(view){
          return "Add " + view.model.get("firstName") + " as an acquaintance?";
        }
      }
    }
  });

  Show.Strangers = Marionette.CollectionView.extend({
    tagName: "ul",
    childView: Show.Stranger
  });
});
