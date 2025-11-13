import { ReactElement, ReactNode } from 'react'

import { ContentPageBlurFilter } from '../../ContentPageBlurFilter'

interface PageCollectionsContentProps {
  children?: ReactNode
}

export function PageCollectionsContent({
  children
}: PageCollectionsContentProps): ReactElement {
  return (
    <ContentPageBlurFilter>
      <div
        className="responsive-container pb-20 pt-10 text-white"
        data-testid="CollectionPageContent"
      >
        {children}
      </div>
    </ContentPageBlurFilter>
  )
}
