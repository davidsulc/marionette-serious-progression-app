ContactManager.module("ContactsApp.Show", function(Show, ContactManager, Backbone, Marionette, $, _){
  Show.MissingContact = Marionette.ItemView.extend({
    template: "#missing-contact-view"
  });

  Show.Contact = Marionette.ItemView.extend({
    template: "#contact-view",

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
});
