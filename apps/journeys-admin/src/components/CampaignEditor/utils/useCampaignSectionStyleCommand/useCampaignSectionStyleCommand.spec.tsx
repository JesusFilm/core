import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CampaignBackgroundKind } from '../../../../../__generated__/globalTypes'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import {
  StyleMock,
  blockOf,
  readSectionStyle,
  sectionStyleMock
} from '../../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  campaignCache
} from '../../testing'

import { useCampaignSectionStyleCommand } from './useCampaignSectionStyleCommand'

const hero = blockOf<'CampaignHeroBlock'>('heroId')
const header = blockOf<'CampaignHeaderBlock'>('headerId')

function Controls(): ReactElement {
  const { addSectionStyle, error } = useCampaignSectionStyleCommand()
  return (
    <>
      <button
        onClick={() =>
          addSectionStyle(hero, {
            backgroundKind: CampaignBackgroundKind.surface
          })
        }
      >
        Surface
      </button>
      <button
        onClick={() => addSectionStyle(hero, { backgroundColor: '#123456' })}
      >
        Colour
      </button>
      <button
        onClick={() =>
          addSectionStyle(header, {
            backgroundKind: CampaignBackgroundKind.contrast
          })
        }
      >
        Header contrast
      </button>
      {error != null && <span role="alert">{error}</span>}
    </>
  )
}

function renderControls(
  mocks: StyleMock[],
  cache = campaignCache()
): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} cache={cache}>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <Controls />
    </QueriedEditor>
  )
}

describe('useCampaignSectionStyleCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes the kind as one Command through the section type’s update mutation, optimistically', async () => {
    const cache = campaignCache()
    const mocks = [
      {
        ...sectionStyleMock(hero, {
          backgroundKind: CampaignBackgroundKind.surface
        }),
        delay: 200
      }
    ]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Surface' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() =>
      expect(readSectionStyle(cache, hero)?.backgroundKind).toBe('surface')
    )
    expect(mocks[0].result).not.toHaveBeenCalled()
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
  })

  it('undoes by writing the previous kind back through the same mutation and focusing the block', async () => {
    const cache = campaignCache()
    const mocks = [
      sectionStyleMock(hero, {
        backgroundKind: CampaignBackgroundKind.surface
      }),
      sectionStyleMock(hero, { backgroundKind: hero.backgroundKind })
    ]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Surface' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    await waitFor(() =>
      expect(readSectionStyle(cache, hero)?.backgroundKind).toBe(
        hero.backgroundKind
      )
    )
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
  })

  it('undoes a custom colour to the value it had (null) and redoes it again', async () => {
    const cache = campaignCache()
    const mocks = [
      {
        ...sectionStyleMock(hero, { backgroundColor: '#123456' }),
        maxUsageCount: 2
      },
      sectionStyleMock(hero, { backgroundColor: null })
    ]
    renderControls(mocks, cache)

    fireEvent.click(await screen.findByRole('button', { name: 'Colour' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalledTimes(1))
    expect(readSectionStyle(cache, hero)?.backgroundColor).toBe('#123456')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(readSectionStyle(cache, hero)?.backgroundColor).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalledTimes(2))
    expect(readSectionStyle(cache, hero)?.backgroundColor).toBe('#123456')
  })

  it('addresses chrome through its own update mutation', async () => {
    const mocks = [
      sectionStyleMock(header, {
        backgroundKind: CampaignBackgroundKind.contrast
      })
    ]
    renderControls(mocks)

    fireEvent.click(
      await screen.findByRole('button', { name: 'Header contrast' })
    )

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('surfaces the API message verbatim when a save fails', async () => {
    const failing: StyleMock = {
      ...sectionStyleMock(hero, { backgroundColor: '#123456' }),
      result: vi.fn(() => ({
        errors: [
          { message: 'backgroundColor must be a hex colour like #RRGGBB' }
        ]
      }))
    }
    renderControls([failing])

    fireEvent.click(await screen.findByRole('button', { name: 'Colour' }))

    expect(
      await screen.findByText(
        'backgroundColor must be a hex colour like #RRGGBB'
      )
    ).toBeInTheDocument()
  })
})
