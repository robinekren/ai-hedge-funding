'use client'

import { clsx } from 'clsx'
import { useStore } from '@/store/useStore'

const STEPS = [
  {
    title: 'Welcome to AI Hedge Funding',
    description: 'The world\'s most autonomous AI-driven hedge fund dashboard. Let\'s walk through the key features.',
    highlight: 'portfolio',
  },
  {
    title: 'Portfolio Overview',
    description: 'Track your total portfolio value, equity curve, and top-performing strategies in real-time.',
    highlight: 'portfolio',
  },
  {
    title: 'Live Trades & Signals',
    description: 'Monitor open positions, pending proposals, and Reddit signal intelligence that powers our alpha.',
    highlight: 'trades',
  },
  {
    title: '8 AI Agents',
    description: 'Each agent has a specialized role — from harvesting signals to executing trades at 50ms speed.',
    highlight: 'agents',
  },
  {
    title: 'Risk Monitor',
    description: 'Real-time drawdown tracking, correlation heatmaps, VaR analysis, and the kill switch that protects your capital.',
    highlight: 'risk',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'Press Ctrl+K (or Cmd+K) for the command palette. Navigate with keyboard shortcuts 1-9.',
    highlight: 'portfolio',
  },
  {
    title: 'You\'re Ready',
    description: 'The system is live. Monitor, control, and scale your AI hedge fund from this dashboard.',
    highlight: 'portfolio',
  },
]

export default function Onboarding() {
  const { onboardingStep, setOnboardingStep, setOnboardingComplete, setActiveScreen } = useStore()

  const step = STEPS[onboardingStep]
  const isLast = onboardingStep === STEPS.length - 1

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
                i <= onboardingStep ? 'bg-terminal-green' : 'bg-terminal-border'
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
              {onboardingStep + 1}/{STEPS.length}
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
