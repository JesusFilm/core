import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { v4 as uuidv4 } from 'uuid'

import {
  CampaignBackgroundKind,
  CampaignBackgroundOverlay,
  CampaignImageSlot
} from '../../../../__generated__/globalTypes'
import {
  CAMPAIGN_IMAGE_BLOCK_CREATE,
  newOwnedImageBlock
} from '../../../libs/useCampaignImageBlockCreateMutation'
import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from '../../../libs/useCloudflareUploadByUrlMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { campaign } from '../data'
import { nextPalette } from '../PaletteColorPicker'
import {
  StyleMock,
  WithBlock,
  blockOf,
  paletteMock,
  sectionStyleMock
} from '../styleTesting'
import { CommandProbe, QueriedEditor } from '../testing'

import { StylePanel } from './StylePanel'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))
vi.mock('../../../libs/useImageUpload', () => ({
  useImageUpload: vi.fn(() => ({
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    open: vi.fn(),
    loading: false,
    isDragAccept: false
  }))
}))

const hero = blockOf<'CampaignHeroBlock'>('heroId')

const PASTED = 'https://example.com/cover.jpg'
const STORED = 'https://imagedelivery.net/accountHash/cfId'
const SRC = `${STORED}/public`

const uploadByUrlMock = {
  request: {
    query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
    variables: { url: PASTED, teamId: 'teamId' }
  },
  result: vi.fn(() => ({
    data: {
      createCloudflareUploadByUrl: {
        __typename: 'CloudflareImage',
        id: 'cfId',
        url: STORED
      }
    }
  }))
}

const coverCreateMock = {
  request: {
    query: CAMPAIGN_IMAGE_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'heroId',
        slot: CampaignImageSlot.cover,
        src: SRC
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignImageBlockCreate: {
        ...newOwnedImageBlock('newId', hero, SRC),
        width: 1600,
        height: 400
      }
    }
  }))
}

function renderPanel(mocks: StyleMock[]): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} initialState={{ selectedBlockId: 'heroId' }}>
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <WithBlock blockId="heroId" typename="CampaignHeroBlock">
        {(block) => <StylePanel block={block} />}
      </WithBlock>
    </QueriedEditor>
  )
}

async function pickHex(name: string, hex: string): Promise<void> {
  const input = screen.getByRole('textbox', { name })
  fireEvent.focus(input)
  fireEvent.change(input, { target: { value: hex } })
  fireEvent.blur(input)
}

describe('StylePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  describe('Background', () => {
    it('writes a chosen kind as one Command with an optimistic response', async () => {
      const mocks = [
        {
          ...sectionStyleMock(hero, {
            backgroundKind: CampaignBackgroundKind.surface
          }),
          delay: 200
        }
      ]
      renderPanel(mocks)
      const none = await screen.findByRole('button', { name: 'None' })
      expect(none).toHaveAttribute('aria-pressed', 'true')

      fireEvent.click(screen.getByRole('button', { name: 'Surface' }))

      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      // The optimistic response flips the selection before the request returns.
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Surface' })).toHaveAttribute(
          'aria-pressed',
          'true'
        )
      )
      expect(mocks[0].result).not.toHaveBeenCalled()
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    })

    it('offers the image kind: choosing it without a cover shows the picker and writes nothing yet', async () => {
      renderPanel([])
      await screen.findByRole('button', { name: 'None' })

      fireEvent.click(screen.getByRole('button', { name: 'Image' }))

      expect(screen.getByRole('button', { name: 'Image' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(screen.getByTestId('StyleCoverPicker')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Upload a file' })).toBeEnabled()
      expect(screen.getByRole('textbox', { name: 'Image URL' })).toBeInTheDocument()
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
      expect(screen.queryByRole('group', { name: 'Overlay' })).toBeNull()
    })

    it('sets the cover and overlay as one Command when a picture is kept; undo restores the previous kind', async () => {
      const imageInput = {
        backgroundKind: CampaignBackgroundKind.image,
        coverBlockId: 'newId',
        backgroundOverlay: CampaignBackgroundOverlay.medium
      }
      const mocks = [
        uploadByUrlMock,
        coverCreateMock,
        sectionStyleMock(hero, imageInput),
        sectionStyleMock(
          hero,
          {
            backgroundKind: hero.backgroundKind,
            coverBlockId: null,
            backgroundOverlay: null
          },
          imageInput
        ),
        sectionStyleMock(hero, { backgroundOverlay: CampaignBackgroundOverlay.heavy }, imageInput)
      ]
      renderPanel(mocks)
      fireEvent.click(await screen.findByRole('button', { name: 'Image' }))

      fireEvent.change(screen.getByRole('textbox', { name: 'Image URL' }), {
        target: { value: PASTED }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Preview' }))
      expect(screen.getByTestId('StyleCoverPickerPreviewImage')).toHaveAttribute(
        'src',
        PASTED
      )
      fireEvent.click(screen.getByRole('button', { name: 'Use as background' }))

      await waitFor(() => expect(uploadByUrlMock.result).toHaveBeenCalled())
      await waitFor(() => expect(coverCreateMock.result).toHaveBeenCalled())
      await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
      // One Command for the fetch, the create and the style write together.
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() =>
        expect(screen.getByTestId('StyleBackgroundCover')).toHaveAttribute(
          'src',
          SRC
        )
      )
      expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )

      // The overlay is its own Command through the same mutation.
      fireEvent.click(screen.getByRole('button', { name: 'Heavy' }))
      await waitFor(() => expect(mocks[4].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() => expect(mocks[3].result).toHaveBeenCalled())
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'None' })).toHaveAttribute(
          'aria-pressed',
          'true'
        )
      )
      expect(screen.queryByTestId('StyleBackgroundCover')).toBeNull()
      expect(coverCreateMock.result).toHaveBeenCalledTimes(1)
    })

    it('commits the custom colour on picker blur, and undo restores the previous colour and kind', async () => {
      const mocks = [
        sectionStyleMock(hero, {
          backgroundKind: CampaignBackgroundKind.custom
        }),
        sectionStyleMock(
          hero,
          { backgroundColor: '#123456' },
          { backgroundKind: CampaignBackgroundKind.custom }
        ),
        paletteMock(nextPalette(campaign.palette, '#123456')),
        sectionStyleMock(
          hero,
          { backgroundColor: null },
          { backgroundKind: CampaignBackgroundKind.custom }
        ),
        sectionStyleMock(hero, { backgroundKind: hero.backgroundKind })
      ]
      renderPanel(mocks)

      fireEvent.click(await screen.findByRole('button', { name: 'Custom' }))
      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

      await pickHex('Custom colour hex', '#123456')

      await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
      await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
      // The palette save is outside undo: still two Commands.
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(mocks[3].result).toHaveBeenCalled())
      expect(
        screen.getByRole('textbox', { name: 'Custom colour hex' })
      ).toHaveValue(campaign.theme.backgroundColor)

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(mocks[4].result).toHaveBeenCalled())
      expect(screen.getByRole('button', { name: 'None' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })
  })

  describe('Colours', () => {
    it('writes each override as one Command and clears it with null', async () => {
      const mocks = [
        sectionStyleMock(hero, { textColor: '#ABCDEF' }),
        paletteMock(nextPalette(campaign.palette, '#ABCDEF')),
        sectionStyleMock(hero, { textColor: null }, { textColor: '#ABCDEF' })
      ]
      renderPanel(mocks)
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      fireEvent.click(screen.getByTestId('StyleOverride-textColor'))
      const input = screen.getByRole('textbox', { name: 'Text hex' })
      fireEvent.change(input, { target: { value: 'abcdef' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() =>
        expect(
          within(screen.getByTestId('StyleOverride-textColor')).getByText(
            '#ABCDEF'
          )
        ).toBeInTheDocument()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Inherit' }))

      await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
      await waitFor(() =>
        expect(
          within(screen.getByTestId('StyleOverride-textColor')).getByText(
            'Inherited'
          )
        ).toBeInTheDocument()
      )
    })

    it('lists the five overrides', async () => {
      renderPanel([])
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      const list = screen.getByRole('list', { name: 'Colour overrides' })
      expect(
        within(list)
          .getAllByRole('button')
          .map((row) => row.textContent)
      ).toEqual([
        'HeadingInherited',
        'TextInherited',
        'ButtonInherited',
        'Button textInherited',
        'AccentInherited'
      ])
    })
  })

  describe('validation', () => {
    it('pre-validates only the hex format and writes nothing for a bad value', async () => {
      renderPanel([])
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      await pickHex('Heading hex', 'blue')

      expect(
        screen.getByText('Enter a hex colour like #RRGGBB')
      ).toBeInTheDocument()
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    })

    it('shows the API’s message verbatim when it refuses a value', async () => {
      const failing: StyleMock = {
        ...sectionStyleMock(hero, { headingColor: '#AABBCC' }),
        result: vi.fn(() => ({
          errors: [{ message: 'headingColor is not allowed on this band' }]
        }))
      }
      renderPanel([
        failing,
        paletteMock(nextPalette(campaign.palette, '#AABBCC'))
      ])
      fireEvent.click(await screen.findByRole('tab', { name: 'Colours' }))

      await pickHex('Heading hex', '#abc')

      expect(
        await screen.findByText('headingColor is not allowed on this band')
      ).toBeInTheDocument()
    })
  })
})
