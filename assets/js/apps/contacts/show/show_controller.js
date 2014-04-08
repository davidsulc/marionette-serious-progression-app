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
        var acquaintancesFetched = contact.get("acquaintances").fetch(),
            strangersFetched = contact.get("strangers").fetch();
        $.when(acquaintancesFetched, strangersFetched).done(function(){
          var contactView = new Show.Contact({
            model: contact
          });

          Show.Controller.listenTo(contactView, "show", function(){
            var acquaintances = contact.get("acquaintances");
            var strangers = contact.get("strangers");

            var acquaintancesUrl = _.result(contact, "url") + "/acquaintances/";
            contact.listenTo(acquaintances, "add", function(model){
              $.ajax({
                url: acquaintancesUrl + model.get("id"),
                type: "POST",
                dataType: "json",
                success: function(){
                  contact.get("strangers").remove(model);
                }
              });
            });
            contact.listenTo(acquaintances, "remove", function(model){
              $.ajax({
                url: acquaintancesUrl + model.get("id"),
                type: "DELETE",
                dataType: "json",
                success: function(){
                  contact.get("strangers").add(model);
                }
              });
            });

            var acquaintancesView = new ContactManager.Common.Views.PaginatedView({
              collection: acquaintances,
              mainView: Show.Acquaintances,
              propagatedEvents: ["itemview:acquaintance:remove"]
            });

            var strangersView = new ContactManager.Common.Views.PaginatedView({
              collection: strangers,
              mainView: Show.Strangers,
              propagatedEvents: ["itemview:acquaintance:add"]
            });

            Show.Controller.listenTo(acquaintancesView, "itemview:acquaintance:remove", function(view, args){
              contact.get("acquaintances").remove(args.model);
            });
            Show.Controller.listenTo(strangersView, "itemview:acquaintance:add", function(view, args){
              contact.get("acquaintances").add(args.model);
            });

            contactView.acquaintancesRegion.show(acquaintancesView);
            contactView.strangersRegion.show(strangersView);
          });

          Show.Controller.listenTo(contactView, "contact:edit", function(contact){
            ContactManager.trigger("contact:edit", contact.get("id"));
          });

          ContactManager.mainRegion.show(contactView);
        });
      }).fail(function(response){
        console.log("Some error happened (processed in deferred's fail callback)");
        if(response.status === 404){
          var contactView = new Show.MissingContact();
          ContactManager.mainRegion.show(contactView);
        }
        else{
          alert("An unprocessed error happened. Please try again!");
        }
      });
    }
  });

  Show.Controller = new Controller();

  Show.Controller.listenTo(ContactManager.ContactsApp, "stop", function(){
    Show.Controller.close();
  });
});
