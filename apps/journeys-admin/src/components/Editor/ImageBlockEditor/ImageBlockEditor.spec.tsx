import { fireEvent, render } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { SnackbarProvider } from 'notistack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { ImageBlockEditor } from './ImageBlockEditor'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

const image: ImageBlock = {
  id: 'image1.id',
  __typename: 'ImageBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  src: 'https://example.com/image.jpg',
  alt: 'image.jpg',
  width: 1920,
  height: 1080,
  blurhash: ''
}

const onChange = jest.fn()
const onDelete = jest.fn()

describe('ImageBlockEditor', () => {
  beforeEach(() => (useMediaQuery as jest.Mock).mockImplementation(() => true))

  it('opens the image library', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <FlagsProvider>
          <SnackbarProvider>
            <ImageBlockEditor
              selectedBlock={image}
              onChange={onChange}
              onDelete={onDelete}
            />
          </SnackbarProvider>
        </FlagsProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Select Image' }))
    expect(getByTestId('ImageLibrary')).toBeInTheDocument()
  })

  // TODO: Add relevant tests back in once unplash and cloudflare functionality is in

  // describe('No existing ImageBlock', () => {
  //   it('shows placeholders on null', async () => {
  //     const { getByTestId, getByRole } = render(
  //       <ImageBlockEditor
  //         selectedBlock={null}
  //         onChange={onChange}
  //         onDelete={onDelete}
  //       />
  //     )
  //     expect(await getByTestId('imageSrcStack')).toBeInTheDocument()
  //     const textBox = await getByRole('textbox')
  //     expect(textBox).toHaveValue('')
  //   })
  // })
  // describe('Existing ImageBlock', () => {
  //   it('shows placeholders', async () => {
  //     const { getByTestId, getByRole } = render(
  //       <ImageBlockEditor
  //         selectedBlock={image}
  //         onChange={onChange}
  //         onDelete={onDelete}
  //       />
  //     )
  //     expect(await getByTestId('imageSrcStack')).toBeInTheDocument()
  //     const textBox = await getByRole('textbox')
  //     expect(textBox).toHaveValue(image.src)
  //   })
  //   it('displays validation messages ', async () => {
  //     const { getByRole, getByText } = render(
  //       <ImageBlockEditor
  //         selectedBlock={image}
  //         onChange={onChange}
  //         onDelete={onDelete}
  //       />
  //     )
  //     const textBox = await getByRole('textbox')
  //     fireEvent.change(textBox, {
  //       target: { value: '' }
  //     })
  //     fireEvent.blur(textBox)
  //     await waitFor(() => expect(getByText('Required')).toBeInTheDocument())
  //     fireEvent.change(textBox, {
  //       target: { value: 'example.com/123' }
  //     })
  //     fireEvent.blur(textBox)
  //     await waitFor(() =>
  //       expect(getByText('Please enter a valid url')).toBeInTheDocument()
  //     )
  //   })
  // })
  // it('triggers onChange', async () => {
  //   const { getByRole } = render(
  //     <ImageBlockEditor
  //       selectedBlock={image}
  //       onChange={onChange}
  //       onDelete={onDelete}
  //     />
  //   )
  //   const textBox = await getByRole('textbox')
  //   fireEvent.change(textBox, {
  //     target: { value: 'https://example.com/123' }
  //   })
  //   fireEvent.blur(textBox)
  //   await waitFor(() => expect(onChange).toHaveBeenCalled())
  // })
  // it('triggers onDelete', async () => {
  //   const { getAllByRole } = render(
  //     <ImageBlockEditor
  //       selectedBlock={image}
  //       onChange={onChange}
  //       onDelete={onDelete}
  //     />
  //   )
  //   const deleteButton = await getAllByRole('button')[0]
  //   fireEvent.click(deleteButton)
  //   await waitFor(() => expect(onDelete).toHaveBeenCalled())
  // })
  // it('triggers onChange onPaste', async () => {
  //   const { getByRole } = render(
  //     <ImageBlockEditor
  //       selectedBlock={image}
  //       onChange={onChange}
  //       onDelete={onDelete}
  //     />
  //   )
  //   const textBox = await getByRole('textbox')
  //   await fireEvent.paste(textBox, {
  //     clipboardData: { getData: () => 'https://example.com/123' }
  //   })

  //   await waitFor(() => expect(onChange).toHaveBeenCalled())
  // })
})
