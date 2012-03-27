Swallow
-------

Swallow is an asset packager for facilliating the loading process in browser based games, the idea being:

- You have a large number of assets (textures, sounds, models, shaders) which are needed for the game to run
- You want to know when they're all loaded so the game can start
- Doing 500 HTTP requests on start-up seems a bit excessive
- You don't want to load most things on demand, but working out what you need is a bit of a bother
- You want to package all of those assets into single deployable files as JSON and load them out the other side without changing too much code
- You want to be able to create a package which can be played offline

How
----

Given a directory of assets, and an appropriate structure within:

```
  - assets
    - models
      - craft.json
      - tree.json
    - textures
      - craft.jpg
      - grass.jpg
      - snow.jpg
      - sky.jpg
      - smoke.jpg
    - sound
      - explosion.wav
      - engine.wav
    - shaders
      - super.fragment
      - super.shader
      - particles.fragment
      - particles.shader
    - etc
```

And some code like so:


```
swallow.build({
  in: './assets',
  out: './assets.json'
});
```

A file (assets.json) will be generated containing all the data in the specified directory. 

This can be downloaded and consumed in one go like thus:

```
$.getJSON('/assets.json', function(data) {
  var audioData = data['assets/sound/explosion.wav'];
  var audio = new Audio();
  audio.href = "data:image/png;base64," + audioData;
  // etc
});
```

You'll more likely want to enumerate the package when it is down and pre-load the assets, there is code on the way to do that as it needs extracting from the project that this library was pulled from in the first place.

Adding extensions
-----

There are some convenience methods supplied to help with this process, the following will suffice for most scenarios:

```
var swallow = require('swallow'),
    handlers = swallow.handlers;

swallow.build({
    in: './in/assets',
    out: './out/assets.json',
    extraHandlers: [
      handlers.byExtension('.shader', handlers.text),
      handlers.byExtension('.model', handlers.json),
      handlers.byExtension('.crazy', handlers.binary)
    ]
});
```

In the above example, we use the built in handlers, which match by file extension and can deal with the obvious content types.

A handler is just an object with two methods,

```
valid: function(filename, callback) {
  callback(true);
}
```

Given a filename, the callback should be invoked with either 'true' or 'false' depending on whether the handler is valid for the file passed in.


```
handle: function(filename, callback) {
  callback(err, data);
}
```

Given a filename, callback should be involved with something that is serializable into JSON, or an error if one occurs.

-----

- Dependencies between assets
- per-level/world-area/ asset file generation (taking into account the dependencies)
- client code for loading assets (already written, needs extracting from project)
- transparent client code for loading assets from either file or server if not in file