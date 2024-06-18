import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '../../../libs/JourneyProvider'

import {
  JourneyFields as Journey,
  JourneyFields_primaryImageBlock as PrimaryImageBlock
} from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { journey } from '../../../../../../../apps/journeys-admin/src/components/Editor/Slider/Settings/GoalDetails/data' //TODO(jk)

import { TemplateViewHeader } from './TemplateViewHeader'

describe('TemplateViewHeader', () => {
  const setOpenTeamDialogMock = jest.fn()

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
            <TemplateViewHeader
              isPublisher
              authUser={{} as unknown as User}
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByTestId('GridEmptyIcon')).not.toBeInTheDocument()
    expect(getByRole('img', { name: 'image.jpg' })).toBeInTheDocument()
  })

  it('should show creator details if provided', async () => {
    const journeyWithCreatorDetails = {
      ...journey,
      strategySlug: null,
      tags: [],
      creatorDescription:
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries',
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    }
    const { getByText, getByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithCreatorDetails as Journey,
            variant: 'admin'
          }}
        >
          <TemplateViewHeader
            isPublisher
            authUser={{} as unknown as User}
            openTeamDialog={false}
            setOpenTeamDialog={setOpenTeamDialogMock}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      getByText(
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries'
      )
    ).toBeInTheDocument()
    const creatorImage = getByRole('img')
    expect(creatorImage).toBeInTheDocument()
    expect(creatorImage).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
    )
  })

  it('should not show creator details if description is not provided', async () => {
    const journeyWithCreatorDetails = {
      ...journey,
      strategySlug: null,
      tags: [],
      creatorDescription: null,
      creatorImageBlock: {
        id: 'creatorImageBlock.id',
        parentBlockId: null,
        parentOrder: 3,
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: 'photo-1552410260-0fd9b577afa6',
        width: 6000,
        height: 4000,
        blurhash: 'LHFr#AxW9a%L0KM{IVRkoMD%D%R*',
        __typename: 'ImageBlock'
      }
    }
    const { queryByText, queryByRole } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: journeyWithCreatorDetails as Journey,
            variant: 'admin'
          }}
        >
          <TemplateViewHeader
            isPublisher
            authUser={{} as unknown as User}
            openTeamDialog={false}
            setOpenTeamDialog={setOpenTeamDialogMock}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(
      queryByText(
        'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries'
      )
    ).not.toBeInTheDocument()
    const creatorImage = queryByRole('img')
    expect(creatorImage).not.toBeInTheDocument()
  })

  it('should display the title and description', () => {
    const { getAllByText, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey
            }}
          >
            <TemplateViewHeader
              isPublisher
              authUser={{} as unknown as User}
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByText('my journey')[0]).toBeInTheDocument()
    expect(getByText('my cool journey')).toBeInTheDocument()
  })

  it('should render Use This Template button', async () => {
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
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByText('Use This Template')[0]).toBeInTheDocument()
    )
  })

  it('should render Template Edit button for publishers', () => {
    const { getAllByRole } = render(
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
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('link', { name: 'Edit' })).toHaveLength(2)
  })

  it('edit button should redirect to publisher journey edit', () => {
    const { getAllByRole } = render(
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
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('link', { name: 'Edit' })[0]).toHaveAttribute(
      'href',
      '/publisher/journeyId'
    )
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
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(queryByTestId('TemplateEditButton')).not.toBeInTheDocument()
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
              openTeamDialog={false}
              setOpenTeamDialog={setOpenTeamDialogMock}
            />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getAllByRole('link', { name: 'Preview' })[0]).toBeInTheDocument()
  })

  it('should show created at date', () => {
    const { getAllByText } = render(
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
            openTeamDialog={false}
            setOpenTeamDialog={setOpenTeamDialogMock}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getAllByText('November 2021')).toHaveLength(2)
  })

  it('should show skeletons while loading', async () => {
    const { getAllByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{}}>
          <TemplateViewHeader
            isPublisher={false}
            authUser={{} as unknown as User}
            openTeamDialog={false}
            setOpenTeamDialog={setOpenTeamDialogMock}
          />
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getAllByTestId('TemplateViewTitleSkeleton')[0]).toBeInTheDocument()
    )
  })
})
