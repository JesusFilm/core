import { ReactElement } from 'react'

interface CollectionsPageContentProps {
  children?: ReactElement
}

export function CollectionsPageContent({
  children
}: CollectionsPageContentProps): ReactElement {
  return (
    <div
      className="bg-stone-900 text-white min-h-screen font-sans"
      data-testid="CollectionPage"
    >
      <div
        className="w-full mx-auto z-1 border-t border-stone-500/30"
        data-testid="CollectionPageBlurFilter"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'brightness(.6) blur(40px)'
        }}
      >
        <div
          className="pt-7 w-full max-w-[1920px]"
          data-testid="CollectionPageContainer"
        >
          <div className="min-h-screen" data-testid="CollectionPageContent">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
