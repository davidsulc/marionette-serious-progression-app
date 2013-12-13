ContactManager.module("Entities", function(Entities, ContactManager, Backbone, Marionette, $, _){
  Entities.Repository = Backbone.Model.extend({
    validate: function(attrs, options) {
      var errors = {}
      if (! attrs.name) {
        errors.name = "can't be blank";
      }
      if( ! _.isEmpty(errors)){
        return errors;
      }
    },

    sync: function(method, model, options){
      var username = "USERNAME",
          password = "PASSWORD",
          baseUrl = "https://api.github.com",
          config = {
            beforeSend: function (xhr) {
              xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
            }
          };

      switch(method){
        case "create":
          config = _.extend(config, {
            method: "POST",
            url: baseUrl + "/user/repos",
            data: JSON.stringify(model.pick("name", "description", "homepage",
              "private", "has_issues", "has_wiki", "has_downloads", "team_id",
              "auto_init", "gitignore_template"
            ))
          });
          break;

        case "read":
          config = _.extend(config, {
            method: "GET",
            url: baseUrl + "/repos/" + username + "/" + model.get("name")
          });
          break;

        case "update":
          break;

        case "delete":
          config = _.extend(config, {
            method: "DELETE",
            url:  baseUrl + "/repos/" + username + "/" + model.get("name")
          });
          break;
      };

      // add API call configuration to the `options` object
      options = _.extend(options, config);

      return Backbone.Model.prototype.sync.call(this, method, model, options);
    }
  });
});
