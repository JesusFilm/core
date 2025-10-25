import type { ReactElement } from 'react'

export function AnimatedLoadingText(): ReactElement {
  return (
    <span className="inline-flex items-center">
      <span className="animate-pulse">R</span>
      <span className="animate-pulse" style={{ animationDelay: '0.1s' }}>u</span>
      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>n</span>
      <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>n</span>
      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>i</span>
      <span className="animate-pulse" style={{ animationDelay: '0.5s' }}>n</span>
      <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>g</span>
      <span className="animate-pulse" style={{ animationDelay: '0.7s' }}>.</span>
      <span className="animate-pulse" style={{ animationDelay: '0.8s' }}>.</span>
      <span className="animate-pulse" style={{ animationDelay: '0.9s' }}>.</span>
    </span>
  )
}
