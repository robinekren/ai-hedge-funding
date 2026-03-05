'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackLabel?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card border border-terminal-red/30 p-6">
          <h3 className="text-terminal-red font-bold text-sm mb-2">
            {this.props.fallbackLabel || 'Component'} — Error
          </h3>
          <p className="text-terminal-text-dim text-xs mb-3">
            Something went wrong rendering this section.
          </p>
          <p className="text-terminal-text-muted text-[10px] font-mono mb-4">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-outline text-xs"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
