import { ReactElement, ReactNode } from 'react'

interface ContentPageBlurFilterProps {
  children: ReactNode
}

export function ContentPageBlurFilter({
  children
}: ContentPageBlurFilterProps): ReactElement {
  return (
    <div
      className="relative bg-[#131111] font-sans text-white"
      data-testid="ContentPage"
      style={{ minHeight: '100svh' }}
    >
      <div
        className="sticky top-0 z-[1] mx-auto h-screen max-w-[1920px] bg-black/10"
        data-testid="ContentPageBlurFilter"
        style={{ backdropFilter: 'brightness(.6) blur(40px)' }}
      />
      <div
        className="mx-auto max-w-[1920px] overflow-hidden"
        data-testid="ContentPageContainer"
        style={{ marginTop: '-100vh' }}
      >
        {children}
      </div>
    </div>
  )
}
