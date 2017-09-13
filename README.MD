# ZNET

How to build, maintain, publish ZNET

## Dev work

The site is generated twice. 

1) `gulp build-dev` The first time it's generated, the various javascript and css files are injected into index.html and the image files are pulled out of `raw-images` and processed/optimized. All of this (especially the image processing) is slow and it isn't necessary unless you've added a new file.

2) `jekyll serve --incremental` The second time it's generated, the Jekyll engine does its thing. Builds the content pages, links everything together and then serves the result up so that you can see it. It also rebuilds if any of the files it depends on changes, including scss and javascript. 

## Prod Time

The site is actually a github repo that is then actually served out of Cloudflare. As such, getting a new version published is a two-step process.

1) `gulp build-prod` This will concatinate all the javascript and css, uglify it, compress it, all that. It will also swap in the prod config file and rebuild the images, just for good measure. Once that's done, the script will move the genreated site over to another folder `zbnet.github.io` where it will be ready to push to production.

2) Push it to production. I used to have this automated as part of the gulp task, but then I started pushing stuff without having a second look and that was bad, so now you have to go over to the folder and manually `git add .` and `git commit -a -m ""` then `git push` the project up to its repo on github (and _not_ bitbucket, which is where the actual repo lives).

## Hosting and CDN

Page served out of zbnet.github.io, but is CDN'd via cloudflare. Both accounts are registered under zbnet.webmaster@gmail.com

## Other Useful Notes

gulp did not lend itself well to imagemagick because gulp is async and imagemagick is decidedly not. So the image resize/optimization happens in `images.bat`, which is in the folder `misc_scripts`.

