export function pointerForce(x, y, pointerX, pointerY, reach = 200, out = [0, 0]) {
  const dx = pointerX - x
  const dy = pointerY - y
  const distance = Math.hypot(dx, dy)
  if (!distance || distance >= reach) {
    out[0] = 0
    out[1] = 0
    return out
  }
  const strength = (1 - distance / reach) * 0.09
  out[0] = dx / distance * strength
  out[1] = dy / distance * strength
  return out
}

if (typeof document !== 'undefined') {
  const field = document.querySelector('#playground')
  const canvas = document.querySelector('#playground-canvas')
  const context = canvas?.getContext('2d', { alpha: true })

  if (field && canvas && context) {
    const pointer = { x: 0, y: 0, active: false }
    const force = [0, 0]
    const ripples = []
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    let particles = []
    let width = 0
    let height = 0
    let frame = 0
    let inView = true

    function seedParticles() {
      const count = width < 600 ? 72 : 112
      const clusterCount = width < 600 ? 5 : 8
      const spread = width < 600 ? 105 : 145
      const centers = Array.from({ length: clusterCount }, () => ({
        x: width * (0.1 + Math.random() * 0.8),
        y: height * (0.1 + Math.random() * 0.8),
      }))

      particles = Array.from({ length: count }, (_, index) => {
        const center = centers[index % clusterCount]
        const angle = Math.random() * Math.PI * 2
        const radius = Math.sqrt(Math.random()) * spread
        return {
          x: Math.max(4, Math.min(width - 4, center.x + Math.cos(angle) * radius)),
          y: Math.max(4, Math.min(height - 4, center.y + Math.sin(angle) * radius)),
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          radius: Math.random() * 1.7 + 0.7,
        }
      })
    }

    function render(update = true) {
      context.clearRect(0, 0, width, height)
      const linkDistance = width < 600 ? 112 : 128

      for (const particle of particles) {
        if (update) {
          if (pointer.active) {
            pointerForce(particle.x, particle.y, pointer.x, pointer.y, 210, force)
            particle.vx += force[0]
            particle.vy += force[1]
          }
          particle.vx *= 0.992
          particle.vy *= 0.992
          particle.x += particle.vx
          particle.y += particle.vy
          if (particle.x < 0 || particle.x > width) particle.vx *= -1
          if (particle.y < 0 || particle.y > height) particle.vy *= -1
          particle.x = Math.max(0, Math.min(width, particle.x))
          particle.y = Math.max(0, Math.min(height, particle.y))
        }
      }

      // ponytail: O(n²) stays cheap below 112 stars; use a spatial grid only if density grows.
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance > linkDistance) continue
          context.beginPath()
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.strokeStyle = `rgba(200,245,96,${(1 - distance / linkDistance) * 0.19})`
          context.stroke()
        }

        if (pointer.active) {
          const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y)
          if (distance < 165) {
            context.beginPath()
            context.moveTo(a.x, a.y)
            context.lineTo(pointer.x, pointer.y)
            context.strokeStyle = `rgba(240,241,233,${(1 - distance / 165) * 0.22})`
            context.stroke()
          }
        }

        context.beginPath()
        context.arc(a.x, a.y, a.radius, 0, Math.PI * 2)
        context.fillStyle = a.radius > 1.7 ? '#c8f560' : 'rgba(240,241,233,.7)'
        context.fill()
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]
        ripple.radius += 3.5
        ripple.opacity -= 0.018
        context.beginPath()
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2)
        context.strokeStyle = `rgba(200,245,96,${Math.max(0, ripple.opacity)})`
        context.stroke()
        if (ripple.opacity <= 0) ripples.splice(i, 1)
      }
    }

    function schedule() {
      if (!frame && !reducedMotion && inView && !document.hidden) frame = requestAnimationFrame(draw)
    }

    function draw() {
      frame = 0
      render()
      schedule()
    }

    function resize() {
      const bounds = field.getBoundingClientRect()
      const ratio = Math.min(devicePixelRatio, 1.5)
      width = Math.round(bounds.width)
      height = Math.round(bounds.height)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      seedParticles()
      render(false)
      schedule()
    }

    function movePointer(event) {
      const bounds = field.getBoundingClientRect()
      pointer.x = event.clientX - bounds.left
      pointer.y = event.clientY - bounds.top
      pointer.active = true
    }

    field.addEventListener('pointermove', movePointer, { passive: true })
    field.addEventListener('pointerleave', () => { pointer.active = false }, { passive: true })
    field.addEventListener('pointerdown', event => {
      movePointer(event)
      ripples.push({ x: pointer.x, y: pointer.y, radius: 8, opacity: 0.8 })
      if (ripples.length > 3) ripples.shift()
      for (const particle of particles) {
        const dx = particle.x - pointer.x
        const dy = particle.y - pointer.y
        const distance = Math.hypot(dx, dy) || 1
        if (distance >= 220) continue
        const push = (1 - distance / 220) * 2
        particle.vx += dx / distance * push
        particle.vy += dy / distance * push
      }
    }, { passive: true })

    new ResizeObserver(resize).observe(field)
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (!inView && frame) cancelAnimationFrame(frame)
      if (!inView) frame = 0
      else schedule()
    }).observe(field)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && frame) cancelAnimationFrame(frame)
      frame = 0
      schedule()
    })

    resize()
  }
}
