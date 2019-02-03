# SuperParticles

## Performance-focused alternative to [VincentGarreau's particles.js](https://github.com/VincentGarreau/particles.js)

### Introduction
Particles.js is a great project, but it tends to use up the CPU core that it runs on entirely, no matter how you change the config.  
SuperParticles aims at resolving that issue by using WebGL when possible and also by allowing set an FPS limit.  
If you have more ideas on what could be done to further improve the performance, feel free to open an issue.

Unfortunately we currently have to wait for pixi.js 5 to fix a [bug](https://github.com/pixijs/pixi.js/issues/5400) before we can use it to limit the FPS.


### Live demo
https://t-vk.github.io/SuperParticles/

### How to use

Make sure you load pixi.js:
```
<!-- Jquery is optional, but recommended: -->
<script src="https://code.jquery.com/jquery-1.12.0.min.js"></script>

<!-- We have to wait for https://github.com/pixijs/pixi.js/issues/5400 to get fixed to use pixi.js v5: -->
<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.0.0-rc/pixi.js"></script>-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/4.8.5/pixi.js"></script>
```

Then include the SuperParticles.js script and make an instance of SuperParticles:
```
<script src="./SuperParticles.js"></script>

<script>
    window.onload = function(){
        var superParticles = new SuperParticles()
    }
</script>
```

If you want, you can pass a div container to SuperParticles which then will be used to render the particles:

```
var divContainer = $('#myContainer')
new SuperParticles({
    container: divContainer
})
```
