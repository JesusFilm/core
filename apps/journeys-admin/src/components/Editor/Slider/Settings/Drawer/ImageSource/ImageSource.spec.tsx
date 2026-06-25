import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { SnackbarProvider } from 'notistack'
import { type Mock, type MockedFunction } from 'vitest'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'
import { JourneyFields } from '../../../../../../../__generated__/JourneyFields'
import {
  listUnsplashCollectionPhotosMock,
  triggerUnsplashDownloadMock,
  unsplashImageInput
} from '../ImageBlockEditor/UnsplashGallery/data'

import { ImageSource } from './ImageSource'

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: vi.fn()
}))

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('ImageSource', () => {
  const onChange = vi.fn()
  const onDelete = vi.fn()
  const push = vi.fn()
  const on = vi.fn()
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    parentBlockId: null,
    parentOrder: null,
    src: 'https://imagedelivery.net/cloudflare-key/uploadId/public',
    alt: 'public',
    width: 1920,
    height: 1080,
    blurhash: '',
    scale: null,
    focalLeft: 50,
    focalTop: 50,
    customizable: null
  }

  beforeEach(() => {
    ;(useMediaQuery as Mock).mockImplementation(() => true)
    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)
  })

  describe('No existing ImageBlock', () => {
    it('shows placeholders on null', async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageSource
              selectedBlock={null}
              onChange={onChange}
              onDelete={onDelete}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Select Image' }))
      await waitFor(() => {
        expect(push).toHaveBeenCalledWith(
          {
            query: { param: 'unsplash-image' }
          },
          undefined,
          { shallow: true }
        )
      })
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      expect(await screen.findByTestId('ImageUpload')).toBeInTheDocument()
    })
  })

  describe('Existing ImageBlock', () => {
    it('shows placeholders', async () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageSource
              selectedBlock={imageBlock}
              onChange={onChange}
              onDelete={onDelete}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'public Selected Image 1920 x 1080 pixels'
        })
      )
      await waitFor(() =>
        fireEvent.click(screen.getByRole('tab', { name: 'Custom' }))
      )
      expect(await screen.findByTestId('ImageUpload')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
    })

    it('calls onChange with shouldFocus false when an image is selected', async () => {
      const handleChange = vi.fn()
      render(
        <MockedProvider
          mocks={[
            listUnsplashCollectionPhotosMock,
            triggerUnsplashDownloadMock
          ]}
        >
          <SnackbarProvider>
            <ImageSource
              selectedBlock={imageBlock}
              onChange={handleChange}
              onDelete={onDelete}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'public Selected Image 1920 x 1080 pixels'
        })
      )
      await waitFor(() =>
        expect(screen.getByTestId('image-dLAN46E5wVw')).toBeInTheDocument()
      )
      fireEvent.click(
        screen.getByRole('button', {
          name: 'white dome building during daytime'
        })
      )
      // shouldFocus is false so the editor does not slide the canvas back, and
      // the drawer closes itself rather than relying on a manual close.
      await waitFor(() =>
        expect(handleChange).toHaveBeenCalledWith(
          expect.objectContaining({ src: unsplashImageInput.src }),
          false
        )
      )
    })
  })

  describe('BlockCustomizationToggle', () => {
    it('does not render when journey is not a template', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <FlagsProvider flags={{ customizableMedia: true }}>
              <JourneyProvider
                value={{
                  journey: { template: false } as unknown as JourneyFields,
                  variant: 'admin'
                }}
              >
                <CommandProvider>
                  <EditorProvider>
                    <ImageSource
                      selectedBlock={imageBlock}
                      onChange={onChange}
                      onDelete={onDelete}
                    />
                  </EditorProvider>
                </CommandProvider>
              </JourneyProvider>
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.queryByText('Needs Customization')).not.toBeInTheDocument()
    })

    it('does not render when customizableMedia flag is false', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <FlagsProvider flags={{ customizableMedia: false }}>
              <JourneyProvider
                value={{
                  journey: { template: true } as unknown as JourneyFields,
                  variant: 'admin'
                }}
              >
                <CommandProvider>
                  <EditorProvider>
                    <ImageSource
                      selectedBlock={imageBlock}
                      onChange={onChange}
                      onDelete={onDelete}
                    />
                  </EditorProvider>
                </CommandProvider>
              </JourneyProvider>
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.queryByText('Needs Customization')).not.toBeInTheDocument()
    })

    it('renders when journey is a template and customizableMedia flag is true', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <FlagsProvider flags={{ customizableMedia: true }}>
              <JourneyProvider
                value={{
                  journey: { template: true } as unknown as JourneyFields,
                  variant: 'admin'
                }}
              >
                <CommandProvider>
                  <EditorProvider>
                    <ImageSource
                      selectedBlock={imageBlock}
                      onChange={onChange}
                      onDelete={onDelete}
                    />
                  </EditorProvider>
                </CommandProvider>
              </JourneyProvider>
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Needs Customization')).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      ).not.toBeDisabled()
    })

    it('renders disabled when no image is selected', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <FlagsProvider flags={{ customizableMedia: true }}>
              <JourneyProvider
                value={{
                  journey: { template: true } as unknown as JourneyFields,
                  variant: 'admin'
                }}
              >
                <CommandProvider>
                  <EditorProvider>
                    <ImageSource
                      selectedBlock={null}
                      onChange={onChange}
                      onDelete={onDelete}
                    />
                  </EditorProvider>
                </CommandProvider>
              </JourneyProvider>
            </FlagsProvider>
          </SnackbarProvider>
        </MockedProvider>
      )

      expect(screen.getByText('Needs Customization')).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: 'Toggle customizable' })
      ).toBeDisabled()
    })
  })
})
