# Personal-Website
This is my personal website's code.

Hosting on github-pages using a free domain from nc.me.

## Cool Static Page Hack

So if you want to render a directory listing but don't want to jump through 20 hoops like server hosting, PHP, etc. you can force github pages to use directory listings with this api call: `https://api.github.com/repos/<username>/<repo>/contents/<path>`

This let's me have a static page that "dynamically" renders and updates with blog posts, with like 3 lines of javascript. Pretty cool.
