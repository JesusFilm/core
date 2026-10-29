import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GraphQLError } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { transformCampaignBlocks } from '@core/journeys/ui/Campaign'
import { journeyCard } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignJourneyListDisplay,
  CampaignStringKey,
  IdType,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_ACCESSIBLE_JOURNEYS } from '../../../libs/useCampaignAccessibleJourneysLazyQuery'
import { CAMPAIGN_BLOCK_DELETE } from '../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_JOURNEY_BLOCK_CREATE } from '../../../libs/useCampaignJourneyBlockCreateMutation'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../libs/useCampaignJourneyByLinkLazyQuery'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { blockOf, blockUpdateMock } from '../styleTesting'
import { BlocksProbe, QueriedEditor, SelectionProbe } from '../testing'

import { JourneyListEdit } from './JourneyListEdit'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newJourneyItemId') }))

const ADMIN_LINK = 'https://admin.nextstep.is/journeys/newJourneyId'

const resolvedJourney = {
  __typename: 'Journey',
  id: 'newJourneyId',
  title: 'The outreach story',
  description: 'A short journey through the story.',
  slug: 'outreach-story',
  status: JourneyStatus.published
}

const accessibleJourneysMock = {
  request: { query: GET_CAMPAIGN_ACCESSIBLE_JOURNEYS },
  result: vi.fn(() => ({
    data: {
      journeys: [
        {
          ...resolvedJourney,
          team: { __typename: 'Team', id: 'teamId', title: 'Ministry team' }
        },
        {
          __typename: 'Journey',
          id: 'archivedJourneyId',
          title: 'Hope, retold',
          description: null,
          slug: 'hope-retold',
          status: JourneyStatus.archived,
          team: { __typename: 'Team', id: 'teamId', title: 'Ministry team' }
        }
      ]
    }
  }))
}

const resolveMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'newJourneyId', idType: IdType.databaseId }
  },
  result: vi.fn(() => ({ data: { journey: resolvedJourney } }))
}

const createMock = {
  delay: 500,
  request: {
    query: CAMPAIGN_JOURNEY_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newJourneyItemId',
        parentBlockId: 'landingJourneyListId',
        url: ADMIN_LINK
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignJourneyBlockCreate: {
        ...journeyCard({
          id: 'newJourneyItemId',
          pageId: 'landingPageId',
          parentBlockId: 'landingJourneyListId',
          parentOrder: 3,
          journeyId: 'newJourneyId',
          title: 'The outreach story',
          description: 'A short journey through the story.'
        }),
        titleTranslations: [],
        descriptionTranslations: []
      }
    }
  }))
}

const deleteMock = {
  request: {
    query: CAMPAIGN_BLOCK_DELETE,
    variables: { id: 'newJourneyItemId' }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockDelete: [
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingJourneyId',
          parentOrder: 0
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingDraftJourneyId',
          parentOrder: 1
        }
      ]
    }
  }))
}

const createFailureMock = {
  request: createMock.request,
  result: vi.fn(() => ({
    errors: [
      new GraphQLError('Journey not found or not published', {
        extensions: { code: 'BAD_USER_INPUT', field: 'url' }
      })
    ]
  }))
}

const titleUpdateMock = blockUpdateMock(
  blockOf<'CampaignJourneyBlock'>('landingJourneyId'),
  { title: 'Outreach, retold' }
)

function ListHarness({
  display
}: {
  display?: CampaignJourneyListDisplay
}): ReactElement {
  const { campaign, selection, selectBlock } = useCampaignEditor()
  const list = transformCampaignBlocks(campaign.blocks).find(
    (block) => block.id === 'landingJourneyListId'
  )
  if (list == null) throw new Error('fixture')
  return (
    <JourneyListEdit
      block={display == null ? list : { ...list, display }}
      active={selection.host?.id === list.id}
      onSelectCard={(cardId) => selectBlock(cardId)}
    />
  )
}

async function renderList(
  selectedBlockId?: string,
  mocks: Array<Record<string, unknown>> = [],
  display?: CampaignJourneyListDisplay,
  campaignProp: Campaign = campaign
): Promise<ReturnType<typeof render>> {
  const result = render(
    <SnackbarProvider>
      <QueriedEditor
        initialState={{ selectedBlockId }}
        mocks={mocks}
        campaignProp={campaignProp}
      >
        <CommandUndoItem variant="button" />
        <SelectionProbe />
        <BlocksProbe />
        <ListHarness display={display} />
      </QueriedEditor>
    </SnackbarProvider>
  )
  await screen.findByTestId('JourneyListEdit')
  return result
}

/** The seeded campaign with no journey card in the landing list, its noJourneys string set to `noJourneys`. */
function emptyList(noJourneys: string): Campaign {
  return {
    ...campaign,
    blocks: campaign.blocks.filter(
      (block) =>
        !(
          block.parentBlockId === 'landingJourneyListId' &&
          block.__typename === 'CampaignJourneyBlock'
        )
    ),
    strings: campaign.strings.map((string) =>
      string.key === CampaignStringKey.noJourneys
        ? { ...string, value: noJourneys }
        : string
    )
  }
}

describe('JourneyListEdit', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('with no card', () => {
    it('shows the noJourneys string above the hint while not selected', async () => {
      await renderList(undefined, [], undefined, emptyList('Coming soon'))

      const noJourneys = screen.getByTestId('JourneyListNoJourneys')
      expect(noJourneys).toHaveTextContent(/^Coming soon$/)
      expect(noJourneys.nextSibling).toBe(
        screen.getByTestId('JourneyListEmpty')
      )
    })

    it('shows the noJourneys string above the picker while selected', async () => {
      await renderList(
        'landingJourneyListId',
        [],
        undefined,
        emptyList('Coming soon')
      )

      const noJourneys = screen.getByTestId('JourneyListNoJourneys')
      expect(noJourneys).toHaveTextContent(/^Coming soon$/)
      expect(
        noJourneys.compareDocumentPosition(
          screen.getByRole('combobox', { name: 'Add a journey' })
        ) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy()
      expect(screen.queryByTestId('JourneyListEmpty')).not.toBeInTheDocument()
    })

    it('shows nothing for a blank noJourneys string', async () => {
      await renderList(undefined, [], undefined, emptyList('  '))

      expect(
        screen.queryByTestId('JourneyListNoJourneys')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('JourneyListEmpty')).toBeInTheDocument()
    })
  })

  it('shows no noJourneys string while the list has cards', async () => {
    await renderList()

    expect(
      screen.queryByTestId('JourneyListNoJourneys')
    ).not.toBeInTheDocument()
  })

  it.each([
    [CampaignJourneyListDisplay.grid],
    [CampaignJourneyListDisplay.list]
  ])('lays the cards out as a %s, as the public list does', async (display) => {
    await renderList(undefined, [], display)

    expect(screen.getByTestId('CampaignJourneyCards')).toHaveAttribute(
      'data-display',
      display
    )
  })

  it('shows each card’s Open journey button, read-only', async () => {
    await renderList()

    const live = within(screen.getByTestId('JourneyCard-landingJourneyId'))
    const open = live.getByTestId('CampaignJourneyCardOpen')
    expect(open).toHaveTextContent('Open journey')
    expect(open).not.toHaveAttribute('href')
    expect(open).toHaveAttribute('tabindex', '-1')
  })

  it('shows every card in order, live or not, the unpublished one with a warning', async () => {
    await renderList()

    const cards = screen.getAllByTestId(/^JourneyCard-/)
    expect(cards.map((card) => card.dataset.testid)).toEqual([
      'JourneyCard-landingJourneyId',
      'JourneyCard-landingDraftJourneyId'
    ])
    const live = within(cards[0])
    expect(live.getByTestId('InlineText-title')).toHaveTextContent(
      'The outreach story'
    )
    expect(live.getByTestId('InlineText-description')).toHaveTextContent(
      'A short journey through the story.'
    )
    expect(live.getByTestId('JourneyCardImage')).toHaveAttribute(
      'src',
      'https://imagedelivery.net/outreach-story/public'
    )
    expect(live.queryByTestId('JourneyCardUnpublished')).not.toBeInTheDocument()
    expect(
      within(cards[1]).getByTestId('JourneyCardUnpublished')
    ).toHaveTextContent('Journey unpublished')
    expect(
      within(cards[1]).getByTestId('InlineText-description')
    ).toHaveTextContent('Journey description')
  })

  it('selects a card on click and edits its title and description in place', async () => {
    await renderList(undefined, [titleUpdateMock])
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('JourneyCard-landingJourneyId'))

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('journey')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingJourneyId'
    )
    const title = screen.getByRole('textbox', { name: 'Journey title' })
    expect(title).toHaveValue('The outreach story')
    expect(
      screen.getByRole('textbox', { name: 'Journey description' })
    ).toHaveValue('A short journey through the story.')

    fireEvent.change(title, { target: { value: 'Outreach, retold' } })

    await waitFor(() => expect(titleUpdateMock.result).toHaveBeenCalled())
  })

  it('caps the title at 200 characters and the description at 1000', async () => {
    await renderList('landingJourneyId')

    fireEvent.change(screen.getByRole('textbox', { name: 'Journey title' }), {
      target: { value: 'a'.repeat(201) }
    })
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /^Max 200 characters$/
    )
    expect(screen.getByRole('textbox', { name: 'Journey title' })).toHaveValue(
      'The outreach story'
    )

    fireEvent.change(
      screen.getByRole('textbox', { name: 'Journey description' }),
      { target: { value: 'a'.repeat(1001) } }
    )
    await waitFor(() =>
      expect(
        screen.getAllByRole('alert').map((alert) => alert.textContent)
      ).toContain('Max 1000 characters')
    )
  })

  it('offers the journey picker and the paste field only while the list or one of its cards is selected', async () => {
    const { unmount } = await renderList()
    expect(
      screen.queryByRole('combobox', { name: 'Add a journey' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'or paste a link' })
    ).not.toBeInTheDocument()
    unmount()

    const list = await renderList('landingJourneyListId')
    expect(
      screen.getByRole('combobox', { name: 'Add a journey' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: 'or paste a link' })
    ).toBeInTheDocument()
    list.unmount()

    await renderList('landingJourneyId')
    expect(
      screen.getByRole('combobox', { name: 'Add a journey' })
    ).toBeInTheDocument()
  })

  it('searches the accessible journeys and adds the picked one as a create Command, undoable', async () => {
    await renderList('landingJourneyListId', [
      accessibleJourneysMock,
      createMock,
      deleteMock
    ])

    const picker = screen.getByRole('combobox', { name: 'Add a journey' })
    await userEvent.click(picker)
    expect(
      await screen.findByTestId('JourneyPickerOption-newJourneyId')
    ).toHaveTextContent('Ministry team')
    expect(
      screen.getByTestId('JourneyPickerOption-archivedJourneyId')
    ).toHaveTextContent('Archived')

    await userEvent.type(picker, 'Outreach')
    expect(
      screen.queryByTestId('JourneyPickerOption-archivedJourneyId')
    ).toBeNull()
    fireEvent.click(screen.getByTestId('JourneyPickerOption-newJourneyId'))

    expect(
      await screen.findByTestId('JourneyCard-newJourneyItemId')
    ).toHaveTextContent('The outreach story')
    await waitFor(() => expect(createMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.queryByTestId('JourneyCard-newJourneyItemId')).toBeNull()
    )
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
  })

  it('shows the resolved journey first, then adds the card from the pasted link', async () => {
    await renderList('landingJourneyListId', [resolveMock, createMock])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'or paste a link' }),
      `${ADMIN_LINK}{enter}`
    )
    expect(await screen.findByTestId('JourneyPasteResolved')).toHaveTextContent(
      'The outreach story'
    )
    expect(createMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Use this journey' }))

    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    expect(
      await screen.findByTestId('JourneyCard-newJourneyItemId')
    ).toBeInTheDocument()
    expect(
      screen.getAllByTestId(/^JourneyCard-/).map((card) => card.dataset.testid)
    ).toEqual([
      'JourneyCard-landingJourneyId',
      'JourneyCard-landingDraftJourneyId',
      'JourneyCard-newJourneyItemId'
    ])
  })

  it('shows the new card at once as one create Command, selected, and undo removes it', async () => {
    await renderList('landingJourneyListId', [
      resolveMock,
      createMock,
      deleteMock
    ])
    await userEvent.type(
      screen.getByRole('textbox', { name: 'or paste a link' }),
      `${ADMIN_LINK}{enter}`
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Use this journey' })
    )

    expect(
      await screen.findByTestId('JourneyCard-newJourneyItemId')
    ).toHaveTextContent('The outreach story')
    expect(createMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'newJourneyItemId'
    )
    await waitFor(() => expect(createMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingJourneyListId'
    )
    await waitFor(() =>
      expect(screen.queryByTestId('JourneyCard-newJourneyItemId')).toBeNull()
    )
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
  })

  it('numbers the optimistic card after every ordered child of the list, its Extras included', async () => {
    await renderList('landingJourneyListId', [resolveMock, createMock])
    await userEvent.type(
      screen.getByRole('textbox', { name: 'or paste a link' }),
      `${ADMIN_LINK}{enter}`
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Use this journey' })
    )

    // The note above the cards and the two cards: the API answers 3.
    expect(
      await screen.findByTestId('Block-newJourneyItemId')
    ).toHaveTextContent('CampaignJourneyBlock|landingJourneyListId|3|')
    expect(createMock.result).not.toHaveBeenCalled()
  })

  it('leaves nothing to undo when the add is refused, and keeps the list selected', async () => {
    await renderList('landingJourneyListId', [
      resolveMock,
      createFailureMock,
      deleteMock
    ])
    await userEvent.type(
      screen.getByRole('textbox', { name: 'or paste a link' }),
      `${ADMIN_LINK}{enter}`
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Use this journey' })
    )
    await screen.findAllByText('Journey not found or not published')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingJourneyListId'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingJourneyListId'
    )
    expect(deleteMock.result).not.toHaveBeenCalled()
  })

  it("shows the server's message verbatim when the link is refused", async () => {
    await renderList('landingJourneyListId', [resolveMock, createFailureMock])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'or paste a link' }),
      `${ADMIN_LINK}{enter}`
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Use this journey' })
    )

    expect(
      await screen.findAllByText('Journey not found or not published')
    ).not.toHaveLength(0)
    expect(screen.queryByTestId('JourneyCard-newJourneyItemId')).toBeNull()
  })
})
