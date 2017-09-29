/*
 * Sets up footnotes for znet
 */

;( function ( $, window, document) {
    var pluginName = "znetFootnotes",
        defaults = {
            nudge                           :   0
        };
    
    $.fn[pluginName] = function(options, callback){
        if(!$.data(this, "plugin_" + pluginName )){
            return this.each(function(){
                $.data(this, "plugin_" + pluginName,
                    new Footnotes($(this), options));
            }, $.isFunction(callback) && callback.call(this));
        }
    };
    
    /*
     * a footnote collection is the structure containing all footnotes for a given
     * story (of which there can be more than one: see blog index).
     */
    function Footnotes(element, options) {
        this.options = $.extend({}, defaults, options);
        

        if(this.FootnotesAttached()){
            this.Init();
        }
    }
    
    /**
     * Initialize the Footnote object variables 
     */
    Footnotes.prototype.Init = function() {
        this.desktopFootnotes = new DesktopFootnotes();
        this.mobileFootnote = new MobileFootnote();
        this.SetScreenMode();
        this.HandleResize();
    };
    
    /**
    * footnotes can be set for wide screen or narrow
    */
    Footnotes.prototype.SetScreenMode = function(){
        var that = this;
        if(this.screenWiderThanBreakpoint('md')){
            // if the footnote is open, close it.
            that.mobileFootnote.CloseFootnote();
            that.mobileFootnote.DisableClicks();
            that.desktopFootnotes.Setup(this.options.nudge);
        }
        else {
            that.desktopFootnotes.Breakdown();
            that.mobileFootnote.Setup();
        }
    };

    /*
    * On resize we might go from wide layout to narrow. Also, wide-layout footnotes
    * must be repositioned every resize
    */
    Footnotes.prototype.HandleResize = function(){
        var resizeId;
        var that = this;        
        
        $(window).resize(function() {
            clearTimeout(resizeId);
            resizeId = setTimeout(function(){
                that.SetScreenMode();
            }, 150);
        });
    };


    /*
    * determine how wide the CSS thinks the screen is.
    */
    Footnotes.prototype.screenWiderThanBreakpoint = function(breakPoint) {
        // javascript and CSS never agree on screen width. So we've styled the 
        // <style> tag with a width, depending on the media query. We'll compare
        // mobileFootnote against these widths and discover what media query state the page is
        // in...
        var layoutXsBreakpoint = 320;
        var layoutSmBreakpoint = 480;
        var layoutMdBreakpoint = 768;
        var layoutLgBreakpoint = 992;
        var widthReportedByCss = parseInt($("style").css("width"));
        
        if (breakPoint === "lg" && widthReportedByCss >= layoutLgBreakpoint){
            return true;
        }
        else if (breakPoint === "md" && widthReportedByCss >= layoutMdBreakpoint){
            return true;
        }
        else if (breakPoint === "sm" && widthReportedByCss >= layoutSmBreakpoint){
            return true;
        }
        else if (breakPoint === "xs" && widthReportedByCss >= layoutXsBreakpoint){
            return true;
        }
        else {
            return false;
        }
    };

    /*
     * are there any footnotes?
     */
    Footnotes.prototype.FootnotesAttached = function() {
        return $(document).find(".footnote").length > 0;
    };





    function DesktopFootnotes(){
        this.$footnotes = $('.footnote');
        this.Init();
    }

    DesktopFootnotes.prototype.Init = function(){
        this.SympatheticHighlight();
    };

    DesktopFootnotes.prototype.Setup = function(footnoteNudge){
        this.SetContainerCssDesktop();
        this.Position(footnoteNudge);
        this.HandleFootlinkClicks();
    };

    
    DesktopFootnotes.prototype.SetContainerCssDesktop = function() {
        // bump the container size up to medium so we have room for the footnote column, then set the 
        // container to flex so the columns appear side by side.
        // flex css rules for the columns (footnotes, story) are set in css, but ignored until we add
        // flex to the parent.  
        $('.story-container').removeClass('container-small').addClass("container-medium flex");
    };

    /* 
    * if wide-screen footnotes aren't needed, kill their margins
    */
    DesktopFootnotes.prototype.Breakdown = function(){
        // set the container to single column again. 
        $('.story-container').removeClass('container-medium flex').addClass('container-small');
        // remove the spacing from each footnote.
        $('.footnote').css({'margin-top': '0'});
        // Not sure what these do. Why kill mobile footnotes when opening mobile footnote mode?
        $('.footLink--upper').off( "touchstart.mobileFootnoteOpen click.mobileFootnoteOpen");
        $('.footLink--lower').off( "touchstart.mobileFootnoteOpen click.mobileFootnoteOpen");
    };

    /*
     * position footnotes for a a desktop viewport.
     */
    DesktopFootnotes.prototype.Position = function(footnoteNudge) {
        var bottomOfPreviousFootnote = 0;
        // offset does not take an element's padding or margin into account...
        var storyOffset = $('.story').offset().top - parseInt($('.story').css("margin-top")) - parseInt($('.story').css("padding-top"));

        this.$footnotes.each(function(){
            var $footnote = $(this);
            var footnoteNumber = $footnote.data('footnote-number');
            var $upperFootnoteLink = $('#footLink--upper_' + footnoteNumber);
            
            // raw offset is relative to the DOCUMENT, but we need it relative to the
            // STORY, because mobileFootnote's what the margins will press against.
            // Nudge is because browsers don't take <sup> into account when calculating 
            // heights.
            var footnoteOffset = $upperFootnoteLink.offset().top - storyOffset + footnoteNudge;
            var footnoteHeight = $footnote.height();

            // footnote has room to position itself against the footnote link
            if(footnoteOffset > bottomOfPreviousFootnote){
                $footnote.css({'margin-top': footnoteOffset-bottomOfPreviousFootnote});
                bottomOfPreviousFootnote = footnoteOffset + footnoteHeight;
            }
            // footnote does NOT Have room and must stack up against the bottom of the 
            // previous footnote.
            else {
                $footnote.css({'margin-top': '0'});
                bottomOfPreviousFootnote = bottomOfPreviousFootnote + footnoteHeight;
            }
        });
    };

    /* 
    * If a user hovers over a footnote link in the article, put a border around the content
    * of the coresponding footnote
    */
    DesktopFootnotes.prototype.SympatheticHighlight = function() {
        this.$footnotes.each(function(){
            var $footnote = $(this);
            var footnoteNumber = $footnote.data('footnote-number');
            var $upperFootnoteLink = $('#footLink--upper_' + footnoteNumber);
            var $lowerFootnoteLink = $('#footLink--lower_' + footnoteNumber);
            
            $upperFootnoteLink.hover(function(){
                $lowerFootnoteLink.closest('.footnoteFields').toggleClass("sympatheticHover--lower");
            });
            
            $lowerFootnoteLink.hover(function(){
                $upperFootnoteLink.toggleClass("sympatheticHover--upper");
            });    
        });
    };
    DesktopFootnotes.prototype.HandleFootlinkClicks = function(){
        $('.footLink--upper').on( 'touchstart.mobileFootnoteOpen click.mobileFootnoteOpen', function(e) {
            e.preventDefault();
            var y = $(this).offset();  //your current y position on the page
            $(window).scrollTop(y.top-100);
        });
        $('.footLink--lower').on( 'touchstart.mobileFootnoteOpen click.mobileFootnoteOpen', function(e) {
            e.preventDefault();
            var y = $(this).offset();  //your current y position on the page
            $(window).scrollTop(y.top-100);
        });
    };

    /* 
    * the mobile footnote is a lot harder than desktop footnotes. Note that there is only 
    * "one" footnote and we just swap the content in an out.
    */ 
    function MobileFootnote(){
        this.Init();
    }

    MobileFootnote.prototype.Init = function(){
        this.$body              = $('body');
        this.$footLinkUpper     = $( '.footLink--upper' );
        this.$footnotes         = $('.footnotes');
        this.$mainContainer     = $('.main-container');
        // used to register clicks on a footnote that's already open in the mobile footnote.
        // so we don't have to re-process it AND so the upper footnote link can close it's 
        // lower footnote when clicked. That is, click [1], footnote opens. click [1] again, 
        // footnote closes.
        this.currentFootnote    = null;
        this.Build();
    };

    MobileFootnote.prototype.Setup = function(){
        this.SetContainerCssMobile();
        this.HideFootnotes();
        this.HandleFootlinkClicks();
        this.HandleExternalClicks();
    };

    MobileFootnote.prototype.SetContainerCssMobile = function() {
        // bump the container size up to medium so we have room for the footnote column, then set the 
        // container to flex so the columns appear side by side.
        // flex css rules for the columns (footnotes, story) are set in css, but ignored until we add
        // flex to the parent.  
        $('.story-container').removeClass('container-medium flex').addClass("container-small");
    };
    /*
    * build the mobile footnote (that is, singlular shell that we'll move footnote text into)
    * all this DOM manipulation is slightly awkward, but it keeps the plugin more plugin-y 
    * as it doesn't require a special, empty tag in the document
    */ 
    MobileFootnote.prototype.Build = function(){
        this.$mobileFootnote              = $('<div id="mobile-footnote" class="mobile-footnote-slidedown"></div>');
        this.$mobileFootnoteCloseButton   = $('<span id="close" class="icon-cancel-1"></span>');
        this.$footnoteContent             = $('<p id="content"></p>');
        this.$scrollDownIndicator         = $('<div id="scroll-down-indicator" class="icon-down-open"></div>');

        this.$mobileFootnote
                            .append(this.$footnoteContent)
                            .append(this.$mobileFootnoteCloseButton);
        // note that scroll indicator is appended outside mobile footnote. Position: fixed and scrollable divs
        // do not get along.
        this.$body.append(this.$mobileFootnote).append(this.$scrollDownIndicator);
    };


    /*
    * Mobile footnote will persist in wide layout--it just won't respond to clicks.
    */
    MobileFootnote.prototype.DisableClicks = function(){
        this.$footLinkUpper.off('.mobileFootnoteOpen');
        this.ShowFootnotes();
    };

    /* without all this javascript, the footnotes exist at the bottom of the page. 
    * hide em.
    */
    MobileFootnote.prototype.HideFootnotes = function(){
        this.$footnotes.hide();
    };

    /* 
    * oposite of above. If we're going from narrow to wide, then we need the footnotes
    * back.
    */
    MobileFootnote.prototype.ShowFootnotes = function(){
        this.$footnotes.show();
    };

    /*
    * "open" is a misnomer; what we're really doing is copying content into the 
    * already-existing mobile footnote shell. 
    */
    MobileFootnote.prototype.Open = function(footnoteNumber){
        this.InsertContent(footnoteNumber);
        // always set to the top of content when footnote opens
        this.$mobileFootnote.scrollTop(0);
        this.$mobileFootnote.addClass('open');
    };

    /*
    * copy content out of existing footnote and into mobile footnote
    */
    MobileFootnote.prototype.InsertContent = function(footnoteNumber){
        // there might be content in the footnote, as users can click 
        // from one footnote directly into the next.
        this.$footnoteContent.empty();
        this.$mobileFootnote.data('footnote-number', footnoteNumber);

        var $footnote =$("#footnote_" + footnoteNumber);
        var footnoteContent = $footnote.find('.footnoteContent').html();
        
        this.$footnoteContent.html('[ ' + footnoteNumber + ' ] ' + footnoteContent);
    };

    /*
    * here we get to the dragon function. This one really sucks and it's (mostly)
    * iPhone's fault. See, if a scrollable element (that is, a mobile footnote) scrolls
    * all the way to the top, or bottom, of its content, then the phone will assume any 
    * further movement in that direction should apply to scrollable content UNDER the 
    * footnote. That is, the rest of the damned article. To get around this behhavior, 
    * we have the following:
    */
    MobileFootnote.prototype.LockWindow = function(){
        var that = this;
        
        var scrollHeight    = this.$mobileFootnote.prop('scrollHeight');

        // kill all scroll to start, because scrollwheel behavior is kind of strange and 
        // if we wait for the .on() function, it might be too late to stop the mousewheel from
        // moving the main content.
        that.KillScroll(this.$body, 'mobileFootnoteLock');

        this.$mobileFootnote.on('touchstart.mobileFootnoteLock, mousewheel.mobileFootnoteLock', function () {
            // if the footnote has enough content to scroll
            if (that.FootnoteScrolls()){
                // we're going to need the footnote unlocked, which means we need the body unlocked...
                that.EnableScroll(that.$body, 'mobileFootnoteLock');
                // kill scroll just for everything BUT the footnote...
                that.PreventOverscroll(that.$mobileFootnote);
            }

        });
    };

    MobileFootnote.prototype.FootnoteScrolls = function(){
        /** * @returns {boolean} */
        var scrollHeight    = this.$mobileFootnote.prop('scrollHeight');
        var innerHeight     = this.$mobileFootnote.innerHeight();

        // footnote does NOT have enough content to scroll
        return scrollHeight > innerHeight;
    };

    /*
    * If an element is scrollable, most mobile browsers will flash a brief scroll bar on it when the page loads,
    * but it's really subtle. A big "down" arrow is not subtle.
    */
    MobileFootnote.prototype.HandleScrollIndicator = function(){
        var that = this;
        // if the footnote is long enough to scroll...
        if(that.FootnoteScrolls()){
            this.$mobileFootnote.addClass('scrolls');
            this.$scrollDownIndicator.fadeIn();
            this.$mobileFootnote.on('scroll.footnoteScrollDownIndicator touchmove.footnoteScrollDownIndicator', function (event) {
                var scrollTop = that.$mobileFootnote.scrollTop();                
                if (scrollTop <= 20 && that.$mobileFootnote.hasClass('open')){
                    that.$scrollDownIndicator.fadeIn();
                }
                else {
                    that.$scrollDownIndicator.fadeOut();
                }
            });
        }
        else {
            this.$mobileFootnote.removeClass('scrolls');
            that.$mobileFootnote.off('.footnoteScrollDownIndicator');
            that.$scrollDownIndicator.hide();
        }
    };


    /* 
    * overscroll is triggered when scrollTop === 0 or when it equals scrollHeight
    * (i.e. when we're at the bottom of the div.). Solution? Make sure scrollHeight 
    * never equals either of those things. This causes a tiny jitter if the user 
    * tries to scroll past the content, but NBD
    */
    MobileFootnote.prototype.PreventOverscroll = function($mobileFootnote){
        var scrollTop       = $mobileFootnote.scrollTop();
        var scrollHeight    = $mobileFootnote.prop('scrollHeight');
        var scrollBottom    = $mobileFootnote.scrollTop() + $('#mobile-footnote').outerHeight();
        // scrollHeight and scrollBottom don't always agree 
        var bottomFudge     = 10;

        if(scrollTop === 0){
            $mobileFootnote.scrollTop(1);           
        }
        // if scrollBottom is within ten px of scrollHeight, we're good enough.
        else if(scrollHeight + bottomFudge >= scrollBottom && scrollBottom + bottomFudge >= scrollHeight){
            var forceScroll = scrollTop-1;
            $mobileFootnote.scrollTop(forceScroll);
        }
    };

    /*
    * Kill scroll. Give the event a name so we can re-enable scroll later
    */
    MobileFootnote.prototype.KillScroll = function($element, handlerName){
        event.preventDefault();
        this.$body.addClass('disable-touch');
    };

    MobileFootnote.prototype.EnableScroll = function($element, handlerName){
        // the '.' is required, because that's how jquery does it.
        $element.off('.' + handlerName);
    };

    /*
    * remove the events added above
    */
    MobileFootnote.prototype.UnlockWindow = function(){
        this.$mainContainer.off('.mobileFootnoteLock');
        this.$body.off('.mobileFootnoteLock');
    };

    
    /*
    * there's not much to say for this one
    */
    MobileFootnote.prototype.CloseFootnote = function(){
        // currentFootnote exists solely so that I can click on the 
        // upper footnote link and have it close it's own lower footnote.
        this.currentFootnote = null;
        this.$mobileFootnote.removeClass('open');
        this.$scrollDownIndicator.hide();
        this.$body.removeClass('disable-touch');        
    };

    /*
    * is the mobile footnote already open?
    */
    MobileFootnote.prototype.AlreadyOpen = function(){
        var mobileFootnote = this;
        return mobileFootnote.$mobileFootnote.hasClass('open');
    };

    /*
    * detect clicks that happen outside the mobile footnote (and should trigger a footnote close)
    */
    MobileFootnote.prototype.HandleExternalClicks = function(){
        var that = this;
        $(document).on('touchstart.mobileFootnoteCheck touchmove.mobileFootnoteCheck click.mobileFootnoteCheck', function (event) {
            var clickover = $(event.target);
            if (that.AlreadyOpen()) {
                // clicked a close button inside a footnote
                if(clickover.attr('id') === 'close' && clickover.parents('#mobile-footnote').length){
                    that.CloseFootnote();
                    that.UnlockWindow();
                }
                // of they clicked somewhere that isn't the mobile footnote or it's parents.
                else if (clickover.attr('id') !== 'mobile-footnote' && !clickover.parents('#mobile-footnote').length) {
                    that.CloseFootnote();
                    that.UnlockWindow();
                }
            }
        });
    };

    /*
    * open the footnote, if it isn't already open. If it IS already open, swap content
    */
    MobileFootnote.prototype.HandleFootlinkClicks = function(){
        var that = this;
        $('.footLink--upper').on( 'touchstart.mobileFootnoteOpen click.mobileFootnoteOpen', function(e) {
            e.preventDefault();
            var footnoteNumber = $(this).data('footnote-number');

            // there's only the one mobile "footnote" we just swap out its content.
            if(footnoteNumber !== that.currentFootnote){
                // when chrome debug impersonates an iPhone, it will register
                // both a click and a touchstart. this stops both from firing.
                e.stopImmediatePropagation();

                if(that.AlreadyOpen()){
                    that.InsertContent(footnoteNumber);
                    that.HandleScrollIndicator();
                    that.$mobileFootnote.scrollTop(0);
                }
                else {
                    that.currentFootnote = footnoteNumber;
                    that.Open(footnoteNumber);
                    that.LockWindow();
                    that.HandleScrollIndicator();
                }
            }
            
        });
    };
})(jQuery, window, document);