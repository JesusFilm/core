import { PrismaClient, Service } from '.prisma/api-media-client'

import { addVercelDomain } from '../../src/schema/shortLink/shortLinkDomain/shortLinkDomain.service'

const prisma = new PrismaClient()
export async function shortLinkDomain(): Promise<void> {
  const id = '898626fa-6204-4b53-ae9d-12093831c61d'

  if (process.env['JOURNEYS_SHORTLINK_DOMAIN'] == null) {
    throw new Error('Domain not set')
  }
  const hostname = process.env['JOURNEYS_SHORTLINK_DOMAIN']

  await prisma.shortLinkDomain.upsert({
    where: { id },
    update: {},
    create: {
      id,
      hostname,
      services: [Service.apiJourneys],
      apexName: (await addVercelDomain(hostname)).apexName
    }
  })
}
