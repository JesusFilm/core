import { render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import TagManager from 'react-gtm-module'
import { defaultTemplate } from './TemplateListData'
import { TEMPLATE_LIBRARY_VIEW_EVENT_CREATE } from './TemplateLibrary'
import { TemplateLibrary } from '.'

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
>

describe('TemplateLibrary', () => {
  it('should render templates', () => {
    const { getByText } = render(
      <MockedProvider>
        <TemplateLibrary
          journeys={[defaultTemplate]}
          templates={[defaultTemplate]}
        />
      </MockedProvider>
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })

  it('should create event', async () => {
    const result = jest.fn(() => ({
      data: {
        templateLibraryViewEventCreate: {
          id: 'event.id',
          __typename: 'TemplateLibraryViewEvent'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: TEMPLATE_LIBRARY_VIEW_EVENT_CREATE,
              variables: {}
            },
            result
          }
        ]}
      >
        <TemplateLibrary journeys={[defaultTemplate]} />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockedDataLayer).toHaveBeenCalledWith({
      dataLayer: {
        event: 'template_library_view',
        eventId: 'event.id'
      }
    })
  })

  it('should show access denied message to new user', () => {
    const { getByText } = render(
      <MockedProvider>
        <TemplateLibrary journeys={[]} templates={[defaultTemplate]} />
      </MockedProvider>
    )
    expect(
      getByText('You need to be invited to use your first template')
    ).toBeInTheDocument()
  })

  it('should show templates to new publishers', () => {
    const { getByText } = render(
      <MockedProvider>
        <TemplateLibrary
          isPublisher
          journeys={[]}
          templates={[defaultTemplate]}
        />
      </MockedProvider>
    )
    expect(getByText('Default Template Heading')).toBeInTheDocument()
  })
})
