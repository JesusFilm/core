import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { resultData } from '../journeyListData'
import { JOURNEY_CREATE } from '../JourneyList'
import { AddJourneyFab } from '.'

describe('AddJourneyFab', () => {
  it('should render a Fab', () => {
    const { getByRole } = render(<AddJourneyFab />)
    expect(getByRole('button')).toBeInTheDocument()
  })

  it('should check if the mutation gets called', async () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CREATE,
              variables: {
                journeyId: 'uuid',
                title: 'Untitled Journey',
                slug: `untitled-journey-uuid`,
                description:
                  'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
                stepId: 'uuid',
                cardId: 'uuid',
                imageId: 'uuid',
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
