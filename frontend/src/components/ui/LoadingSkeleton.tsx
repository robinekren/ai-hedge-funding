'use client'

import { clsx } from 'clsx'

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-terminal-border/50 rounded',
        className
      )}
      style={style}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-2 w-20" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-3 w-40" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="card">
      <Skeleton className="h-3 w-48 mb-4" />
      <div className="h-48 flex items-end gap-1">
        {Array.from({ length: 30 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${20 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ScreenSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <ChartSkeleton />
      <TableSkeleton />
    </div>
  )
}
