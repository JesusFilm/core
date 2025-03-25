import { ReactElement } from 'react'

interface CollectionsPageContentProps {
  children?: ReactElement[]
}

export function CollectionsPageContent({
  children
}: CollectionsPageContentProps): ReactElement {
  return (
    <div
      className="bg-stone-900 text-white  font-sans"
      data-testid="CollectionPage"
    >
      <div
        className="w-full mx-auto z-1 "
        data-testid="CollectionPageBlurFilter"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'brightness(.6) blur(40px)'
        }}
      >
        <div className="pt-7 w-full" data-testid="CollectionPageContainer">
          <div
            className="max-w-[1920px] mx-auto px-4"
            data-testid="CollectionPageContent"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
