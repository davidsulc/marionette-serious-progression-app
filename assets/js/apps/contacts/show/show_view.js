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
    triggers: {
      "click .js-remove-acquaintance": "acquaintance:remove"
    }
  });

  Show.Acquaintances = Marionette.CollectionView.extend({
    tagName: "ul",
    childView: Show.Acquaintance
  });

  Show.Stranger = Marionette.ItemView.extend({
    tagName: "li",
    template: "#contact-stranger-view",
    triggers: {
      "click .js-add-acquaintance": "acquaintance:add"
    }
  });

  Show.Strangers = Marionette.CollectionView.extend({
    tagName: "ul",
    childView: Show.Stranger
  });
});
