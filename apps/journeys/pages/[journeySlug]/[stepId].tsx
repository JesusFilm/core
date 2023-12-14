import type { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

interface Repo {
  name: string
  stargazers_count: number
}

export default function JourneyStep(): ReactElement {
  const router = useRouter()
  const stepId = router.query.stepId
  const journeySlug = router.query.journeySlug

  const blocks = transformer(journey?.blocks as TreeBlock[])
  return (
    <>
      <BlockRenderer block={} />
    </>
  )
}
