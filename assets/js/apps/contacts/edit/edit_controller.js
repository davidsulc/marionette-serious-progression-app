ContactManager.module("ContactsApp.Edit", function(Edit, ContactManager, Backbone, Marionette, $, _){
  Edit.Controller = {
    editContact: function(id){
      var loadingView = new ContactManager.Common.Views.Loading();
      ContactManager.mainRegion.show(loadingView);

      var fetchingContact = ContactManager.request("contact:entity", id);
      $.when(fetchingContact).done(function(contact){
        var view = new Edit.Contact({
          model: contact,
          generateTitle: true
        });

        view.on("form:submit", function(data){
          var savingContact = contact.save(data);
          if(savingContact){
            $.when(savingContact).done(function(){
              ContactManager.trigger("contact:show", contact.get("id"));
            }).fail(function(response){
              if(response.status === 422){
                view.triggerMethod("form:data:invalid", response.responseJSON.errors);
              }
              else{
                alert("An unprocessed error happened. Please try again!");
              }
            });
          }
          else{
            view.triggerMethod("form:data:invalid", contact.validationError);
          }
        });

        ContactManager.mainRegion.show(view);
      }).fail(function(response){
        if(response.status === 404){
          var view = new ContactManager.ContactsApp.Show.MissingContact();
          ContactManager.mainRegion.show(view);
        }
        else{
          alert("An unprocessed error happened. Please try again!");
        }
      });
    }
  };
});
