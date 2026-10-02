import { vi } from 'vitest'

import { Attachment } from './attachments'
import { attachmentTarget } from './names'
import { describeAttachment, getDomainInfrastructure } from './status'

vi.mock('./config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./config')>()),
  getInfrastructureConfig: vi.fn(() => null)
}))

const WORKER = 'short-links-redirect-stage'
const target = attachmentTarget({
  hostname: 'stage.jesus.film',
  pathPrefix: 's'
})

function route(pattern: string, script: string | null): Attachment {
  return { kind: 'route', id: `id-${pattern}`, pattern, script }
}

describe('infrastructure status', () => {
  describe('describeAttachment', () => {
    it('is ok when the expected route points at this Worker', () => {
      expect(
        describeAttachment(WORKER, target, [
          route('stage.jesus.film/s/*', WORKER)
        ])
      ).toEqual({
        state: 'ok',
        detail: 'stage.jesus.film/s/* → short-links-redirect-stage'
      })
    })

    it('is missing when nothing on the hostname points at this Worker', () => {
      expect(
        describeAttachment(WORKER, target, [
          route('stage.jesus.film/other/*', 'someone-else')
        ])
      ).toEqual({
        state: 'missing',
        detail:
          'stage.jesus.film/s/* is not attached to short-links-redirect-stage'
      })
    })

    it('is a mismatch when the expected route points at another Worker', () => {
      expect(
        describeAttachment(WORKER, target, [
          route('stage.jesus.film/s/*', 'short-links-redirect-prod')
        ])
      ).toEqual({
        state: 'mismatch',
        detail:
          'stage.jesus.film/s/* is attached to short-links-redirect-prod, not short-links-redirect-stage'
      })
    })

    it('is a mismatch when this Worker is attached under another pattern', () => {
      expect(
        describeAttachment(WORKER, target, [
          route('stage.jesus.film/go/*', WORKER)
        ])
      ).toEqual({
        state: 'mismatch',
        detail:
          'short-links-redirect-stage is attached as stage.jesus.film/go/*, but this domain expects stage.jesus.film/s/*'
      })
    })
  })

  it('reports every check as unknown when management is not configured', async () => {
    const unknown = {
      state: 'unknown',
      detail:
        'Cloudflare infrastructure management is not configured in this environment'
    }

    expect(
      await getDomainInfrastructure({
        hostname: 'localhost',
        pathPrefix: '',
        kvNamespaceId: null,
        kvBinding: null
      })
    ).toEqual({
      configured: false,
      workerName: null,
      hostnameAllowed: false,
      zone: unknown,
      kvNamespace: unknown,
      kvBinding: unknown,
      attachment: unknown
    })
  })
})
