import { CombinedGraphQLErrors } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import { IdType, JourneyStatus } from '../../../../../__generated__/globalTypes'
import { GET_CAMPAIGN_JOURNEY_BY_LINK } from '../../../../libs/useCampaignJourneyByLinkLazyQuery'

import { JourneyPasteField, parseJourneyLink } from './JourneyPasteField'

const journey = {
  __typename: 'Journey',
  id: 'journeyId',
  title: 'Christmas in Europe',
  description: 'A short journey.',
  slug: 'christmas-europe',
  status: JourneyStatus.published
}

const byIdMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'journeyId', idType: IdType.databaseId }
  },
  result: vi.fn(() => ({ data: { journey } }))
}

const bySlugMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'christmas-europe', idType: IdType.slug }
  },
  result: vi.fn(() => ({ data: { journey } }))
}

const notFoundMock = {
  request: {
    query: GET_CAMPAIGN_JOURNEY_BY_LINK,
    variables: { id: 'draft-journey', idType: IdType.slug }
  },
  result: vi.fn(() => ({
    errors: [
      new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    ]
  }))
}

function renderField(onLink = vi.fn(async () => undefined)) {
  render(
    <MockedProvider mocks={[byIdMock, bySlugMock, notFoundMock] as never}>
      <JourneyPasteField onLink={onLink} />
    </MockedProvider>
  )
  return { onLink }
}

function paste(value: string): void {
  const field = screen.getByRole('textbox', { name: 'Journey link' })
  fireEvent.change(field, { target: { value } })
  fireEvent.blur(field)
}

describe('parseJourneyLink', () => {
  it('reads an admin link by id, the embed route and a public URL on any domain by slug', () => {
    expect(
      parseJourneyLink('https://admin.nextstep.is/journeys/journeyId')
    ).toEqual({ id: 'journeyId' })
    expect(
      parseJourneyLink('https://admin.nextstep.is/journeys/journeyId/reports')
    ).toEqual({ id: 'journeyId' })
    expect(
      parseJourneyLink('https://your.nextstep.is/embed/christmas-europe')
    ).toEqual({ slug: 'christmas-europe' })
    expect(
      parseJourneyLink('  https://journeys.example.org/christmas-europe?x=1 ')
    ).toEqual({ slug: 'christmas-europe' })
  })

  it('rejects anything that is not an http(s) URL with a path', () => {
    expect(parseJourneyLink('christmas-europe')).toBeNull()
    expect(parseJourneyLink('https://your.nextstep.is/')).toBeNull()
    expect(
      parseJourneyLink('ftp://your.nextstep.is/christmas-europe')
    ).toBeNull()
    expect(parseJourneyLink('')).toBeNull()
  })
})

describe('JourneyPasteField', () => {
  beforeEach(() => vi.clearAllMocks())

  it('checks the URL shape client-side without asking the server', async () => {
    renderField()

    paste('not a link')

    expect(
      await screen.findByText(
        'Paste a journey link: its admin link or its public address.'
      )
    ).toBeInTheDocument()
    expect(byIdMock.result).not.toHaveBeenCalled()
    expect(bySlugMock.result).not.toHaveBeenCalled()
  })

  it('resolves an admin link by id and shows the journey before keeping it', async () => {
    const { onLink } = renderField()

    paste('https://admin.nextstep.is/journeys/journeyId')

    const resolved = await screen.findByTestId('JourneyPasteResolved')
    expect(resolved).toHaveTextContent('Christmas in Europe')
    expect(resolved).toHaveTextContent('/christmas-europe')
    expect(byIdMock.result).toHaveBeenCalled()
    expect(onLink).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Use this journey' }))

    await waitFor(() =>
      expect(onLink).toHaveBeenCalledWith(
        'https://admin.nextstep.is/journeys/journeyId'
      )
    )
    await waitFor(() =>
      expect(
        screen.queryByTestId('JourneyPasteResolved')
      ).not.toBeInTheDocument()
    )
    expect(screen.getByRole('textbox', { name: 'Journey link' })).toHaveValue(
      ''
    )
  })

  it('resolves a public URL on any domain by slug', async () => {
    renderField()

    paste('https://journeys.example.org/christmas-europe')

    expect(await screen.findByTestId('JourneyPasteResolved')).toHaveTextContent(
      'Christmas in Europe'
    )
    expect(bySlugMock.result).toHaveBeenCalled()
  })

  it("shows the lookup's message when the journey is not found or not published", async () => {
    renderField()

    paste('https://your.nextstep.is/draft-journey')

    expect(await screen.findByText('journey not found')).toBeInTheDocument()
    expect(screen.queryByTestId('JourneyPasteResolved')).not.toBeInTheDocument()
  })

  it("shows the server's message verbatim when keeping the journey fails", async () => {
    const onLink = vi.fn(async () => {
      throw new CombinedGraphQLErrors({
        errors: [
          new GraphQLError('Journey not found or not published', {
            extensions: { code: 'BAD_USER_INPUT', field: 'url' }
          })
        ]
      })
    })
    renderField(onLink)

    paste('https://admin.nextstep.is/journeys/journeyId')
    fireEvent.click(
      await screen.findByRole('button', { name: 'Use this journey' })
    )

    expect(
      await screen.findByText('Journey not found or not published')
    ).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Journey link' })).toHaveValue(
      'https://admin.nextstep.is/journeys/journeyId'
    )
  })
})
