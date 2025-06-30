import { ReactElement } from 'react'

interface CollectionsPageContentProps {
  children?: ReactElement[]
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
        className="max-w-[1920px] mx-auto sticky h-[100vh] top-0"
        data-testid="CollectionPageBlurFilter"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'brightness(.6) blur(40px)'
        }}
      ></div>
      <div className="w-full mt-[-100vh]" data-testid="CollectionPageContainer">
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
