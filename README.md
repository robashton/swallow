Swallow
-------

Swallow is an asset packager for facilliating the loading process in browser based games, the idea being:

- You have a large number of assets (textures, sounds, models, shaders) which are needed for the game to run
- You want to know when they're all loaded so the game can start
- You don't want to load most things on demand, but working out what you need is a bit of a bother
- You want to package all of those assets into single deployable files as JSON and load them out the other side without changing too much code

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

And a command as follows

swallow -i ./assets

A file (assets.json) will be generated containing all the data in the specified directory.

The above is complete, coming is

- Dependencies between assets
- per-level/world-area/ asset file generation (taking into account the dependencies)
- pluggable handlers on the server side for generating output / specifying additional dependencies
- client code for loading assets (promises and asynchronous load notifications)

Scope
-----

Probably the above, try looking at the other libraries I run for other functionalities.
