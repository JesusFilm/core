import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { v4 as uuidv4 } from 'uuid'
import { resultData } from '../journeyListData'
import { JOURNEY_CREATE } from '../JourneyList'
import { AddJourneyFab } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('AddJourneyFab', () => {
  it('should render a fab', async () => {
    mockUuidv4.mockReturnValueOnce('journeyId')
    mockUuidv4.mockReturnValueOnce('stepId')
    mockUuidv4.mockReturnValueOnce('cardId')
    mockUuidv4.mockReturnValueOnce('imageId')
    const onClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CREATE,
              variables: {
                journeyId: 'journeyId',
                title: 'Untitled Journey',
                slug: `untitled-journey-journeyId`,
                description:
                  'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
                stepId: 'stepId',
                cardId: 'cardId',
                imageId: 'imageId',
                alt: 'two hot air balloons in the sky',
                headlineTypography: 'The Journey Is On',
                bodyTypography: '"Go, and lead the people on their way..."',
                captionTypography: 'Deutoronomy 10:11'
              }
            },
            result: {
              data: {
                resultData
              }
            }
          }
        ]}
      >
        <AddJourneyFab onClick={onClick} />
      </MockedProvider>
    )
    expect(getByRole('button')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Add' }))
    expect(onClick).toHaveBeenCalled()
  })
})
