/*
 * Sets up footnotes for znet
 */

;( function ( $, window, document, undefined) {
    var pluginName = "znetFirstPage",
        defaults = {
            extraPadding : 20,
        };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new FirstPage($(this), options, callback));
            });
        }
    };
    
    function FirstPage($firstPage, options, callback) {
        this.options = $.extend({}, defaults, options);
        this.$firstPage = $firstPage;
        this.callback = callback;
        
        this.init();
        this.setup();
        this.doCallback();
        this.resizeCheck();
    }
    
    /**
     * Initialize the Footnote object variables 
     */
    FirstPage.prototype.init = function() {
    };
    
    FirstPage.prototype.setup = function() {
        var $window = $(window);
        var windowHeight = $window.height();
        var windowWidth = $window.width();
        var firstPageHeight = this.$firstPage.height();
        var firstPageMargin = ((windowHeight-firstPageHeight)/2) + this.options.extraPadding;
        
        this.$firstPage.css('margin-top', firstPageMargin);
        this.$firstPage.css('margin-bottom', firstPageMargin);
    };
    
    FirstPage.prototype.doCallback = function(){
        if($.isFunction(this.callback)){
            this.callback.call(this.callback);
        }
    };
    


    FirstPage.prototype.resizeCheck = function(){
        var resizeId;
        var that = this;        
        
        $(window).resize(function() {
            clearTimeout(resizeId);
            resizeId = setTimeout(function(){
                that.setup();
            }, 150);
        });
    };
    
})(jQuery, window, document);
