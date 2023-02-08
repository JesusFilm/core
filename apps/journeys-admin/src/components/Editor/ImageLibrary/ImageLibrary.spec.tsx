import { fireEvent, render } from '@testing-library/react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
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
    parentOrder: 0
  }

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should switch tabs', () => {
      const { getByText } = render(
        <ImageLibrary
          open
          onClose={jest.fn()}
          onChange={jest.fn()}
          onDelete={jest.fn()}
          selectedBlock={imageBlock}
        />
      )
      expect(getByText('Custom')).toBeInTheDocument()
    })

    it('should render the Image Library on the right', () => {
      const { getByText, getByTestId } = render(
        <ImageLibrary
          open
          onClose={jest.fn()}
          onChange={jest.fn()}
          onDelete={jest.fn()}
          selectedBlock={imageBlock}
        />
      )
      expect(getByText('Unsplash')).toBeInTheDocument()
      expect(getByTestId('ImageLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorRight'
      )
    })

    it('should close ImageLibrary on close Icon click', () => {
      const onClose = jest.fn()
      const { getAllByRole, getByTestId } = render(
        <ImageLibrary
          open
          onClose={onClose}
          onChange={jest.fn()}
          onDelete={jest.fn()}
          selectedBlock={imageBlock}
        />
      )
      expect(getAllByRole('button')[0]).toContainElement(
        getByTestId('CloseIcon')
      )
      fireEvent.click(getAllByRole('button')[0])
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('xsDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should render the Image Library from the bottom', () => {
      const { getByText, getByTestId } = render(
        <ImageLibrary
          open
          onClose={jest.fn()}
          onChange={jest.fn()}
          onDelete={jest.fn()}
          selectedBlock={imageBlock}
        />
      )
      expect(getByText('Unsplash')).toBeInTheDocument()
      expect(getByTestId('ImageLibrary').parentElement).toHaveClass(
        'MuiDrawer-paperAnchorBottom'
      )
    })
  })

  // TODO:
  // Unsplash Test
  // Custom Test
})
