import { MockedProvider } from '@apollo/client/testing'
import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../__generated__/BlockFields'

import { ImageLibrary } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('ImageLibrary', () => {
  const imageBlock: ImageBlock = {
    id: 'imageBlockId',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    alt: 'random image from unsplash',
    width: 1600,
    height: 1067,
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    parentBlockId: 'card',
    parentOrder: 0,
    scale: null,
    focalLeft: 50,
    focalTop: 50
  }

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should switch tabs', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageLibrary
              open
              onClose={jest.fn()}
              onChange={jest.fn()}
              onDelete={jest.fn()}
              selectedBlock={imageBlock}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Custom')).toBeInTheDocument()
    })

    it('should render the Image Library on the right', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageLibrary
              open
              onClose={jest.fn()}
              onChange={jest.fn()}
              onDelete={jest.fn()}
              selectedBlock={imageBlock}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(
        screen.getByTestId('ImageBlockEditor').parentElement?.parentElement
      ).toHaveClass('swiper-no-swiping MuiBox-root')
    })

    it('should close ImageLibrary on close Icon click', () => {
      const onClose = jest.fn()
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageLibrary
              open
              onClose={onClose}
              onChange={jest.fn()}
              onDelete={jest.fn()}
              selectedBlock={imageBlock}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getAllByRole('button')[0]).toContainElement(
        screen.getByTestId('X2Icon')
      )
      fireEvent.click(screen.getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the Image Library from the bottom', () => {
      render(
        <MockedProvider>
          <SnackbarProvider>
            <ImageLibrary
              open
              onClose={jest.fn()}
              onChange={jest.fn()}
              onDelete={jest.fn()}
              selectedBlock={imageBlock}
            />
          </SnackbarProvider>
        </MockedProvider>
      )
      expect(screen.getByText('Custom')).toBeInTheDocument()
      expect(
        screen.getByTestId('ImageBlockEditor').parentElement?.parentElement
      ).toHaveClass('swiper-no-swiping MuiBox-root')
    })
  })
})
