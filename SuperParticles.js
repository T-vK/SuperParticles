// Requires requires pixi.js (version > 5.0.0-rc)
window.SuperParticles = window.SuperParticles || class SuperParticles {
    constructor(cfg={}) {
        if (typeof PIXI === 'undefined') {
            throw new Error("Failed to initialize SuperParticles because Pixi.js was missing!")
        }
        if (parseInt(PIXI.VERSION.split('.').shift()) < 5) {
            console.warn("Old Pixi.js version detected. Features like FPS limiting won't be available. Switch to a version > 5.0.0-rc if possible.")
        }
        /*else if (PIXI.VERSION === '5.0.0-rc') {
            console.warn("This exact version of Pixi.js (5.0.0-rc) is not supported because of a bug. Use a newer version please.")
        }*/
        this.defaultCfg = {
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
        this.cfg = cfg
        this._init()
    }
    _init() {
        this.linesLayer = undefined
        this.particles = []
        this.reinit()
    }
    reinit() {
        this.linesLayer = undefined
        //this.particles = []
        this.useJquery = (typeof this.cfg.useJquery !== 'undefined') ? this.cfg.useJquery : (typeof jQuery !== 'undefined')
        this.divContainer = this.cfg.container.element
        const {width, height} = this._getDivContainerSize()
        this.app = new PIXI.Application(this.cfg.pixiApp)
    }
    get cfg() {
        return (typeof this._cfg === 'undefined') ? this.defaultCfg : this._cfg
    }
    set cfg(cfg) {
        this._cfg = this._mergeDeep(this.cfg, cfg)
        if (typeof this.particles !== 'undefined' && this.particles.length > 0) {
            for (let particle of this.particles) {
                this._particleApplyCfg(particle)
            }
        }
        if (typeof this.app === 'object') {
            this.app.ticker.maxFPS = this.cfg.maxFps
            if (typeof cfg.pixiApp === 'object' && Object.keys(cfg.pixiApp).length > 0) {
                console.warn('Changing pixiApp options during runtime completely reinitializes the pixi app instance.')
                this.destroy(true, true, true, false, false, true, false)
                this.reinit()
                /*this.stopAnimation()
                let renderer = this.app.renderer
                renderer.destroy()
                renderer = new PIXI.Renderer(this.cfg.pixiApp)
                this.app.renderer = renderer
                this.startAnimation()*/
            }
        }
    }
    get divContainer() {
        return this._divContainer
    }
    set divContainer(divContainerArg) {
        this._destroyContainer()
        switch(typeof divContainerArg) {
            case 'undefined':
                this.divContainerIsGenerated = true
                if (this.useJquery) {
                    this._divContainer = $('<div></div>')
                    this._divContainer.css({
                        "position": "absolute",
                        "width": "100%",
                        "height": "100%"
                    })
                    if (this.cfg.container.backgroundCssRule !== null) {
                        this._divContainer.css({
                            "background": this.cfg.container.backgroundCssRule
                        })
                    }
                    $('body').prepend(this._divContainer)
                } else {
                    this._divContainer = document.createElement('div')
                    this._divContainer.style.position = "absolute"
                    this._divContainer.style.width = "100%"
                    this._divContainer.style.height = "100%"
                    if (this.cfg.container.backgroundCssRule !== null) {
                        this._divContainer.style.background = this.cfg.container.backgroundCssRule
                    }
                    document.body.insertBefore(this._divContainer, document.body.firstChild)
                }
                break
            case 'string':
                this.divContainerIsGenerated = false
                if (this.useJquery) {
                    this._divContainer = $(divContainerArg)
                    if (this.cfg.container.backgroundCssRule !== null) {
                        this._divContainer.css({
                            "background": this.cfg.container.backgroundCssRule
                        })
                    }
                } else {
                    this._divContainer = document.querySelector(divContainerArg)
                    if (this.cfg.container.backgroundCssRule !== null) {
                        this._divContainer.style.background = this.cfg.container.backgroundCssRule
                    }
                }
                break
            case 'null':
                this.divContainerIsGenerated = false
                break
            default:
                this.divContainerIsGenerated = false
                if (this.useJquery) {
                    this._divContainer = $(divContainerArg)
                    if (this.cfg.container.backgroundCssRule !== null) {
                        this._divContainer.css({
                            "background": this.cfg.container.backgroundCssRule
                        })
                    }
                } else {
                    this._divContainer = divContainerArg
                    this._divContainer = document.querySelector(divContainerArg)
                    if (this.cfg.container.backgroundCssRule !== null) {
                        this._divContainer.style.background = this.cfg.container.backgroundCssRule
                    }
                }
            this._containerApplyApp()
        }
    }
    get app() {
        return this._app
    }
    set app(app) {
        this.destroy(true, true, true, false, false, false) // ensure app is destroyed
        this._app = app
        app.renderer.autoDensity = true //app.renderer.autoResize = true // depricated
        const originalParticlePositions = this.particles.map(particle=>{return{x:particle.x, y:particle.y}})
        this._containerApplyApp()
        for (let [i,p] of originalParticlePositions.entries()) {
            this.particles[i].x = p.x
            this.particles[i].y = p.y
        }
        this._createParticles()
        this._createLinesLayer()
        this._createDebugOverlay()
        if (this.cfg.autoStartAnimation) {
            this.startAnimation()
        }
    }
    _containerApplyApp() {
        if (typeof this.app === 'object' && typeof this.divContainer === 'object' && this.divContainer !== null) {
            if (this.useJquery) {
                this.divContainer.append(this.app.view)
                $(window).resize(this._resize.bind(this))
            } else {
                this.divContainer.appendChild(this.app.view)
                window.addEventListener('resize', this._resize.bind(this))
            }
            this._resize()
        }
    }
    destroy(destroyApp=true, removeView=true, stageOptions=true, removeContainer=true, forceRemoveContainer=false, removeResizeListener=true, removeParticles=true) {
        if (destroyApp) {
            if (typeof this.app === 'object' && typeof this.app.destroy === 'function') {
                if (!removeParticles && typeof this.particles !== 'undefined') {
                    for (let particle of this.particles) {
                        this.app.stage.removeChild(particle)
                    }
                }
                this.app.destroy(removeView, stageOptions)
                this._app = undefined
            }

            this.linesLayer = undefined
            if (removeParticles && typeof this.particles !== 'undefined') {
                //this.particles = []
            }
            this.debugOverlay = undefined
        }
        if (removeContainer || forceRemoveContainer) {
            this._destroyContainer(forceRemoveContainer)
        }
        if (removeResizeListener || removeContainer || forceRemoveContainer) {
            if (this.useJquery) {
                $(window).off('resize')
            } else {
                window.removeEventListener('resize', this._resize)
            }
        }
    }
    _destroyContainer(force=false) {
        if ((force || this.divContainerIsGenerated) && typeof this.divContainer === 'object' && this.divContainer !== null) {
            if (this.useJquery) {
                this.divContainer.remove()
                this._divContainer = null
            } else {
                this.divContainer.parentNode.removeChild(this.divContainer)
                this._divContainer = null
            }
        }
    }
    _particleApplyCfg(particle) {
        particle.clear()
        particle.beginFill(this.cfg.particles.color)
        particle.drawCircle(0, 0, this.cfg.particles.radius)
        particle.endFill()
    }
    _createParticles() {
        for (let particle of this.particles) {
            this.app.stage.addChild(particle)
        }

        const particlesToAdd = this.cfg.particles.amount-this.particles.length
        const particlesToRemove = 0-particlesToAdd

        for (let i=0; i<particlesToAdd; i++) {
            const randomCoord = this._getRandomCoord()
            const particle = new PIXI.Graphics()
            particle.x = randomCoord.x
            particle.y = randomCoord.y
            particle.direction = this._getRandomDirection()
            particle.alpha = 0
            this._particleApplyCfg(particle)
            this.particles.push(particle)
            this.app.stage.addChild(particle)
        }
        for (let i=0; i<particlesToRemove; i++) {
            this.app.stage.removeChild(this.particles[0])
            this.particles.shift()
        }
    }
    _createLinesLayer() {
        this.linesLayer = new PIXI.Graphics()
        this.app.stage.addChild(this.linesLayer)
    }
    _createDebugOverlay() {
        this.debugOverlay = new PIXI.Text(`Debug Info`, {fill: 0xFFFFFF, strokeThickness: 2, stroke: 0x000000})
        this.visible = false
        this.debugOverlay.x = 0
        this.debugOverlay.y = 0
        this.debugOverlay.lastUpdate = 0
        this.app.stage.addChild(this.debugOverlay)
    }
    _getRandomInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    _getRandomFloat(min, max) {
        return Math.random() * (max - min) + min
    }
    _getDistance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
    }
    _getDistancePercent(p1, p2) {
        const dist = this._getDistance(p1, p2)
        const pdist = this._absoluteDistanceToPercentDistance(dist)
        return pdist
    }
    _absoluteDistanceToPercentDistance(dist) {
        return dist/this.diagonalSize
    }
    _getRandomCoord() {
        return {
            x: this._getRandomFloat(0, this.app.renderer.screen.width),
            y: this._getRandomFloat(0, this.app.renderer.screen.height)
        }
    }
    _getRandomDirection() {
        return Math.random() * Math.PI * 2
    }
    _isCoordInView(coord) {
        return !!(coord.x >= 0-this.cfg.particles.radius && coord.y >= 0-this.cfg.particles.radius && coord.x < this.app.renderer.screen.width+this.cfg.particles.radius && coord.y < this.app.renderer.screen.height+this.cfg.particles.radius)
    }
    _getDivContainerSize() {
        let width, height
        if (this.useJquery) {
            width = this.divContainer.width()
            height = this.divContainer.height()
        } else {
            width = this.divContainer.clientWidth
            height = this.divContainer.clientHeight
        }
        return {width, height}
    }
    _resize() {
        let {width, height} = this._getDivContainerSize()
        if (this.cfg.particles.keepRelativePositionOnResize) {
            const oldWidth = this.app.renderer.screen.width
            const oldHeight = this.app.renderer.screen.height
            this.diagonalSize = this._getDistance({x:0,y:0},{x:this.app.renderer.screen.width,y:this.app.renderer.screen.height})
            for (const particle of this.particles) {
                particle.x = particle.x*width/oldWidth
                particle.y = particle.y*height/oldHeight
            }
        }
        this.app.renderer.resize(width, height)
    }
    startAnimation() {
        this.app.ticker.autoStart = true
        this.app.ticker.speed = 1
        this.app.ticker.maxFPS = this.cfg.maxFps
        if (!this.app.ticker.started) {
            this.app.ticker.start()
        } else {
            this.app.ticker.add( delta => {
                this.linesLayer.clear()
                this.linesLayer.lineStyle(this.cfg.lines.thickness, this.cfg.lines.color, 1)
                const linesDrawn = []
                for (const particle of this.particles) {
                    particle.x += Math.cos(particle.direction) * this.cfg.particles.velocity/this.cfg.maxFps * delta
                    particle.y += Math.sin(particle.direction) * this.cfg.particles.velocity/this.cfg.maxFps * delta
                    if (!this._isCoordInView(particle)) {
                        const newAlpha = particle.alpha - (1000/this.cfg.particles.fadeOutDuration) / (this.cfg.maxFps*delta)
                        particle.alpha = newAlpha<0 ? 0 : newAlpha
                        if (particle.alpha === 0) {
                            const newPos = this._getRandomCoord()
                            particle.x = newPos.x
                            particle.y = newPos.y
                            particle.direction = this._getRandomDirection()
                        }
                    } else {
                        if (particle.alpha !== 1) {
                            const newAlpha = particle.alpha + (1000/this.cfg.particles.fadeInDuration) / (this.cfg.maxFps*delta)
                            particle.alpha = newAlpha>1 ? 1 : newAlpha
                        }
                    }
                    for (const particle2 of this.particles) {
                        const distance = this._getDistancePercent(particle, particle2)
                        const minDistance = this.cfg.lines.minDistance
                        if (distance !== 0 && distance <= minDistance) {
                            const l2 = {p1:{x:particle.x, y: particle.y}, p2:{x:particle2.x, y: particle2.y}}
                            const matchingLines = linesDrawn.filter(l1=>l1.p1.x===l2.p1.x && l1.p1.y===l2.p1.y && l1.p2.x===l2.p2.x && l1.p2.y===l2.p2.y)
                            if (matchingLines.length === 0) {
                                let maxLineAlpha = particle.alpha > particle2.alpha ? particle2.alpha : particle.alpha
                                maxLineAlpha = maxLineAlpha > this.cfg.lines.maxOpacity ? this.cfg.lines.maxOpacity : maxLineAlpha
                                if (this.cfg.lines.distanceBasedTransparency) {
                                    const lineOpactiy = (1-distance/minDistance)*maxLineAlpha
                                    this.linesLayer.lineStyle(this.cfg.lines.thickness, this.cfg.lines.color, lineOpactiy)
                                }
                                this.linesLayer.moveTo(particle.x, particle.y)
                                this.linesLayer.lineTo(particle2.x, particle2.y)
                                linesDrawn.push(l2)
                            }
                        }
                    }
                }

                if (this.cfg.debug.showFps) {
                    const now = performance.now()
                    if (now > this.debugOverlay.lastUpdate+500) {
                        this.debugOverlay.visible = true
                        const fps = Math.round(this.app.ticker.FPS)
                        this.debugOverlay.text = `${fps} FPS`
                        this.debugOverlay.lastUpdate = now
                    }
                } else  {
                    this.debugOverlay.visible = false
                }
            })
        }
    }
    stopAnimation() {
        if (typeof this.app.ticker === 'object') {
            this.app.ticker.stop()
        }
    }
    _isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item))
    }
    _mergeDeep(target, ...sources) {
        if (!sources.length) return target
        const source = sources.shift()
        if (this._isObject(target) && this._isObject(source)) {
            for (const key in source) {
                if (this._isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} })
                        this._mergeDeep(target[key], source[key])
                } else {
                    Object.assign(target, { [key]: source[key] })
                }
            }
        }

        return this._mergeDeep(target, ...sources);
    }
}
