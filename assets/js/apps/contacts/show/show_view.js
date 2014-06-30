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
      var acquaintancesView = new ContactManager.Common.Views.PaginatedView({
        collection: this.model.get("acquaintances"),
        mainView: Show.Acquaintances,
        propagatedEvents: ["childview:acquaintance:remove"]
      });
      this.listenTo(acquaintancesView, "page:change", function(page){
        this.model.get("acquaintances").parameters.set("page", page);
      });

      var strangersView = new ContactManager.Common.Views.PaginatedView({
        collection: this.model.get("strangers"),
        mainView: Show.Strangers,
        propagatedEvents: ["childview:acquaintance:add"]
      });
      var contact = this.model;
      this.listenTo(strangersView, "page:change", function(page){
        contact.get("strangers").parameters.set("page", page);
      });

      Show.Controller.listenTo(acquaintancesView, "childview:acquaintance:remove", function(view, args){
        contact.get("acquaintances").remove(args.model);
      });
      Show.Controller.listenTo(strangersView, "childview:acquaintance:add", function(view, args){
        contact.get("acquaintances").add(args.model);
      });

      this.acquaintancesRegion.show(acquaintancesView);
      this.strangersRegion.show(strangersView);
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
          return t("acquaintance.addConfirmation", { firstName: view.model.get("firstName") });
        }
      }
    }
  });

  Show.Strangers = Marionette.CollectionView.extend({
    tagName: "ul",
    childView: Show.Stranger
  });
});
