import { reindexVideosInAlgolia } from '../../lib/algolia/reindexVideosInAlgolia/reindexVideosInAlgolia'

import { getFlagValue, main } from './reindex-videos'

vi.mock('../../workers/videoAlgoliaSync/queue', () => ({
  queue: { close: vi.fn() }
}))

vi.mock('../../lib/algolia/reindexVideosInAlgolia/reindexVideosInAlgolia', async () => {
  const actual = await vi.importActual<
    typeof import('../../lib/algolia/reindexVideosInAlgolia/reindexVideosInAlgolia')
  >('../../lib/algolia/reindexVideosInAlgolia/reindexVideosInAlgolia')
  return { ...actual, reindexVideosInAlgolia: vi.fn() }
})

const mockedReindex = vi.mocked(reindexVideosInAlgolia)
const base = ['node', 'reindex-videos.ts']

describe('reindex-videos script', () => {
  beforeEach(() => {
    mockedReindex.mockReset()
    mockedReindex.mockResolvedValue({
      scanned: 0,
      enqueued: 0,
      lastVideoId: null
    })
  })

  it('is a dry run unless --apply is passed', async () => {
    await main(base)

    expect(mockedReindex).toHaveBeenCalledWith(
      expect.objectContaining({ apply: false }),
      expect.anything()
    )
  })

  it('applies with --apply and passes the filters through', async () => {
    await main([
      ...base,
      '--apply',
      '--video-ids=1_jf-0-0, 2_PI',
      '--after=1_a',
      '--batch-size=50'
    ])

    expect(mockedReindex).toHaveBeenCalledWith(
      {
        apply: true,
        videoIds: ['1_jf-0-0', '2_PI'],
        afterVideoId: '1_a',
        batchSize: 50
      },
      expect.anything()
    )
  })

  it('rejects an invalid batch size before doing any work', async () => {
    await expect(main([...base, '--batch-size=0'])).rejects.toThrow(
      'Invalid batch size'
    )
    expect(mockedReindex).not.toHaveBeenCalled()
  })

  it('reads --name=value flags', () => {
    expect(getFlagValue(['--after=x'], 'after')).toBe('x')
    expect(getFlagValue(['--apply'], 'after')).toBeUndefined()
  })
})
