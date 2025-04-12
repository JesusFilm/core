'use client'

import DefaultTab from './metadata/layout'

export default function TabsPage({ params }: { params: { videoId: string } }) {
  return <DefaultTab params={params} />
}
