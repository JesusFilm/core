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

import { IdType, JourneyStatus } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_JOURNEY_BLOCK_UPDATE_TEXT } from '../../../libs/useCampaignBlockTextMutation'
import { CAMPAIGN_JOURNEY_BLOCK_CREATE } from '../../../libs/useCampaignJourneyBlockCreateMutation'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../libs/useCampaignJourneyByLinkLazyQuery'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { QueriedEditor, SelectionProbe } from '../testing'

import { JourneyListEdit } from './JourneyListEdit'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newJourneyItemId') }))

const ADMIN_LINK = 'https://admin.nextstep.is/journeys/newJourneyId'

const resolvedJourney = {
  __typename: 'Journey',
  id: 'newJourneyId',
  title: 'The Christmas story',
  description: 'A short journey through the nativity.',
  slug: 'christmas-story',
  status: JourneyStatus.published
}

const resolveMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'newJourneyId', idType: IdType.databaseId }
  },
  result: vi.fn(() => ({ data: { journey: resolvedJourney } }))
}

const createMock = {
  request: {
    query: CAMPAIGN_JOURNEY_BLOCK_CREATE,
    variables: {
      id: 'newJourneyItemId',
      parentBlockId: 'landingJourneyListId',
      url: ADMIN_LINK
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignJourneyBlockCreate: journeyCard({
        id: 'newJourneyItemId',
        pageId: 'landingPageId',
        parentBlockId: 'landingJourneyListId',
        parentOrder: 3,
        journeyId: 'newJourneyId',
        title: 'The Christmas story',
        description: 'A short journey through the nativity.'
      })
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

const titleUpdateMock = {
  request: {
    query: CAMPAIGN_JOURNEY_BLOCK_UPDATE_TEXT,
    variables: {
      id: 'landingJourneyId',
      input: { title: 'Christmas, retold' }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignJourneyBlockUpdate: {
        __typename: 'CampaignJourneyBlock',
        id: 'landingJourneyId',
        title: 'Christmas, retold',
        description: 'A short journey through the nativity.'
      }
    }
  }))
}

function ListHarness(): ReactElement {
  const { campaign, selection, selectBlock } = useCampaignEditor()
  const list = transformCampaignBlocks(campaign.blocks).find(
    (block) => block.id === 'landingJourneyListId'
  )
  if (list == null) throw new Error('fixture')
  return (
    <JourneyListEdit
      block={list}
      active={selection.host?.id === list.id}
      onSelectCard={(cardId) => selectBlock(cardId)}
    />
  )
}

async function renderList(
  selectedBlockId?: string,
  mocks: Array<Record<string, unknown>> = []
): Promise<ReturnType<typeof render>> {
  const result = render(
    <SnackbarProvider>
      <QueriedEditor initialState={{ selectedBlockId }} mocks={mocks}>
        <SelectionProbe />
        <ListHarness />
      </QueriedEditor>
    </SnackbarProvider>
  )
  await screen.findByTestId('JourneyListEdit')
  return result
}

describe('JourneyListEdit', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows every card in order, live or not, the unpublished one with a warning', async () => {
    await renderList()

    const cards = screen.getAllByTestId(/^JourneyCard-/)
    expect(cards.map((card) => card.dataset.testid)).toEqual([
      'JourneyCard-landingJourneyId',
      'JourneyCard-landingDraftJourneyId'
    ])
    const live = within(cards[0])
    expect(live.getByTestId('InlineText-title')).toHaveTextContent(
      'The Christmas story'
    )
    expect(live.getByTestId('InlineText-description')).toHaveTextContent(
      'A short journey through the nativity.'
    )
    expect(live.getByTestId('JourneyCardImage')).toHaveAttribute(
      'src',
      'https://imagedelivery.net/christmas-story/public'
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
    expect(title).toHaveValue('The Christmas story')
    expect(
      screen.getByRole('textbox', { name: 'Journey description' })
    ).toHaveValue('A short journey through the nativity.')

    fireEvent.change(title, { target: { value: 'Christmas, retold' } })

    await waitFor(() => expect(titleUpdateMock.result).toHaveBeenCalled())
  })

  it('caps the title at 200 characters and the description at 1000', async () => {
    await renderList('landingJourneyId')

    expect(
      screen.getByRole('textbox', { name: 'Journey title' })
    ).toHaveAttribute('maxlength', '201')
    expect(
      screen.getByRole('textbox', { name: 'Journey description' })
    ).toHaveAttribute('maxlength', '1001')
  })

  it('offers the journey paste field only while the list or one of its cards is selected', async () => {
    const { unmount } = await renderList()
    expect(
      screen.queryByRole('textbox', { name: 'Add a journey' })
    ).not.toBeInTheDocument()
    unmount()

    const list = await renderList('landingJourneyListId')
    expect(
      screen.getByRole('textbox', { name: 'Add a journey' })
    ).toBeInTheDocument()
    list.unmount()

    await renderList('landingJourneyId')
    expect(
      screen.getByRole('textbox', { name: 'Add a journey' })
    ).toBeInTheDocument()
  })

  it('shows the resolved journey first, then adds the card from the pasted link', async () => {
    await renderList('landingJourneyListId', [resolveMock, createMock])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Add a journey' }),
      `${ADMIN_LINK}{enter}`
    )
    expect(await screen.findByTestId('JourneyPasteResolved')).toHaveTextContent(
      'The Christmas story'
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

  it("shows the server's message verbatim when the link is refused", async () => {
    await renderList('landingJourneyListId', [resolveMock, createFailureMock])

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Add a journey' }),
      `${ADMIN_LINK}{enter}`
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Use this journey' })
    )

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('JourneyCard-newJourneyItemId')).toBeNull()
  })
})
