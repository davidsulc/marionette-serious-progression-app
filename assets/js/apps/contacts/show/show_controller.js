ContactManager.module("ContactsApp.Show", function(Show, ContactManager, Backbone, Marionette, $, _){
  var Controller = Marionette.Controller.extend({
    showContact: function(id){
      var loadingView = new ContactManager.Common.Views.Loading();
      ContactManager.mainRegion.show(loadingView);

      var fetchingContact = ContactManager.request("contact:entity", id, {
        error: function(xhr, responseText, error){
          console.log("Some error happened (processed in error callback)");
        }
      });
      $.when(fetchingContact).done(function(contact){
        var contactView = new Show.Contact({
          model: contact
        });

        Show.Controller.listenTo(contactView, "contact:edit", function(contact){
          ContactManager.trigger("contact:edit", contact.get("id"));
        });

        ContactManager.mainRegion.show(contactView);
      }).fail(function(response){
        console.log("Some error happened (processed in deferred's fail callback)");
        if(response.status === 404){
          var contactView = new Show.MissingContact();
          ContactManager.mainRegion.show(contactView);
        }
        else{
          alert(t("generic.unprocessedError"));
        }
      });
    }
  });

  Show.Controller = new Controller();

  Show.Controller.listenTo(ContactManager.ContactsApp, "stop", function(){
    Show.Controller.close();
  });
});
