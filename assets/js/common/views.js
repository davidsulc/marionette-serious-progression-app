ContactManager.module("Common.Views", function(Views, ContactManager, Backbone, Marionette, $, _){
  Views.Loading = Marionette.ItemView.extend({
    template: "#loading-view"
  });

  _.extend(Views.Loading.prototype, {
    title: t("loading.title"),
    message: t("loading.message"),

    serializeData: function(){
      return {
        title: Marionette.getOption(this, "title"),
        message: Marionette.getOption(this, "message")
      }
    },

    onShow: function(){
      var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: "#000", // #rgb or #rrggbb
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: "spinner", // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: "30px", // Top position relative to parent in px
        left: "auto" // Left position relative to parent in px
      };
      $("#spinner").spin(opts);
    }
  });

  Views.PaginationControls = Marionette.ItemView.extend({
    template: "#pagination-controls",
    className: "pagination",

    initialize: function(options){
      this.paginatedCollection = options.paginatedCollection;
      this.urlBase = options.urlBase;
      this.listenTo(this.paginatedCollection, "page:change:after", this.render);
    },

    events: {
      "click a[class=navigatable]": "navigateToPage"
    }
  });

  _.extend(Views.PaginationControls.prototype, {
    navigateToPage: function(e){
      e.preventDefault();
      var page = parseInt($(e.target).data("page"), 10);
      this.paginatedCollection.parameters.set("page", page);
      this.trigger("page:change", page);
    },

    serializeData: function(){
      var data = this.paginatedCollection.info(),
          url = this.urlBase,
          criterion = this.paginatedCollection.parameters.get("criterion");
      if(url){
        if(criterion){
          url += "criterion:" + criterion + "+";
        }
        url += "page:";
      }
      data.urlBase = url;

      return data;
    }
  });

  Views.PaginatedView = Marionette.LayoutView.extend({
    template: "#paginated-view",

    regions: {
      paginationControlsRegion: ".js-pagination-controls",
      paginationMainRegion: ".js-pagination-main"
    },

    initialize: function(options){
      this.collection = options.collection;
      var eventsToPropagate = options.propagatedEvents || [];

      var controls = new Views.PaginationControls({
        paginatedCollection: this.collection,
        urlBase: options.paginatedUrlBase
      });
      var listView = new options.mainView({
        collection: this.collection
      });

      var self = this;
      this.listenTo(controls, "page:change", function(page){
        self.trigger("page:change", page);
      });
      _.each(eventsToPropagate, function(evt){
        self.listenTo(listView, evt, function(view, model){
          self.trigger(evt, view, model);
        });
      });

      this.on("show", function(){
        this.paginationControlsRegion.show(controls);
        this.paginationMainRegion.show(listView);
      });
    }
  });
});
