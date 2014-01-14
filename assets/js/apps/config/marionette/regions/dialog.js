Marionette.Region.Dialog = Marionette.Region.extend({
  onShow: function(view){
    this.listenTo(view, "dialog:close", this.closeDialog);

    var self = this;
    var configureDialog = function(){
      self.$el.dialog({
        modal: true,
        title: view.title,
        width: "auto",
        position: "center",
        close: function(e, ui){
          self.closeDialog();
        }
      });
    };
    configureDialog();

    this.listenTo(view, "render", configureDialog);
  },

  closeDialog: function(){
    this.stopListening();
    this.close();
    this.$el.dialog("destroy");
  }
});
