import { ReactElement } from 'react'

interface SkeletonProps {
  height?: number | string
  width?: number | string
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
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}
