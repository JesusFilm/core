import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  JourneyFields as Journey,
  JourneyFields_primaryImageBlock as PrimaryImageBlock
} from '../../../../__generated__/JourneyFields'
import { journey } from '../../Editor/ActionDetails/data'

import { TemplateViewHeader } from './TemplateViewHeader'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('TemplateViewHeader', () => {
  it('should render the social image', () => {
    const primaryImageBlock: PrimaryImageBlock = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: null,
      parentOrder: 0,
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'image.jpg',
      width: 1920,
      height: 1080,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL'
    } as unknown as PrimaryImageBlock

    const { queryByTestId, getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                primaryImageBlock
              }
            }}
          >
            <TemplateViewHeader isPublisher authUser={{} as unknown as User} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByTestId('GridEmptyIcon')).not.toBeInTheDocument()
    expect(getByRole('img', { name: 'image.jpg' })).toBeInTheDocument()
  })

  it('should display the title and description', () => {
    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey
            }}
          >
            <TemplateViewHeader isPublisher authUser={{} as unknown as User} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('my journey')).toBeInTheDocument()
    expect(getByText('my cool journey')).toBeInTheDocument()
  })

  it('should render Use Template button', async () => {
    const { getAllByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey
            }}
          >
            <TemplateViewHeader
              isPublisher
              authUser={{ id: '123' } as unknown as User}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByText('Use Template')[0]).toBeInTheDocument()
    )
  })

  it('should render Template Edit button for publishers', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey
            }}
          >
            <TemplateViewHeader
              isPublisher
              authUser={{ id: '123' } as unknown as User}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByTestId('EditTemplateSettings')[0]).toBeInTheDocument()
  })

  it('should not render Template Edit button for non-publishers', () => {
    const { queryByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey
            }}
          >
            <TemplateViewHeader
              isPublisher={false}
              authUser={{ id: '123' } as unknown as User}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByTestId('EditTemplateSettings')).not.toBeInTheDocument()
  })

  it('should render preview button', () => {
    const { getAllByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey
            }}
          >
            <TemplateViewHeader
              isPublisher={false}
              authUser={{ id: '123' } as unknown as User}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('link', { name: 'Preview' })[0]).toBeInTheDocument()
  })

  it('should show featured date if journey is featured', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey,
            variant: 'admin'
          }}
        >
          <TemplateViewHeader
            isPublisher={false}
            authUser={{} as unknown as User}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getAllByTestId('featuredAtTemplatePreviewPage')[0]
    ).toBeInTheDocument()
  })

  it('should show collections buttons if part of a collection', () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey,
            variant: 'admin'
          }}
        >
          <TemplateViewHeader
            isPublisher={false}
            authUser={{} as unknown as User}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getAllByTestId('featuredAtTemplatePreviewPage')[0]
    ).toBeInTheDocument()
  })

  it('should render collections button', async () => {
    const journeyWithTags = {
      ...journey,
      tags: [
        {
          __typename: 'Tag',
          id: 'a6b0080c-d2a5-4b92-945a-8e044c743139',
          parentId: 'eff2c8a5-64d3-4f20-916d-270ff9ad5813',
          name: [
            {
              __typename: 'Translation',
              value: 'Jesus Film',
              language: {
                __typename: 'Language',
                id: '529'
              },
              primary: true
            }
          ]
        },
        {
          __typename: 'Tag',
          id: 'eff2c8a5-64d3-4f20-916d-270ff9ad5813',
          parentId: null,
          name: [
            {
              __typename: 'Translation',
              value: 'Collections',
              language: {
                __typename: 'Language',
                id: '529'
              },
              primary: true
            }
          ]
        }
      ]
    }

    const { getAllByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithTags as Journey,
            variant: 'admin'
          }}
        >
          <TemplateViewHeader
            isPublisher={false}
            authUser={{} as unknown as User}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getAllByRole('button', { name: '{{ collectionsName }}' })
    ).toHaveLength(2)
  })
})
