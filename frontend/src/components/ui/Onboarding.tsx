'use client'

import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const STEPS = [
  {
    title: 'Welcome to AI Hedge Funding',
    description: 'Your autonomous AI hedge fund dashboard. Navigate screens with keys 1-9, open the command palette with Ctrl+K. Approve trades, monitor risk, and control all 8 AI agents from here.',
    highlight: 'portfolio',
  },
  {
    title: 'You\'re Ready',
    description: 'The system is live. Start on the Portfolio Overview, explore Live Trades, Signal Feed, and Risk Monitor. Full control at your fingertips.',
    highlight: 'portfolio',
  },
]

export default function Onboarding() {
  const { onboardingStep, setOnboardingStep, setOnboardingComplete, setActiveScreen } = useStore()

  const safeStep = Math.min(Math.max(onboardingStep, 0), STEPS.length - 1)
  const step = STEPS[safeStep]
  const isLast = safeStep === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      setOnboardingComplete(true)
    } else {
      const nextStep = onboardingStep + 1
      setOnboardingStep(nextStep)
      setActiveScreen(STEPS[nextStep].highlight as any)
    }
  }

  const handleSkip = () => {
    setOnboardingComplete(true)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center pb-8 pointer-events-none">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 pointer-events-auto" />

      {/* Card */}
      <div className="relative pointer-events-auto w-full max-w-lg mx-4 bg-terminal-surface border border-terminal-green/30 rounded-xl shadow-2xl shadow-green-glow p-6">
        {/* Progress */}
        <div className="flex gap-1 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={clsx(
                'h-1 flex-1 rounded-full transition-colors',
                i <= safeStep ? 'bg-terminal-green' : 'bg-terminal-border'
              )}
            />
          ))}
        </div>

        <h3 className="text-terminal-green font-bold text-lg mb-2">{step.title}</h3>
        <p className="text-terminal-text-dim text-sm leading-relaxed">{step.description}</p>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handleSkip}
            className="text-terminal-text-muted text-xs hover:text-terminal-text transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-3">
            <span className="text-terminal-text-muted text-xs">
              {safeStep + 1}/{STEPS.length}
            </span>
            <button onClick={handleNext} className="btn-primary text-sm">
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
