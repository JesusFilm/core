import { ReactElement } from 'react'

type SkeletonDimension = number | string

interface SkeletonProps {
  height?: SkeletonDimension
  width?: SkeletonDimension
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
