'use client'

import { useEffect, useRef, useCallback } from 'react'

/* ─── CONFIG (tuning knobs) ─── */
const CFG = {
  POOL_SIZE: 40,
  CLUSTER_SIZE: 1,
  SPAWN_THROTTLE_MS: 50,
  LIFETIME: 1200,
  FADE_IN: 150,
  HOLD: 700,
  FADE_OUT: 350,
  BODY_W_MIN: 8,
  BODY_W_MAX: 16,
  BODY_H_MIN: 24,
  BODY_H_MAX: 56,
  WICK_EXTEND_MIN: 8,
  WICK_EXTEND_MAX: 22,
  WICK_WIDTH: 1.8,
  DRIFT_MIN: 2,
  DRIFT_MAX: 5,
  JITTER: 0.3,
  BODY_OPACITY: 0.45,
  SPREAD: 14,
} as const

/* ─── TYPES ─── */
interface Candle {
  alive: boolean
  x: number
  y: number
  spawnY: number
  bodyW: number
  bodyH: number
  wickUp: number
  wickDown: number
  drift: number
  jitterSeed: number
  isGreen: boolean
  born: number
}

/* ─── COLORS ─── */
const GREEN_BODY = [16, 185, 129] as const
const RED_BODY = [239, 68, 68] as const
const GREEN_WICK = [20, 210, 150] as const
const RED_WICK = [255, 90, 85] as const

function rgba(c: readonly number[], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/* ─── COMPONENT ─── */
export default function CandlestickVFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poolRef = useRef<Candle[]>([])
  const rafRef = useRef<number>(0)
  const lastSpawnRef = useRef<number>(0)
  const reducedMotionRef = useRef(false)
  const dprRef = useRef(1)

  // Initialize pool
  const getPool = useCallback(() => {
    if (poolRef.current.length === 0) {
      poolRef.current = Array.from({ length: CFG.POOL_SIZE }, () => ({
        alive: false, x: 0, y: 0, spawnY: 0,
        bodyW: 0, bodyH: 0, wickUp: 0, wickDown: 0,
        drift: 0, jitterSeed: 0, isGreen: true, born: 0,
      }))
    }
    return poolRef.current
  }, [])

  const spawn = useCallback((cx: number, cy: number) => {
    const pool = getPool()
    const now = performance.now()
    let spawned = 0

    for (let i = 0; i < pool.length && spawned < CFG.CLUSTER_SIZE; i++) {
      if (!pool[i].alive) {
        const c = pool[i]
        c.alive = true
        c.x = cx + rand(-CFG.SPREAD, CFG.SPREAD)
        c.y = cy + rand(-CFG.SPREAD * 0.6, CFG.SPREAD * 0.6)
        c.spawnY = c.y
        c.bodyW = rand(CFG.BODY_W_MIN, CFG.BODY_W_MAX)
        c.bodyH = rand(CFG.BODY_H_MIN, CFG.BODY_H_MAX)
        c.wickUp = rand(CFG.WICK_EXTEND_MIN, CFG.WICK_EXTEND_MAX)
        c.wickDown = rand(CFG.WICK_EXTEND_MIN, CFG.WICK_EXTEND_MAX)
        c.drift = rand(CFG.DRIFT_MIN, CFG.DRIFT_MAX)
        c.jitterSeed = Math.random() * Math.PI * 2
        c.isGreen = Math.random() > 0.5
        c.born = now
        spawned++
      }
    }
  }, [getPool])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Reduced motion check
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = mq.matches
    const mqHandler = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches }
    mq.addEventListener('change', mqHandler)

    // DPR-aware sizing
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    // Pointer handler (desktop only)
    const isMobile = 'ontouchstart' in window && window.innerWidth < 768
    const onPointer = (e: PointerEvent) => {
      if (reducedMotionRef.current) return
      if (isMobile) return
      const now = performance.now()
      if (now - lastSpawnRef.current < CFG.SPAWN_THROTTLE_MS) return
      lastSpawnRef.current = now
      spawn(e.clientX, e.clientY)
    }
    // Lighter touch handling for mobile (1 candle, heavily throttled)
    const onTouch = (e: TouchEvent) => {
      if (reducedMotionRef.current) return
      const now = performance.now()
      if (now - lastSpawnRef.current < 80) return
      lastSpawnRef.current = now
      const t = e.touches[0]
      if (t) spawn(t.clientX, t.clientY)
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    if (isMobile) {
      window.addEventListener('touchmove', onTouch, { passive: true })
    }

    // Render loop
    const ctx = canvas.getContext('2d', { alpha: true })!
    const pool = getPool()

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw)
      const dpr = dprRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < pool.length; i++) {
        const c = pool[i]
        if (!c.alive) continue

        const age = now - c.born
        if (age > CFG.LIFETIME) {
          c.alive = false
          continue
        }

        // Phase calculation
        let alpha = 1
        let scale = 1

        if (age < CFG.FADE_IN) {
          const t = age / CFG.FADE_IN
          alpha = t
          scale = lerp(0.4, 1, t)
        } else if (age > CFG.FADE_IN + CFG.HOLD) {
          const t = (age - CFG.FADE_IN - CFG.HOLD) / CFG.FADE_OUT
          alpha = 1 - t * t
        }

        const lifeT = age / CFG.LIFETIME
        const driftY = -c.drift * lifeT
        const jitterX = Math.sin(now * 0.003 + c.jitterSeed) * CFG.JITTER
        const jitterY = Math.cos(now * 0.004 + c.jitterSeed * 1.3) * CFG.JITTER

        const px = (c.x + jitterX) * dpr
        const py = (c.spawnY + driftY + jitterY) * dpr
        const bw = c.bodyW * scale * dpr
        const bh = c.bodyH * scale * dpr
        const wUp = c.wickUp * scale * dpr
        const wDown = c.wickDown * scale * dpr
        const ww = CFG.WICK_WIDTH * dpr

        const bodyColor = c.isGreen ? GREEN_BODY : RED_BODY
        const wickColor = c.isGreen ? GREEN_WICK : RED_WICK
        const bodyAlpha = CFG.BODY_OPACITY * alpha
        const wickAlpha = Math.min(bodyAlpha * 1.4, 0.65)

        // Soft glow (wider, semi-transparent body behind)
        ctx.fillStyle = rgba(bodyColor, bodyAlpha * 0.15)
        ctx.fillRect(px - bw / 2 - 3 * dpr, py - bh / 2 - 2 * dpr, bw + 6 * dpr, bh + 4 * dpr)

        // Wick
        ctx.strokeStyle = rgba(wickColor, wickAlpha)
        ctx.lineWidth = ww
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(px, py - bh / 2 - wUp)
        ctx.lineTo(px, py + bh / 2 + wDown)
        ctx.stroke()

        // Body
        ctx.fillStyle = rgba(bodyColor, bodyAlpha)
        ctx.fillRect(px - bw / 2, py - bh / 2, bw, bh)

        // Bright edge highlight
        ctx.fillStyle = rgba(wickColor, bodyAlpha * 0.5)
        const edgeH = Math.max(1 * dpr, bh * 0.07)
        if (c.isGreen) {
          ctx.fillRect(px - bw / 2, py - bh / 2, bw, edgeH)
        } else {
          ctx.fillRect(px - bw / 2, py + bh / 2 - edgeH, bw, edgeH)
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchmove', onTouch)
      mq.removeEventListener('change', mqHandler)
      // Reset pool
      pool.forEach(c => { c.alive = false })
    }
  }, [spawn, getPool])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[1] pointer-events-none"
      style={{ willChange: 'transform' }}
    />
  )
}
