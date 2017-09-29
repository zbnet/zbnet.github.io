/*
 * Sets up search for znet
 */

;( function ( $ ) {
    $.extend({
        znetSearch: function(imageUrl, options){
            new Search(imageUrl, options);
        }
    });

    function Search(imageUrl, options) {
        this.options = options;
        this.init();
        this.setup();
        this.imageUrl = imageUrl;
    }

    Search.prototype.init = function(){

        this.searchConfig =
            {
                'fields': {
                    'title': {
                        'boost': 1
                    },
                    'content': {
                        'boost': 1
                    },
                    'excerpt': {
                        'boost': 1
                    }
                },
                'bool': 'OR'
            };
        this.storyIdx = new elasticlunr.Index;
        this.blogIdx = new elasticlunr.Index;
        this.storySearchResults = [];
        this.blogSearchResults = [];
        this.previousSearchString = "";
        this.$storyResults = $('.story-results');
        this.$blogResults = $('.blog-results');
        this.$formInput = $('form :input');
        this.$noResults = $('.no-results');
        this.oldSearchString = '';
        this.newSearchString = '';
        this.$clearButton = $('.clear-input');
    };

    Search.prototype.setup = function(){
        var that = this;

        $.getJSON("../lunr-elastic-search-stories.json", function(storyData){
            that.storyIdx = elasticlunr.Index.load(storyData);
            $.getJSON("../lunr-elastic-search-blog.json", function(blogData){
                that.blogIdx = elasticlunr.Index.load(blogData);
                
                // if the user arrived at the search page via the back button, the search input might still contain a
                // string. Since the search calls are cheap, we'll run one, just in case.
                that.backButtonCheck();
                that.monitorFormInput();

                var searchString = that.getUrlVar('s', window.location.href);
                if(searchString !== null){
                    that.doSearch(searchString);
                    that.$formInput.val(searchString);
                }
            });            
        });

        this.clearSearch();

    };

    Search.prototype.clearSearch = function(){
        var that = this;
        this.$clearButton.click(function(){
            that.$formInput.val('');
            that.newSearchString = '';
            that.tidyUp();
            that.toggleClearButton();
        })
    }
    Search.prototype.monitorFormInput = function(){
        var that = this;
        var timerLength;
        this.$formInput.on('input', (function () {
            // watch the search string...
            that.oldSearchString = that.newSearchString;            
            that.newSearchString = $(this).val();

            var timerLength = that.setDelay();

            that.delay(function () {
                that.doSearch();
                that.toggleClearButton();
                that.tidyUp();
            }, timerLength);
            
        }));
    };

    Search.prototype.toggleClearButton = function(){
        if(this.newSearchString){
            this.$clearButton.show();
        }
        else {
            this.$clearButton.hide();
        }
    }
    Search.prototype.tidyUp = function(){
        if(this.searchStringLongEnough()){
            if(this.storySearchResults.length === 0 && this.blogSearchResults.length === 0){
                this.setNoResults();                    
                this.clearBlogResults();
                this.clearStoryResults();
            }
            else {
                this.clearNoResults();
                this.buildStoryResults();
                this.buildBlogResults();
            }              
        }
        else {
            this.clearNoResults();
            this.clearBlogResults();
            this.clearStoryResults();
        }
    }
    // building in a special case for users holding down the delete key
    // which fires off at whatever interval the native OS wants.
    Search.prototype.setDelay = function(){
        // I initially tried to detect the delete key, but this is 
        // easier and more effective.
        if(this.newSearchString === this.oldSearchString.slice(0, -1)){
            return 750;
        }
        else {
            return 250;
        }
    }
    Search.prototype.doSearch = function(){
        var storySearchResults;
        var blogSearchResults;
        var that = this;

        this.storySearchResults = this.storyIdx.search(this.newSearchString, this.searchConfig);
        this.blogSearchResults = this.blogIdx.search(this.newSearchString, this.searchConfig);
    };

    Search.prototype.searchStringLongEnough = function(){
        if(this.newSearchString.length > 3){
            return true;
        }
        return false;
    }
    Search.prototype.setNoResults = function(){
        this.$noResults.html('Your search returned no results...');
    }
    Search.prototype.clearNoResults = function(){
        this.$noResults.html('');
    }
    Search.prototype.clearStoryResults = function () {
        this.previousStorySearchResults = null;
        this.$storyResults.html('');
    };
    Search.prototype.clearBlogResults = function () {
        this.previousBlogSearchResults = null;
        this.$blogResults.html('');
    };

    Search.prototype.delay = (function () {
        var timer = 0;
        return function (callback, ms) {
            clearTimeout(timer);
            timer = setTimeout(callback, ms);
        };
    })();

    Search.prototype.backButtonCheck = function(){
        var searchString = $('form :input').val();
        this.doSearch(searchString);
    };
    Search.prototype.buildStoryResults = function () {
        var title;
        var url;
        var backgroundImage;
        var excerpt;
        var banner;

        this.clearStoryResults();
        if (this.storySearchResults.length > 0) {
            this.$storyResults.append('<h1 class="search-header">story results</h1>');
            var $storyList = $('<ol class="search-results"/>');

            for (var i = 0; i < this.storySearchResults.length; i++) {
                banner = this.storyIdx.documentStore.docs[this.storySearchResults[i].ref].banner
                backgroundImage = this.imageUrl + 'images/thumbnail/' + banner;
                title = this.storyIdx.documentStore.docs[this.storySearchResults[i].ref].title;
                url = this.storyIdx.documentStore.docs[this.storySearchResults[i].ref].url;
                excerpt = this.storyIdx.documentStore.docs[this.storySearchResults[i].ref].excerpt;
                var storySearchResult =
                    '<li class="story-quaternary">' +
                        '<article class="story-summary summary-small" data-slug="' + title + '">' +
                            '<a href="' + url + '">' +
                                '<div class="cover-wrapper">' +
                                    '<div class="cover-image" style="background-image: url(' + backgroundImage + ' )">' +
                                        '<h3 class="story-title">' + title + '</h3>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="info-wrapper">' +
                                    '<p class="excerpt">' +
                                        excerpt +
                                    '</p>' +
                                '</div>' +
                            '</a>' +
                        '</article>' +
                    '</li>';
                $storyList.append(storySearchResult);
            }
            this.$storyResults.append($storyList);
        }
        if($.isFunction(this.options.callback)){
            this.callback = this.options.callback();
        }
    };

    Search.prototype.buildBlogResults = function (blogSearchResults) {
        var title;
        var url;
        var excerpt;
        this.clearBlogResults();
        if (this.blogSearchResults.length > 0) {
            this.$storyResults.append('<h1 class="search-header">blog results</h1>');
            var $blogList = $('<ol class="search-results"/>');
            for (var i = 0; i < this.blogSearchResults.length; i++) {
                url = this.blogIdx.documentStore.docs[this.blogSearchResults[i].ref].url;
                title = this.blogIdx.documentStore.docs[this.blogSearchResults[i].ref].title
                excerpt = this.blogIdx.documentStore.docs[this.blogSearchResults[i].ref].excerpt;
                var blogSearchResult =
                    '<li class="story-quaternary">' +
                        '<article class="story-summary summary-small" data-slug="' + title + '">' +
                            '<a href="' + url + '">' +
                                '<div class="info-wrapper">' +
                                    '<h3 class="title">' + title + '</h3>' +
                                    '<p class="excerpt">' + excerpt + '</p>' +
                                '</div>' +
                            '</a>' +
                        '</article>' +
                    '</li>';
                $blogList.append(blogSearchResult);
            }
            this.$blogResults.append($blogList);
        }
    };

    Search.prototype.getUrlVar = function( name, url ) {
        if (!url) url = location.href;
        name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
        var regexS = "[\\?&]"+name+"=([^&#]*)";
        var regex = new RegExp( regexS );
        var results = regex.exec( url );
        return results === null ? null : results[1];
    }

})(jQuery);
