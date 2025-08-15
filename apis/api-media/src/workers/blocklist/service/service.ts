import readline from 'node:readline'

import axios from 'axios'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

export async function service(_logger?: Logger): Promise<void> {
  const response = await axios.get(
    'https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt',
    { responseType: 'stream' }
  )
  const stream = readline.createInterface({
    input: response.data,
    crlfDelay: Infinity
  })

  for await (const hostname of stream) {
    if (hostname.startsWith('#')) continue

    await prisma.shortLinkBlocklistDomain.upsert({
      where: { hostname },
      create: { hostname },
      update: {}
    })
  }
}
