# SuperParticles

Performance-focused alternative to [VincentGarreau's particles.js](https://github.com/VincentGarreau/particles.js)

## Introduction
SuperParticles aims at resolving the major performance issues that come with particles.js, by using WebGL when possible and also by allowing you to limit the frame rate (FPS).
If you have more ideas on what could be done to further improve the performance, feel free to open an issue.

## GIF Demo
[![Video](SuperParticlesVideo.gif)](https://t-vk.github.io/SuperParticles/demo.html)

## Live Demo
https://t-vk.github.io/SuperParticles/demo.html

## How To Use

Jquery is optional, but recommended.
Pixi.js is required (preferrably in a version above 5.0.0-rc):
``` HTML
<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
<script src="https://pixijs.download/dev-graphics-batch-pool/pixi.js"></script>
<script src="https://cdn.jsdelivr.net/gh/T-vK/SuperParticles@master/SuperParticles.js"></script>
<script>
    window.onload = function(){
        var superParticles = new SuperParticles()
    }
</script>
```

If you want, you can pass a div container to SuperParticles which then will be used to render the particles:

``` HTML
<body>
    <script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
    <script src="https://pixijs.download/dev-graphics-batch-pool/pixi.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/T-vK/SuperParticles@master/SuperParticles.js"></script>
    <div id="super-particles"></div>

    <script>
        window.onload = function(){
            var divContainer = '#super-particles'
            new SuperParticles({
                container: divContainer
            })
        }
    </script>
</body>
```

You can limit the FPS like this:
``` JavaScript
new SuperParticles({
    maxFps: 30
})
```

## API

### new SuperParticles(cfg)
Creates a new SuperParticles instance.  

cfg defaults to:

``` JavaScript
{
    useJquery: undefined, // true/false/undefined
    maxFps: 30, // requires pixi.js v5
    autoStartAnimation: true, // true/false
    container: {
        element: undefined,
        backgroundCssRule: "radial-gradient(ellipse at center, rgba(10,46,56,1) 0%,rgba(34,34,34,1) 70%)" // css or null (null: don't modify container background)
    },
    pixiApp: { // these are documented here: http://pixijs.download/release/docs/PIXI.Application.html#Application
        antialias: true,
        transparent: true,
        forceFXAA: false,
        powerPreference: 'high-performance',
        resolution: 1.0
    },
    particles: {
        amount: 80, // unit: particles
        radius: 2, // unit: pixels
        velocity : 10, // unit: pixels/second
        color: "0xFFFFFF", // unit: rgb hex color
        fadeInDuration: 3000, // unit: milliseconds
        fadeOutDuration: 600, // unit: milliseconds
        keepRelativePositionOnResize: true, // true/false
    },
    lines: {
        minDistance: 0.09, // unit: percent (1: 100%; 0: 0%
        color: "0xFFFFFF", // unit: hex color
        maxOpacity: 0.4, // 1: full opacity; 0: no opacity
        thickness: 1, // unit: pixels
        distanceBasedTransparency: true, // true/false
    },
    debug: {
        showFps: false, // true/false
    }
}
```

but you can overwrite individual properties if you like.

### superParticles.stopAnimation()

Pauses the SuperParticles instance.

### superParticles.startAnimation()

Resume the SuperParticles instance.

### superParticles.destroy()

Destroys the SuperParticles instance. (If you want to reuse the instance afterwards, you have to call reinit first!)

### superParticles.reinit()

Reinitializes the instance. (Useful after destroying it.)

### superParticles.cfg

This is the config object of the instance. You can overwrite the cfg object during runtime.
E.g. `superParticles.cfg = { pixiApp: { antialiasing: true } }`  
Don't do `superParticles.cfg.pixiApp.antialiasing = true`
