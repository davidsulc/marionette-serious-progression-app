ContactManager.module("ContactsApp.Edit", function(Edit, ContactManager, Backbone, Marionette, $, _){
  var Controller = Marionette.Controller.extend({
    editContact: function(id){
      var loadingView = new ContactManager.Common.Views.Loading();
      ContactManager.mainRegion.show(loadingView);

      var fetchingContact = ContactManager.request("contact:entity", id);
      $.when(fetchingContact).done(function(contact){
        var view = new Edit.Contact({
          model: contact,
          generateTitle: true
        });

        Edit.Controller.listenTo(view, "form:submit", function(data){
          contact.set(data, {silent: true});
          var savingContact = contact.save(data, {wait: true});
          if(savingContact){
            view.onBeforeClose = function(){
              contact.set({changedOnServer: false});
            };
            $.when(savingContact).done(function(){
              ContactManager.trigger("contact:show", contact.get("id"));
            }).fail(function(response){
              if(response.status === 422){
                var keys = ['firstName', 'lastName', 'phoneNumber'];
                contact.refresh(response.responseJSON.entity, keys);

                view.render();
                view.triggerMethod("form:data:invalid", response.responseJSON.errors);
                contact.set(response.responseJSON.entity, {silent:true});
              }
              else{
                alert(t("generic.unprocessedError"));
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
          alert(t("generic.unprocessedError"));
        }
      });
    }
  });

  Edit.Controller = new Controller();

  Edit.Controller.listenTo(ContactManager.ContactsApp, "stop", function(){
    Edit.Controller.close();
  });
});
