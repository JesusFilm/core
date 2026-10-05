import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CAMPAIGN_BLOCK_DELETE_ACTION,
  CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
  CAMPAIGN_BLOCK_UPDATE_NAVIGATE_TO_REGION_ACTION,
  CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION,
  CampaignButtonAction
} from '../../../libs/useCampaignBlockActionMutation'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  StaticEditor
} from '../testing'

import { LinkChip, isHttpsUrl } from './LinkChip'

/** The chip over the button as the editor currently holds it. */
function ChipFor({ blockId }: { blockId: string }): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find((candidate) => candidate.id === blockId)
  if (block?.__typename !== 'CampaignButtonBlock') return null
  return <LinkChip block={block} />
}

/** The fixture with the hero button's action replaced. */
function withHeroButtonAction(action: CampaignButtonAction | null): Campaign {
  return {
    ...campaign,
    blocks: campaign.blocks.map((block) =>
      block.id === 'heroButtonId' && block.__typename === 'CampaignButtonBlock'
        ? { ...block, action }
        : block
    )
  }
}

function renderStatic(
  campaignProp: Campaign,
  blockId = 'heroButtonId'
): ReturnType<typeof render> {
  return render(
    <StaticEditor campaignProp={campaignProp}>
      <ChipFor blockId={blockId} />
    </StaticEditor>
  )
}

const scrollToCarouselMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION,
    variables: { id: 'heroButtonId', input: { blockId: 'carouselId' } }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockUpdateScrollToBlockAction: {
        __typename: 'CampaignScrollToBlockAction',
        parentBlockId: 'heroButtonId',
        blockId: 'carouselId'
      }
    }
  }))
}

const scrollToSwitcherMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION,
    variables: { id: 'heroButtonId', input: { blockId: 'landingSwitcherId' } }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockUpdateScrollToBlockAction: {
        __typename: 'CampaignScrollToBlockAction',
        parentBlockId: 'heroButtonId',
        blockId: 'landingSwitcherId'
      }
    }
  }))
}

const regionMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_NAVIGATE_TO_REGION_ACTION,
    variables: { id: 'heroButtonId', input: { regionId: 'afrRegionId' } }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockUpdateNavigateToRegionAction: {
        __typename: 'CampaignNavigateToRegionAction',
        parentBlockId: 'heroButtonId',
        regionId: 'afrRegionId'
      }
    }
  }))
}

const linkMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
    variables: {
      id: 'heroButtonId',
      input: { url: 'https://example.com/watch', target: null }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockUpdateLinkAction: {
        __typename: 'CampaignLinkAction',
        parentBlockId: 'heroButtonId',
        url: 'https://example.com/watch',
        target: null
      }
    }
  }))
}

const badLinkMock = {
  request: {
    query: CAMPAIGN_BLOCK_UPDATE_LINK_ACTION,
    variables: {
      id: 'heroButtonId',
      input: { url: 'https://bad.example/', target: null }
    }
  },
  result: {
    errors: [
      new GraphQLError('url must be at most 2048 characters', {
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
    ]
  }
}

const deleteMock = {
  delay: 200,
  request: {
    query: CAMPAIGN_BLOCK_DELETE_ACTION,
    variables: { id: 'heroButtonId' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockDeleteAction: {
        __typename: 'CampaignButtonBlock',
        id: 'heroButtonId',
        action: null
      }
    }
  }))
}

function renderQueried(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      initialState={{ selectedBlockId: 'heroButtonId' }}
      mocks={[
        scrollToCarouselMock,
        scrollToSwitcherMock,
        regionMock,
        linkMock,
        badLinkMock,
        deleteMock
      ]}
    >
      <CommandUndoItem variant="button" />
      <CommandProbe />
      <BlocksProbe />
      <ChipFor blockId="heroButtonId" />
    </QueriedEditor>
  )
}

function chip(): HTMLElement {
  return screen.getByTestId('LinkChip')
}

function listItems(): string[] {
  return screen
    .getAllByRole('button')
    .filter((button) => button.classList.contains('MuiListItemButton-root'))
    .map((button) => button.textContent ?? '')
}

describe('LinkChip', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('label', () => {
    it('reads "Add link" for a button with no action', () => {
      renderStatic(withHeroButtonAction(null))
      expect(chip()).toHaveTextContent('Add link')
    })

    it('reads the target section by title for a ScrollToBlockAction', () => {
      renderStatic(campaign)
      expect(chip()).toHaveTextContent('Choose your region')
    })

    it('reads the target section by type when it has no title', () => {
      renderStatic(
        withHeroButtonAction({
          __typename: 'CampaignScrollToBlockAction',
          parentBlockId: 'heroButtonId',
          blockId: 'regionHeaderId'
        })
      )
      expect(chip()).toHaveTextContent('Region header')
    })

    it('reads the address for a LinkAction', () => {
      renderStatic(campaign, 'footerTermsId')
      expect(chip()).toHaveTextContent(
        'https://www.cru.org/us/en/about/terms-of-use.html'
      )
    })

    it('reads the region name for a NavigateToRegionAction', () => {
      renderStatic(campaign, 'switcherEuropeButtonId')
      expect(chip()).toHaveTextContent('Europe')
    })

    it.each([
      ['regionId null (the region was deleted)', null],
      ['a region the campaign no longer has', 'ghostRegionId']
    ])('reads "Missing region" with %s', (_label, regionId) => {
      renderStatic(
        withHeroButtonAction({
          __typename: 'CampaignNavigateToRegionAction',
          parentBlockId: 'heroButtonId',
          regionId
        })
      )
      expect(chip()).toHaveTextContent('Missing region')
      expect(chip()).toHaveClass('MuiChip-colorError')
    })
  })

  describe('picker', () => {
    it('offers a web address, the sections on this page by title or type, and the regions', () => {
      renderStatic(campaign)

      fireEvent.click(chip())

      expect(
        screen.getByRole('button', { name: 'Web address' })
      ).toBeInTheDocument()
      // Opens on the current kind: the section list, with the target selected.
      expect(screen.getByRole('button', { name: 'Section' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(listItems()).toEqual([
        'Share the story of Christmas',
        'Choose your region',
        'Films for the season',
        'Ready-made journeys',
        'Where the story is spreading'
      ])
      expect(
        screen.getByRole('button', { name: 'Choose your region' })
      ).toHaveClass('Mui-selected')

      fireEvent.click(screen.getByRole('button', { name: 'Region' }))

      expect(listItems()).toEqual(['Europe', 'Africa'])
      expect(
        screen.getByRole('button', { name: 'Remove link' })
      ).toBeInTheDocument()
    })

    it('lists the sections of the page the canvas shows for a chrome button', () => {
      render(
        <StaticEditor
          campaignProp={campaign}
          initialState={{ pageKind: 'regionTemplate' as never }}
        >
          <ChipFor blockId="navHomeId" />
        </StaticEditor>
      )

      fireEvent.click(chip())

      expect(listItems()).toEqual([
        'Region header',
        'Share this journey',
        'Other journeys for this region',
        'Where the story is spreading',
        'Other regions'
      ])
    })

    it('picking a section is one Command through campaignBlockUpdateScrollToBlockAction; undo restores the previous target', async () => {
      renderQueried()
      await screen.findByTestId('LinkChip')

      fireEvent.click(chip())
      fireEvent.click(
        screen.getByRole('button', { name: 'Films for the season' })
      )

      await waitFor(() =>
        expect(screen.queryByTestId('LinkPicker')).not.toBeInTheDocument()
      )
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      // Optimistic: the chip reads the new target before the request returns.
      await waitFor(() =>
        expect(chip()).toHaveTextContent('Films for the season')
      )
      expect(scrollToCarouselMock.result).not.toHaveBeenCalled()
      await waitFor(() =>
        expect(scrollToCarouselMock.result).toHaveBeenCalled()
      )

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(chip()).toHaveTextContent('Choose your region')
      )
      await waitFor(() =>
        expect(scrollToSwitcherMock.result).toHaveBeenCalled()
      )
    })

    it('picking a region is one Command through campaignBlockUpdateNavigateToRegionAction', async () => {
      renderQueried()
      await screen.findByTestId('LinkChip')

      fireEvent.click(chip())
      fireEvent.click(screen.getByRole('button', { name: 'Region' }))
      fireEvent.click(screen.getByRole('button', { name: 'Africa' }))

      await waitFor(() => expect(chip()).toHaveTextContent('Africa'))
      expect(screen.getByTestId('Block-heroButtonId')).toHaveTextContent(
        '|CampaignNavigateToRegionAction'
      )
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() => expect(regionMock.result).toHaveBeenCalled())
    })

    it('pre-validates the https scheme only, then writes the address as one Command', async () => {
      renderQueried()
      await screen.findByTestId('LinkChip')

      fireEvent.click(chip())
      fireEvent.click(screen.getByRole('button', { name: 'Web address' }))
      const field = screen.getByRole('textbox', { name: 'Web address' })
      fireEvent.change(field, { target: { value: 'http://example.com/watch' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Enter an address starting with https://'
      )
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
      expect(screen.getByTestId('LinkPicker')).toBeInTheDocument()

      fireEvent.change(field, {
        target: { value: ' https://example.com/watch ' }
      })
      fireEvent.keyDown(field, { key: 'Enter' })

      await waitFor(() =>
        expect(chip()).toHaveTextContent('https://example.com/watch')
      )
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      await waitFor(() => expect(linkMock.result).toHaveBeenCalled())
    })

    it("shows the API's message verbatim when the write fails", async () => {
      renderQueried()
      await screen.findByTestId('LinkChip')

      fireEvent.click(chip())
      fireEvent.click(screen.getByRole('button', { name: 'Web address' }))
      fireEvent.change(screen.getByRole('textbox', { name: 'Web address' }), {
        target: { value: 'https://bad.example/' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'url must be at most 2048 characters'
      )
      // Rolled back to the action the button had.
      await waitFor(() =>
        expect(chip()).toHaveTextContent('Choose your region')
      )
    })

    it('removing the link is one Command through campaignBlockDeleteAction; undo restores it', async () => {
      renderQueried()
      await screen.findByTestId('LinkChip')

      fireEvent.click(chip())
      fireEvent.click(screen.getByRole('button', { name: 'Remove link' }))

      await waitFor(() => expect(chip()).toHaveTextContent('Add link'))
      expect(screen.getByTestId('Block-heroButtonId')).toHaveTextContent(
        '|null'
      )
      expect(deleteMock.result).not.toHaveBeenCalled()
      await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(chip()).toHaveTextContent('Choose your region')
      )
      await waitFor(() =>
        expect(scrollToSwitcherMock.result).toHaveBeenCalled()
      )
    })
  })

  describe('isHttpsUrl', () => {
    it('accepts https only', () => {
      expect(isHttpsUrl('https://example.com')).toBe(true)
      expect(isHttpsUrl('http://example.com')).toBe(false)
      expect(isHttpsUrl('example.com')).toBe(false)
      expect(isHttpsUrl('')).toBe(false)
    })
  })
})
