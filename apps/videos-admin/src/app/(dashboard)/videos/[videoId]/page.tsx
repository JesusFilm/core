'use client'

import DefaultTab from './metadata/page'

export default function TabsPage({ params }: { params: { videoId: string } }) {
  return <DefaultTab params={params} />
}
