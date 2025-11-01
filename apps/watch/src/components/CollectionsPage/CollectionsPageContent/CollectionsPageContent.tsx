import { ReactElement, ReactNode } from 'react'

interface CollectionsPageContentProps {
  children?: ReactNode[]
}

export function CollectionsPageContent({
  children
}: CollectionsPageContentProps): ReactElement {
  return (
    <div
      className="bg-stone-900 text-white font-sans"
      data-testid="CollectionPage"
    >
      <div
        className="max-w-[1920px] mx-auto sticky top-0 h-[100svh]"
        data-testid="CollectionPageBlurFilter"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'brightness(.6) blur(40px)'
        }}
      ></div>
      <div className="w-full mt-[-100svh]" data-testid="CollectionPageContainer">
        <div
          className="max-w-[1920px] mx-auto pb-40"
          data-testid="CollectionPageContent"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
