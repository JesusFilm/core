import { ReactElement, ReactNode } from 'react'

interface ContentPageBlurFilterProps {
  children: ReactNode
}

export function ContentPageBlurFilter({
  children
}: ContentPageBlurFilterProps): ReactElement {
  return (
    <div
      className="text-white relative font-sans"
      data-testid="ContentPage"
      style={{ minHeight: '100svh' }}
    >
      <div
        className="max-w-[1920px] z-[1] mx-auto sticky h-screen top-0 bg-black/10"
        data-testid="ContentPageBlurFilter"
        style={{ backdropFilter: 'brightness(.6) blur(40px)' }}
      />
      <div
        className="max-w-[1920px] mx-auto overflow-hidden relative z-10"
        data-testid="ContentPageContainer"
        style={{ marginTop: '-100vh' }}
      >
        {children}
      </div>
    </div>
  )
}
