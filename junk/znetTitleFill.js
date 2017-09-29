// this plugin takes a title with a container with set width/height and tries to make the 
// title as large as possible, without overflowing the container. 

;( function ( $, window, document, options) {
    var pluginName = "znetTitleFill",
        defaults = {
            paddingX            : 100,
            yNudgeDown          : 0,
            titleAlignment      : "left"
        };

    $.fn[pluginName] = function(options, callback){
        return this.each(function(){
            
            if(!$.data(this, "plugin_" + pluginName )){
                $.data(this, "plugin_" + pluginName,
                new TitleFill($(this), options, callback));
                $.removeData(this, "plugin_" + pluginName);  
            }
        });
    };
    
    function TitleFill($title, options, callback) {
        this.$title = $title;
        this.$titleContainer = this.$title.parent();
        this.callback = callback;
        this.options = $.extend({}, defaults, options);

        this.init();
        this.setup();
        this.resizeCheck();

        $.isFunction(this.callback) && this.callback.call(this);
        
    }
    
    TitleFill.prototype.init = function() {
        // need position absolute to measure the title
        this.$title.css("position", "absolute");
        this.$title.css("display", "inline");
        this.setAlignment();
    };
    TitleFill.prototype.setup = function () {
        this.titleInitialFontSize = parseInt(this.$title.css('font-size'));
        this.containerHeight = this.$titleContainer.innerHeight();
        this.containerWidth = this.$titleContainer.width();
        this.setFontSize();
        this.centerTitle();
        this.$title.css("opacity", "1");
    };

    TitleFill.prototype.setAlignment = function(){
        if(this.options.titleAlignment === "scramble"){
            var titleLength = this.$title[0].innerHTML.length;
            if(titleLength % 3 === 0){
                this.$title.css("text-align", "center");
            }
            else if(this.$title[0].innerHTML.length % 2 === 0){
                this.$title.css("text-align", "right");
            }
            else {
                this.$title.css("text-align", "left");
            }
        }
        else if (this.options.titleAlignment === "center"){
            this.$title.css("text-align", "center");
        }
        else if (this.options.titleAlignment === "right"){
            this.$title.css("text-align", "right");
        }
        else {
            this.$title.css("text-align", "left");
        }
    };
    
    TitleFill.prototype.setFontSize = function() {
        var titleText = this.$title.text();
        
        var xMaxSize = this.getXMaxSize(titleText);
        this.setRealisticSize(xMaxSize, 0);
    };   

    TitleFill.prototype.getXMaxSize = function(title) {
        var newlinedTitle,
            containerWidthMinusPadding,
            titleWidth,
            xRatio;
            
        newlinedTitle = title.split(" ").join("<br>");
        
        this.$title.empty().append(newlinedTitle);
        
        containerWidthMinusPadding = this.containerWidth - (this.options.paddingX * 2);
        titleWidth = this.$title.width();
        
        xRatio = containerWidthMinusPadding/titleWidth;

        this.$title.empty().append(title);        
        
        return Math.floor(this.titleInitialFontSize * xRatio);
    };
    
    TitleFill.prototype.setRealisticSize = function(fontSize, count) {
        // set font to best-guess size
        this.$title.css("fontSize", fontSize);

        // A y-ratio > 1 means the container is larger than the title, which further means that the 
        // title is constrained on its x-axis and we don't need to do anything here.
        // A y-ratio < 1 means the container is smaller than the title and we need to adjust.
        // (note that the ratio can be very close to 1 (~.97) and still overflow the container
        var titleHeight = this.$title.height();
        // nudge down stops the title from crowding any navigation at the top of the page. It also
        // nudges the text up from the bottom, because it looks nicer that way. 
        var yRatio = (this.containerHeight-this.options.yNudgeDown)/titleHeight;

        // once the yRatio is >= 1, the title is small enough. 
        if(yRatio < 1){
            // adjust the width guess to reflect the y-ratio.
            var newFontSizeGuess = Math.floor(fontSize * yRatio);
            // this line is where the magic happens. Without it, estimates are quite a bit rougher.
            var splitTheDifference = ((fontSize - newFontSizeGuess)/2) + newFontSizeGuess;
            // recurse
            if(count < 20){
                count += count;
                this.setRealisticSize(splitTheDifference, count);
            }
        }

    };
    
    TitleFill.prototype.centerTitle = function() {
        
        var titleHeight = this.$title.height();
        var titleWidth = this.$title.width();
        
        var marginY = (this.containerHeight - titleHeight) / 2;
        var marginX = (this.containerWidth - titleWidth) / 2;
        
        this.$title.css("top", marginY);
    };
    

    
    TitleFill.prototype.resizeCheck = function(){
        var that = this;
        var resizeTimer;

        $(window).resize(function() {
            // Resize fires a LOT. If we're going to watch multiple titles, that overhead adds up fast.
            // so we introduce a delay that should only fire when the user stops resizing the window.
            if(resizeTimer) {
                window.clearTimeout(resizeTimer);
            }

            resizeTimer = window.setTimeout(function() {
                // we don't actually care about the window width. All that matters is the title container
                // width. 
                if (that.$titleContainer.width() !== that.containerWidth) {
                    that.setup();
                }
            }, 200);
        });     
    };


    
})(jQuery, window, document);