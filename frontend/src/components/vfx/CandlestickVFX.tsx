'use client'

import { useEffect, useRef, useCallback } from 'react'

/* ─── CONFIG (tuning knobs) ─── */
const CFG = {
  /** Max candles alive at once (pool size) */
  POOL_SIZE: 120,
  /** Candles spawned per pointer event */
  CLUSTER_SIZE: 3,
  /** Min ms between spawns (~35 spawn/sec cap) */
  SPAWN_THROTTLE_MS: 28,
  /** Total lifetime in ms */
  LIFETIME: 2000,
  /** Phase durations (must sum ≤ LIFETIME) */
  FADE_IN: 200,
  HOLD: 1400,
  FADE_OUT: 400,
  /** Body width range */
  BODY_W_MIN: 4,
  BODY_W_MAX: 10,
  /** Body height range */
  BODY_H_MIN: 14,
  BODY_H_MAX: 38,
  /** Wick extends above/below body */
  WICK_EXTEND_MIN: 4,
  WICK_EXTEND_MAX: 14,
  /** Wick line width */
  WICK_WIDTH: 1.2,
  /** Upward drift in px during lifetime */
  DRIFT_MIN: 2,
  DRIFT_MAX: 6,
  /** Micro jitter amplitude in px */
  JITTER: 0.4,
  /** Base opacity of candle body */
  BODY_OPACITY: 0.50,
  /** Glow blur radius */
  GLOW_RADIUS: 12,
  /** Glow opacity multiplier */
  GLOW_OPACITY: 0.10,
  /** Spawn spread (random offset from cursor) */
  SPREAD: 18,
  /** Scanline gap in px (0 = disabled) */
  SCANLINE_GAP: 4,
  SCANLINE_ALPHA: 0.03,
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

      // Optional scanlines
      if (CFG.SCANLINE_GAP > 0) {
        ctx.fillStyle = `rgba(0,0,0,${CFG.SCANLINE_ALPHA})`
        for (let sy = 0; sy < canvas.height; sy += CFG.SCANLINE_GAP * dpr) {
          ctx.fillRect(0, sy, canvas.width, 1 * dpr)
        }
      }

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
        let blur = 0

        if (age < CFG.FADE_IN) {
          // Fade in
          const t = age / CFG.FADE_IN
          alpha = t
          scale = lerp(0.3, 1, t * t) // ease-in-quad
        } else if (age > CFG.FADE_IN + CFG.HOLD) {
          // Fade out
          const t = (age - CFG.FADE_IN - CFG.HOLD) / CFG.FADE_OUT
          alpha = 1 - t
          blur = lerp(0, 2, t)
        }

        // Drift (upward over lifetime)
        const lifeT = age / CFG.LIFETIME
        const driftY = -c.drift * lifeT

        // Micro jitter during hold phase
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
        const wickAlpha = Math.min(bodyAlpha * 1.3, 0.7)

        // Apply blur during fade-out
        if (blur > 0) {
          ctx.filter = `blur(${blur * dpr}px)`
        }

        // Glow (soft shadow behind candle)
        ctx.shadowColor = rgba(bodyColor, CFG.GLOW_OPACITY * alpha)
        ctx.shadowBlur = CFG.GLOW_RADIUS * dpr
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4 * dpr

        // Wick (thin vertical line)
        ctx.strokeStyle = rgba(wickColor, wickAlpha)
        ctx.lineWidth = ww
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(px, py - bh / 2 - wUp)
        ctx.lineTo(px, py + bh / 2 + wDown)
        ctx.stroke()

        // Body (filled rectangle, centered)
        ctx.fillStyle = rgba(bodyColor, bodyAlpha)
        ctx.fillRect(px - bw / 2, py - bh / 2, bw, bh)

        // Bright edge (top or bottom 1px highlight)
        ctx.fillStyle = rgba(wickColor, bodyAlpha * 0.6)
        const edgeH = Math.max(1 * dpr, bh * 0.06)
        if (c.isGreen) {
          // Green candle: bright top edge
          ctx.fillRect(px - bw / 2, py - bh / 2, bw, edgeH)
        } else {
          // Red candle: bright bottom edge
          ctx.fillRect(px - bw / 2, py + bh / 2 - edgeH, bw, edgeH)
        }

        // Reset shadow + filter
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        if (blur > 0) {
          ctx.filter = 'none'
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
