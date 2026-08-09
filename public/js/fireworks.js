/**
 * 创建烟花
 * @param config
 */
function createFireworks({ config, anime }) {
  window.destroyFireworks?.()

  const canvasElement = document.createElement('canvas')
  canvasElement.id = 'fireworks'
  canvasElement.className = 'fireworks'
  document.body.appendChild(canvasElement)

  const defaultConfig = {
    colors: config?.colors,
    numberOfParticules: 30,
    orbitRadius: {
      min: 80,
      max: 160
    },
    circleRadius: {
      min: 15,
      max: 30
    },
    diffuseRadius: {
      min: 80,
      max: 160
    },
    animeDuration: {
      min: 1000,
      max: 1800
    }
  }
  config = Object.assign(defaultConfig, config)

  let pointerX = 0
  let pointerY = 0
  const runningAnimations = new Set()

  // sky blue
  const colors = config.colors

  const canvasEl = document.querySelector('.fireworks')
  const ctx = canvasEl.getContext('2d')

  /**
   * 设置画布尺寸
   */
  function setCanvasSize(canvasEl) {
    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight
    canvasEl.style.width = `${window.innerWidth}px`
    canvasEl.style.height = `${window.innerHeight}px`
  }

  /**
   * update pointer
   * @param {TouchEvent} e
   */
  function updateCoords(e) {
    pointerX =
      e.clientX ||
      (e?.touches[0] ? e.touches[0].clientX : e.changedTouches[0].clientX)
    pointerY =
      e.clientY ||
      (e?.touches[0] ? e.touches[0].clientY : e.changedTouches[0].clientY)
  }

  function setParticuleDirection(p) {
    const angle = (anime.random(0, 360) * Math.PI) / 180
    const value = anime.random(
      config.diffuseRadius.min,
      config.diffuseRadius.max
    )
    const radius = [-1, 1][anime.random(0, 1)] * value
    return {
      x: p.x + radius * Math.cos(angle),
      y: p.y + radius * Math.sin(angle)
    }
  }

  /**
   * 在指定位置创建粒子
   * @param {number} x
   * @param {number} y
   * @returns
   */
  function createParticule(x, y) {
    const p = {
      x,
      y,
      color: `rgba(${colors[anime.random(0, colors.length - 1)]},${anime.random(
        0.2,
        0.8
      )})`,
      radius: anime.random(config.circleRadius.min, config.circleRadius.max),
      endPos: null,
      draw() {}
    }
    p.endPos = setParticuleDirection(p)
    p.draw = function () {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    return p
  }

  function createCircle(x, y) {
    const p = {
      x,
      y,
      color: '#FFF',
      radius: 0.1,
      alpha: 0.5,
      lineWidth: 6,
      draw() {}
    }
    p.draw = function () {
      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true)
      ctx.lineWidth = p.lineWidth
      ctx.strokeStyle = p.color
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    return p
  }

  function renderParticule(anim) {
    for (let i = 0; i < anim.animatables.length; i++) {
      anim.animatables[i].target.draw()
    }
  }

  function animateParticules(x, y) {
    const circle = createCircle(x, y)
    const particules = []
    for (let i = 0; i < config.numberOfParticules; i++) {
      particules.push(createParticule(x, y))
    }

    const animation = anime
      .timeline()
      .add({
        targets: particules,
        x(p) {
          return p.endPos.x
        },
        y(p) {
          return p.endPos.y
        },
        radius: 0.1,
        duration: anime.random(
          config.animeDuration.min,
          config.animeDuration.max
        ),
        easing: 'easeOutExpo',
        update: renderParticule
      })
      .add(
        {
          targets: circle,
          radius: anime.random(config.orbitRadius.min, config.orbitRadius.max),
          lineWidth: 0,
          alpha: {
            value: 0,
            easing: 'linear',
            duration: anime.random(600, 800)
          },
          duration: anime.random(1200, 1800),
          easing: 'easeOutExpo',
          update: renderParticule
        },
        0
      )

    runningAnimations.add(animation)
    if (animation.finished) {
      animation.finished.then(() => runningAnimations.delete(animation)).catch(() => {})
    }
  }

  const render = anime({
    duration: Infinity,
    update: () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    }
  })

  const handleMouseDown = e => {
    render.play()
    updateCoords(e)
    animateParticules(pointerX, pointerY)
  }
  const handleResize = () => {
    setCanvasSize(canvasEl)
  }
  const destroy = () => {
    render.pause()
    runningAnimations.forEach(animation => animation.pause())
    runningAnimations.clear()
    document.removeEventListener('mousedown', handleMouseDown, false)
    window.removeEventListener('resize', handleResize, false)
    canvasElement.parentNode?.removeChild(canvasElement)
    if (window.destroyFireworks === destroy) {
      delete window.destroyFireworks
    }
  }

  window.destroyFireworks = destroy
  document.addEventListener('mousedown', handleMouseDown, false)

  setCanvasSize(canvasEl)
  window.addEventListener('resize', handleResize, false)
}

window.createFireworks = createFireworks
