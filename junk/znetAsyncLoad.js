(function(window){
    'use strict';
    function define_znetAsyncLoad(){
        var ZnetAsyncLoad = {};

        ZnetAsyncLoad.loadCss = function(pathToFile){
            var stylesheet = document.createElement('link');
            stylesheet.href = pathToFile;
            stylesheet.rel = 'stylesheet';
            stylesheet.type = 'text/css';
            // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
            stylesheet.media = 'only x';
            // set the media back when the stylesheet loads
            stylesheet.onload = function() {
                stylesheet.media = 'all'
            }
            document.getElementsByTagName('head')[0].appendChild(stylesheet);
        }

        return ZnetAsyncLoad;
    }

    if(typeof(ZnetAsyncLoad) === 'undefined'){
        window.ZnetAsyncLoad = define_znetAsyncLoad();
    }
    else {
        console.log("ZnetAsyncLoad already defined");
    }
})(window);

