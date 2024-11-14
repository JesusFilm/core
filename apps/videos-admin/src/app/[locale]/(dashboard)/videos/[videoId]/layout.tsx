import { ReactElement } from 'react'

import { EditProvider } from './_EditProvider'

interface VideoViewPageLayoutProps {
  children: ReactElement
}

export default function VideoViewPageLayout({
  children
}: VideoViewPageLayoutProps): ReactElement {
  return <EditProvider>{children}</EditProvider>
}
