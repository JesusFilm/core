import { createReadStream } from 'node:fs'
import { join } from 'node:path'

import axios from 'axios'
import { vi } from 'vitest'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

vi.mock('axios')

describe('blocklist/service', () => {
  it('should get blocklist and push to api-media', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: createReadStream(join(__dirname, 'service.fixture.txt'))
    })

    await service()

    expect(axios.get).toHaveBeenCalledWith(
      'https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt',
      { responseType: 'stream' }
    )
    expect(prismaMock.shortLinkBlocklistDomain.upsert).toHaveBeenCalledWith({
      create: { hostname: 'site1.com' },
      update: {},
      where: { hostname: 'site1.com' }
    })
    expect(prismaMock.shortLinkBlocklistDomain.upsert).toHaveBeenCalledWith({
      create: { hostname: 'site2.com' },
      update: {},
      where: { hostname: 'site2.com' }
    })
    expect(prismaMock.shortLinkBlocklistDomain.upsert).toHaveBeenCalledTimes(2)
  })
})
