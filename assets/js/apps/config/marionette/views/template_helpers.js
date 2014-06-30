_.extend(Marionette.View.prototype, {
  templateHelpers: {
    i18nUrl: function(url){
      return ContactManager.i18n.currentLanguage + "/" + url;
    }
  }
});
