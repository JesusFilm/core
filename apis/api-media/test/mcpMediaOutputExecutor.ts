import { PrismaClient as JourneysDatabase } from '@core/prisma/journeys/client'
import { PrismaClient as MediaDatabase } from '@core/prisma/media/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { createMediaJobs } from '../src/lib/mcpMediaJobs'

process.once('message', (message) => {
  const input = message as {
    config: Parameters<typeof createMediaJobs>[0]
    context: Parameters<ReturnType<typeof createMediaJobs>['holdOutput']>[0]
    jobId: string
    mediaUrl: string
    journeysUrl: string
  }
  const media = new MediaDatabase({
    adapter: new PrismaPg({ connectionString: input.mediaUrl })
  })
  const journeys = new JourneysDatabase({
    adapter: new PrismaPg({ connectionString: input.journeysUrl })
  })
  const unused = async (): Promise<never> => {
    throw new Error('Output executor must not touch storage or provider')
  }
  const jobs = createMediaJobs(
    input.config,
    media,
    journeys,
    { put: unused, get: unused, removeJob: unused },
    { dispatch: unused, status: unused }
  )
  void jobs.holdOutput(input.context, input.jobId).then(
    (permitId) => process.send?.({ permitId }),
    () => process.send?.({ error: 'Output acceptance failed' })
  )
})
