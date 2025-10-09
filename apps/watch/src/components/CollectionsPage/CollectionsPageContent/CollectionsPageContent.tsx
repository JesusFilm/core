import { ReactElement, ReactNode } from 'react'

interface CollectionsPageContentProps {
  children?: ReactNode[]
}

export function CollectionsPageContent({
  children
}: CollectionsPageContentProps): ReactElement {
  return (
    <div
      className="bg-stone-900 font-sans text-white"
      data-testid="CollectionPage"
    >
      <div
        className="sticky top-0 mx-auto h-[100vh] max-w-[1920px]"
        data-testid="CollectionPageBlurFilter"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'brightness(.6) blur(40px)'
        }}
      ></div>
      <div className="mt-[-100vh] w-full" data-testid="CollectionPageContainer">
        <div
          className="mx-auto max-w-[1920px] pb-40"
          data-testid="CollectionPageContent"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
