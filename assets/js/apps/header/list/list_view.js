ContactManager.module("HeaderApp.List", function(List, ContactManager, Backbone, Marionette, $, _){
  List.Header = Marionette.ItemView.extend({
    template: "#header-link",
    tagName: "li",

    events: {
      "click a": "navigate"
    }
  });

  _.extend(List.Header.prototype, {
    navigate: function(e){
      e.preventDefault();
      this.trigger("navigate", this.model);
    },

    onRender: function(){
      if(this.model.selected){
        // add class so Bootstrap will highlight the active entry in the navbar
        this.$el.addClass("active");
      };
    }
  });

  List.Headers = Marionette.CompositeView.extend({
    template: "#header-template",
    className: "navbar navbar-inverse navbar-fixed-top",
    itemView: List.Header,
    itemViewContainer: "ul",

    events: {
      "click a.brand": "brandClicked",
      "change .js-change-language": "changeLanguage"
    }
  });

  _.extend(List.Headers.prototype, {
    brandClicked: function(e){
      e.preventDefault();
      this.trigger("brand:clicked");
    },

    changeLanguage: function(e){
      e.preventDefault();
      var lang = $(e.target).val();
      this.trigger("language:change", lang);
    }
  });
});
