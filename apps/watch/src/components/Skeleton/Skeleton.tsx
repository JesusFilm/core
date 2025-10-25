import { ReactElement } from 'react'

interface SkeletonProps {
  height?: number
  width?: number
  className?: string
}

export function Skeleton({
  height = 5,
  width = 5,
  className = ''
}: SkeletonProps): ReactElement {
  return (
    <div
      className={`rounded-lg animate-pulse bg-text-secondary ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  )
}
