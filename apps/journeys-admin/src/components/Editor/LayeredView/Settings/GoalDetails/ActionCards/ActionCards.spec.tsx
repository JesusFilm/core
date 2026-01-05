import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { journey } from '@core/journeys/ui/TemplateView/TemplateFooter/data'

import { ActionCards } from './ActionCards'

describe('ActionCards', () => {
  it('should render action cards', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <ActionCards url="https://www.google.com/" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Appears on the cards')).toBeInTheDocument()
    expect(getByText('Button')).toBeInTheDocument()
    expect(getByText('Google link')).toBeInTheDocument()
    expect(getByText('Subscribe')).toBeInTheDocument()
    expect(getByText('Sign Up Form')).toBeInTheDocument()
  })

  it('should render action card with poll text', () => {
    const { getByText } = render(
      <SnackbarProvider>
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                blocks: [
                  {
                    __typename: 'CardBlock',
                    id: 'card2.id',
                    parentBlockId: 'step2.id',
                    parentOrder: 0,
                    backgroundColor: null,
                    coverBlockId: 'image2.id',
                    themeMode: null,
                    themeName: null,
                    fullscreen: false,
                    backdropBlur: null
                  },
                  {
                    __typename: 'RadioQuestionBlock',
                    id: 'RadioQuestion1',
                    parentBlockId: 'card2.id',
                    parentOrder: 0,
                    gridView: false
                  },
                  {
                    __typename: 'RadioOptionBlock',
                    id: 'RadioOption1',
                    label: 'Option 1',
                    parentBlockId: 'RadioQuestion1',
                    parentOrder: 0,
                    action: {
                      __typename: 'LinkAction',
                      parentBlockId: 'RadioOption1',
                      gtmEventName: 'poll',
                      url: 'https://www.google.com/',
                      customizable: false,
                      parentStepId: null
                    },
                    pollOptionImageBlockId: null
                  },
                  {
                    __typename: 'StepBlock',
                    id: 'step2.id',
                    parentBlockId: null,
                    parentOrder: 0,
                    locked: false,
                    nextBlockId: null,
                    slug: null
                  }
                ]
              },
              variant: 'admin'
            }}
          >
            <ActionCards url="https://www.google.com/" />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByText('Poll')).toBeInTheDocument()
  })
})
