;( function ( $, window, document, undefined) {
    var pluginName = "znetLazyLoadImages",
        defaults = {
            "pollDelay": 250
        };

    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new LazyImage($(this), options, callback));
            });
        }
    };

    // expected input is a $container that contains a class .cover-image with a data-background attribute
    function LazyImage($container, options, callback) {
        this.options = $.extend({}, defaults, options);
        this.$container = $container;
        this.$coverImage = this.$container.find('.cover-image');
        this.slug = this.$container.data("slug");
        this.coverImagePath = this.$coverImage.data('background');

        // distance below or above window at which we start loading.
        this.buffer = this.options.buffer;

        // poll for new images.
        this.setScrollCheck();

        // get the images that should be visible on page load.
        this.handleImage();


    }

    LazyImage.prototype.handleImage = function() {

        // you're going to be tempted to calculate containerTop and containerBottom 
        // in the initialization. Don't do this. If the page size changes, then so does
        // the container location, relative to the page.
        var topOfWindow;
        var bottomOfWindow;
        var containerTop;
        var containerBottom;

        // if the background-image is set, then the image is loaded and we're done polling this 
        // particular element.
        if(this.$coverImage.css('background-image') === "none"){
            topOfWindow = $(window).scrollTop();
            bottomOfWindow = topOfWindow + $(window).height();
            containerTop = this.$container.position().top;
            containerBottom = containerTop + this.$container.height();

            // if container is visible on page (or within the "buffer"), then we need to load it.
            if(containerTop < (bottomOfWindow + this.buffer) && containerBottom > (topOfWindow - this.buffer)){
                this.loadImage();
                $(window).off('scroll.' + this.slug);
            }
        }
    };

    LazyImage.prototype.setScrollCheck = function(){
        var that = this;
        var scrollEnabled = true;

        $(window).on('scroll.' + that.slug, function () {
            if (!scrollEnabled) {
                return;
            }
            scrollEnabled = false;
            return setTimeout((function() {
                scrollEnabled = true;
                that.handleImage();
            }), that.options.pollDelay);
        });
    };

    LazyImage.prototype.loadImage = function(){
        this.$coverImage.css('background-image','url('+ this.coverImagePath +')');
        this.$coverImage.hide().css('visibility', 'visible').show();
    };
})(jQuery, window, document);