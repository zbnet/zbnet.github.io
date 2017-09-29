;( function ( $, window, document, options) {
    var pluginName = "znetTabNav",
        defaults = {};

    $.fn[pluginName] = function(options, callback){
        return this.each(function(){
            if(!$.data(this, "plugin_" + pluginName )){
                $.data(this, "plugin_" + pluginName,
                    new TabNav(this, options));
                $.removeData(this, "plugin_" + pluginName);
            }
        }, $.isFunction(callback) && callback.call(this));
    };

    function TabNav(navItems, options) {
        this.$navItems = $(navItems);
        var that = this;
        this.$navItems.show();
        this.$navItems.on('focus', function(){
            that.$navItems.css('clip', 'initial');
        });
        this.$navItems.on('blur', function(){
            that.$navItems.css('clip', 'rect(0 0 0 0)');
        });
    }

})(jQuery, window, document);