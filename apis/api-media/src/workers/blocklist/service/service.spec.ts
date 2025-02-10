import { createReadStream } from 'node:fs'
import { join } from 'node:path'

import moxios from 'moxios'

import { prismaMock } from '../../../../test/prismaMock'

import { service } from './service'

describe('blocklist/service', () => {
  beforeEach(() => {
    // import and pass your custom axios instance to this method
    moxios.install()
  })

  afterEach(() => {
    // import and pass your custom axios instance to this method
    moxios.uninstall()
  })

  it('should get blocklist and push to api-media', async () => {
    moxios.stubRequest(
      'https://blocklistproject.github.io/Lists/alt-version/everything-nl.txt',
      {
        status: 200,
        response: createReadStream(join(__dirname, 'service.fixture.txt'))
      }
    )
    await service()
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
