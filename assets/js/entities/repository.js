ContactManager.module("Entities", function(Entities, ContactManager, Backbone, Marionette, $, _){
  Entities.Repository = Backbone.Model.extend({
    initialize: function(){
      this.username = "USERNAME";
      this.password = "PASSWORD";

      var self = this;
      this.on("sync", function(){
        self.set({githubName: self.get("name")}, {silent:true});
      });
    },

    urlRoot: "https://api.github.com",
    url: function(){
      return _.result(this, "urlRoot") + "/repos/" + this.username + "/" + (this.get("githubName") || this.get("name"));
    },

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
      var self = this,
          config = {
            beforeSend: function (xhr) {
              xhr.setRequestHeader ("Authorization", "Basic " + btoa(self.username + ":" + self.password));
            }
          };

      switch(method){
        case "create":
          config = _.extend(config, {
            method: "POST",
            url: _.result(this, "urlRoot") + "/user/repos",
            data: JSON.stringify(model.pick("name", "description", "homepage",
              "private", "has_issues", "has_wiki", "has_downloads", "team_id",
              "auto_init", "gitignore_template"
            ))
          });
          break;

        case "read":
          config = _.extend(config, {
            method: "GET"
          });
          break;

        case "update":
          config = _.extend(config, {
            method: "PATCH",
            data: JSON.stringify(model.pick("name", "description", "homepage", "private",
              "has_issues", "has_wiki", "has_downloads", "default_branch"
            ))
          });
          break;

        case "delete":
          config = _.extend(config, {
            method: "DELETE"
          });
          break;
      };

      // add API call configuration to the `options` object
      options = _.extend(options, config);

      return Backbone.Model.prototype.sync.call(this, method, model, options);
    }
  });
});
