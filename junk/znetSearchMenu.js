;( function ( $, window, document, options) {
    var pluginName = "znetSearchMenu",
        defaults = {};

    $.fn[pluginName] = function(options, callback){
        return this.each(function(){
            if(!$.data(this, "plugin_" + pluginName )){
                $.data(this, "plugin_" + pluginName,
                    new SearchMenu($(this), options));
                $.removeData(this, "plugin_" + pluginName);
            }
        }, $.isFunction(callback) && callback.call(this));
    };

    function SearchMenu($searchButton, options) {
        this.setup($searchButton);
    }

    SearchMenu.prototype.setup = function($searchButton){
        var that = this;
        var $navSearchBox = $('.nav-search-box');
        var navSearchBoxHeight = $navSearchBox.height();
        // parent is the rest of the navbar. Since $navSearchBox is removed from flow, navbar will NOT include its
        // height.
        var parentHeight = $navSearchBox.parent().height();

        // searchbox is taller than navbar, so it needs to be moved up a bit to hide.
        var initialSearchBoxPosition = parentHeight - navSearchBoxHeight;
        $navSearchBox.css('top', initialSearchBoxPosition + 'px');

        $navSearchBox.addClass('nav-search-box__closed');

        // initially remove searchbar from tab flow (because it's tabable elements are hidden).
        this.disableSearchBoxTabIndex($navSearchBox);

        // do the thing.
        $searchButton.on('touchstart click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // open the search box.
            if(!that.searchBoxOpen($navSearchBox)){
                that.enableSearchBoxTabIndex($navSearchBox);
                that.handleClicks($navSearchBox, initialSearchBoxPosition);
                that.openSearchBox($navSearchBox, parentHeight);
            }
            // close the search box
            else {
                that.disableSearchBoxTabIndex($navSearchBox);
                that.removeClickHandler();
                that.closeSearchBox($navSearchBox, initialSearchBoxPosition);
            }
        });
    };

    SearchMenu.prototype.searchBoxOpen = function($navSearchBox){
        return $navSearchBox.hasClass('nav-search-box__open');
    };

    SearchMenu.prototype.handleClicks = function($navSearchBox, initialSearchBoxPosition){
        var that = this;
        // cover the likely events...
        $(document).on('touchstart.searchOpenCheck touchmove.searchOpenCheck click.searchOpenCheck', function (event) {
            var $clickOver = $(event.target);
            // if the click wasn't inside the search box, or any of its children,
            if(!$($clickOver).hasClass('nav-search-box') && !$clickOver.parents('.nav-search-box').length){
                that.closeSearchBox($navSearchBox, initialSearchBoxPosition);
            }
            // if the user clicked the cancel button.
            if($($clickOver).hasClass('cancel-button') || $clickOver.parents('.cancel-button').length){
                that.closeSearchBox($navSearchBox, initialSearchBoxPosition);
            }
        });
    };

    // no reason to keep watching for clicks on a closed menu.
    SearchMenu.prototype.removeClickHandler = function(){
        $(document).off('touchstart.searchOpenCheck touchmove.searchOpenCheck click.searchOpenCheck');
    };

    SearchMenu.prototype.openSearchBox = function($navSearchBox, topPosition){
        $navSearchBox.removeClass('nav-search-box__closed');
        $navSearchBox.addClass('nav-search-box__open');
        $navSearchBox.animate({top:topPosition}, {duration: 200});
        // put the cursor in the input.
        $navSearchBox.find('input').focus();
    };

    SearchMenu.prototype.closeSearchBox = function($navSearchBox, topPosition){
        $navSearchBox.removeClass('nav-search-box__open');
        $navSearchBox.addClass('nav-search-box__closed');
        $navSearchBox.animate({top:topPosition}, {duration: 200});
        // clear any search terms that might be hanging around in the input
        $($navSearchBox).find('input').val('');
    };

    // include the search box elements in tab index.
    SearchMenu.prototype.enableSearchBoxTabIndex = function($navSearchBox){
        $navSearchBox.find('input').attr("disabled", false);
        $navSearchBox.find('button').attr("disabled", false);
    };

    // exclude the search box elements from tab index.
    SearchMenu.prototype.disableSearchBoxTabIndex = function($navSearchBox){
        $navSearchBox.find('input').attr("disabled", true);
        $navSearchBox.find('button').attr("disabled", true);
    };
})(jQuery, window, document);