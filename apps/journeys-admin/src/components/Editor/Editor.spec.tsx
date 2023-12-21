import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'
import { PageWrapper } from '../PageWrapper'
import { ThemeProvider } from '../ThemeProvider'

import { ControlPanel } from './ControlPanel'
import { Drawer } from './Drawer'
import { CREATE_CLOUDFLARE_UPLOAD_BY_URL } from './ImageBlockEditor/CustomImage/CustomUrl/CustomUrl'
import {
  JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
  JOURNEY_IMAGE_BLOCK_CREATE
} from './ImageEdit/ImageEdit'
import { JourneyEdit } from './JourneyEdit'

import { Editor } from '.'

describe('Editor', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY: 'cloudflare-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    title: 'my journey',
    featuredAt: null,
    strategySlug: null,
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [
      {
        id: 'step0.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'step1.id'
      },
      {
        id: 'step1.id',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 1,
        locked: false,
        nextBlockId: 'step1.id'
      }
    ] as TreeBlock[],
    primaryImageBlock: null,
    creatorDescription: null,
    creatorImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: null,
    seoDescription: null,
    chatButtons: [],
    host: null,
    team: null,
    tags: []
  }

  it('should render the element', () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={journey}>
              <PageWrapper
                bottomPanelChildren={<ControlPanel />}
                customSidePanel={<Drawer />}
              >
                <JourneyEdit />
              </PageWrapper>
            </Editor>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByText('Journey')).toBeInTheDocument()
    expect(getByTestId('side-header')).toHaveTextContent('Properties')
  })

  it('should display Next Card property', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={journey}>
              <PageWrapper
                bottomPanelChildren={<ControlPanel />}
                customSidePanel={<Drawer />}
              >
                <JourneyEdit />
              </PageWrapper>
            </Editor>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByTestId('EditorCanvas'))
    await waitFor(() => expect(getByText('Next Card')).toBeInTheDocument())
    expect(getByText('Unlocked Card')).toBeInTheDocument()
  })

  it('should update Social Preview', async () => {
    const image: ImageBlock = {
      id: 'image1.id',
      __typename: 'ImageBlock',
      parentBlockId: null,
      parentOrder: 0,
      src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
      alt: 'public',
      width: 1920,
      height: 1080,
      blurhash: ''
    }

    const result = jest.fn(() => ({
      data: {
        createCloudflareUploadByUrl: {
          id: 'uploadId',
          __typename: 'CloudflareImage'
        }
      }
    }))
    const createCloudflareUploadByUrlMock = {
      request: {
        query: CREATE_CLOUDFLARE_UPLOAD_BY_URL,
        variables: {
          url: 'https://via.placeholder.com/120x120&text=image1'
        }
      },
      result
    }

    const imageBlockResult = jest.fn(() => ({
      data: {
        imageBlockCreate: {
          __typename: 'ImageBlock',
          id: image.id,
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          parentOrder: image.parentOrder,
          blurhash: image.blurhash
        }
      }
    }))

    const journeyResult = jest.fn(() => ({
      data: {
        journeyUpdate: {
          __typename: 'Journey',
          id: 'journeyId',
          primaryImageBlock: {
            id: image.id
          }
        }
      }
    }))

    const { getByTestId, getByRole } = render(
      <MockedProvider
        mocks={[
          createCloudflareUploadByUrlMock,
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_CREATE,
              variables: {
                input: {
                  journeyId: 'journeyId',
                  src: image.src,
                  alt: image.alt
                }
              }
            },
            result: imageBlockResult
          },
          {
            request: {
              query: JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE,
              variables: {
                id: 'journeyId',
                input: {
                  primaryImageBlockId: image.id
                }
              }
            },
            result: journeyResult
          }
        ]}
      >
        <SnackbarProvider>
          <ThemeProvider>
            <Editor journey={journey}>
              <PageWrapper
                bottomPanelChildren={<ControlPanel />}
                customSidePanel={<Drawer />}
              >
                <JourneyEdit />
              </PageWrapper>
            </Editor>
          </ThemeProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await waitFor(() => fireEvent.click(getByTestId('NavigationCardSocial')))
    await waitFor(() =>
      expect(getByTestId('SocialPreview')).toBeInTheDocument()
    )
    expect(getByTestId('journey-edit-content')).toHaveStyle({
      backgroundColor: 'none'
    })
    fireEvent.click(getByRole('button', { name: 'Change' }))
    await waitFor(() => fireEvent.click(getByRole('tab', { name: 'Custom' })))
    fireEvent.click(getByRole('button', { name: 'Add image by URL' }))
    const textBox = getByRole('textbox')
    fireEvent.change(textBox, {
      target: {
        value: 'https://via.placeholder.com/120x120&text=image1'
      }
    })
    fireEvent.blur(textBox)
    await waitFor(() => expect(result).toHaveBeenCalled())
    // missing
    await waitFor(() =>
      expect(getByTestId('social-preview-post-empty')).toBeInTheDocument()
    )
    // await waitFor(() =>
    //   expect(getByRole('img')).toHaveAttribute(
    //     'src',
    //     'https://via.placeholder.com/120x120&text=image1'
    //   )
    // )
  })
})
