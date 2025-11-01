import { useRouter } from 'next/router'
import { type ReactNode, useRef } from 'react'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

export interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter()
  const nodeRef = useRef<HTMLDivElement | null>(null)

  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={router.asPath}
        classNames="watch-page"
        timeout={{ enter: 600, exit: 360 }}
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="watch-page-transition">
          {children}
        </div>
      </CSSTransition>
    </SwitchTransition>
  )
}
