/*
 * Sets up footnotes for znet
 */

;( function ( $, window, document, undefined) {
    var pluginName = "znetHideNav",
        defaults = {
            minScrollDown   :   0,
            storyMode       :   false
        };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new HideNav( options));
            }, $.isFunction(callback) && callback.call(this));
        }
    };
    
    /*
     * a footnote collection is the structure containing all footnotes for a given
     * story (of which there can be more than one: see blog index).
     */
    function HideNav(options) {
        this.options = $.extend({}, defaults, options);
        this.$navBar = $('.navbar');
        this.$fullScreenHome = $('.full-screen-home');

        this.setMode();
    }

    HideNav.prototype.setMode = function(){
        var that = this;
        if(this.options.storyMode){
            this.$fullScreenHome.removeClass('nav-hide').addClass('nav-show');
            this.HandleIt();
            $(window).on('scroll', (function () {
                that.HandleIt();
            }));
        }
        else {
            this.$fullScreenHome.remove();
            this.$navBar.removeClass('nav-hide').addClass('nav-show');
            $('body').css('margin-top', this.$navBar.height());
        }

    };

    /**
     * hide/show the main nav bar.
     */
    HideNav.prototype.HandleIt = function() {
        var currentPosition = $(document).scrollTop();
        if(currentPosition > this.options.minScrollDown){
            this.$navBar.removeClass('nav-hide').addClass('nav-show');
            $('.full-screen-home').attr("tabindex", -1);
            $('.tab-nav').attr("tabindex", -1);
            this.$navBar.find('a').removeAttr("tabindex");
        }
        else {
            this.$navBar.removeClass('nav-show').addClass('nav-hide');
            $('.full-screen-home').removeAttr("tabindex");
            $('.tab-nav').removeAttr("tabindex");
            this.$navBar.find('a').attr("tabindex", -1);
        }
    };
})(jQuery, window, document);
