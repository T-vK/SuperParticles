# SuperParticles

Performance-focused alternative to [VincentGarreau's particles.js](https://github.com/VincentGarreau/particles.js)

## Introduction
SuperParticles aims at resolving the major performance issues that come with particles.js by using WebGL when possible and also by allowing set an FPS limit.
If you have more ideas on what could be done to further improve the performance, feel free to open an issue.

## Gif demo
[![Video](SuperParticlesVideo.gif)](https://t-vk.github.io/SuperParticles/demo.html)

## Live demo
https://t-vk.github.io/SuperParticles/demo.html

## How to use

Jquery is optional, but recommended.
Pixi.js is required (preferrably in a version above 5.0.0-rc).
```
<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
<script src="https://pixijs.download/dev-graphics-batch-pool/pixi.js"></script>
<script src="./SuperParticles.js"></script>
<script>
    window.onload = function(){
        var superParticles = new SuperParticles()
    }
</script>
```

If you want, you can pass a div container to SuperParticles which then will be used to render the particles:

```
<body>
    <script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>
    <script src="https://pixijs.download/dev-graphics-batch-pool/pixi.js"></script>
    <div id="super-particles"></div>

    <script src="./SuperParticles.js"></script>

    <script>
        window.onload = function(){
            var divContainer = $('#super-particles')
            new SuperParticles({
                container: divContainer
            })
        }
    </script>
</body>
```

You can limit the FPS like this:
```
new SuperParticles({
    maxFps: 30
})
```

## API

### new SuperParticles(cfg)
Creates a new SuperParticles instance.  

cfg defaults to:

```
{
    useJquery: undefined, // true/false/undefined
    maxFps: 60, // requires pixi.js v5
    autoStartAnimation: true, // true/false
    container: {
        element: undefined,
        backgroundCssRule: "radial-gradient(ellipse at center, rgba(10,46,56,1) 0%,rgba(34,34,34,1) 70%)" // css or null (null: don't modify container background)
    },
    pixiApp: {
        antialias : true, // true/false
        transparent : true, // true/false
    },
    particles: {
        amount: 80, // unit: particles
        radius: 2, // unit: pixels
        velocity : 10, // unit: pixels/second
        color: 0xFFFFFF, // unit: rgb hex color
        fadeInDuration: 3000, // unit: milliseconds
        fadeOutDuration: 600, // unit: milliseconds
        keepRelativePositionOnResize: true, // true/false
    },
    lines: {
        minDistance: 150, // unit: pixels
        color: 0xFFFFFF, // unit: hex color
        maxOpacity: 0.8, // 1: full opacity; 0: no opacity
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
