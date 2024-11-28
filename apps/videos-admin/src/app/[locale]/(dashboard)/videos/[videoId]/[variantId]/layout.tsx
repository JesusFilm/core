import { ReactElement } from 'react'

import { EditProvider } from '../_EditProvider'

interface VariantViewPageLayoutProps {
  children: ReactElement
}

export default function VideoViewPageLayout({
  children
}: VariantViewPageLayoutProps): ReactElement {
  return <EditProvider>{children}</EditProvider>
}
