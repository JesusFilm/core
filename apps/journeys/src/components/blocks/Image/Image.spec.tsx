import {
  fireEvent,
  renderWithApolloClient
} from '../../../../test/testingLibrary'
import { Image } from '.'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { ImageVariant } from '../../../../__generated__/globalTypes'
describe('Image', () => {
  const block: TreeBlock<ImageBlock> = {
    __typename: 'ImageBlock',
    id: 'Image1',
    label: 'Label',
    description: 'Description',
    variant: ImageVariant.LIGHT,
    parentBlockId: 'Image1',
    children: [
      {
        __typename: 'RadioOptionBlock',
        id: 'RadioOption1',
        label: 'Option 1',
        parentBlockId: 'Image1',
        action: null,
        children: []
      },
      {
        __typename: 'RadioOptionBlock',
        id: 'RadioOption2',
        label: 'Option 2',
        parentBlockId: 'Image1',
        action: null,
        children: []
      }
    ]
  }

  it('should render question props', () => {
    const { getByText, getByTestId } = renderWithApolloClient(
      <Image {...block} />
    )
    expect(getByText('Label')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
    expect(getByTestId('ImageCard')).toHaveClass(
      'MuiImageComponent-light'
    )
  })

  it('should display the correct options', () => {
    const { getByText } = renderWithApolloClient(<Image {...block} />)
    expect(getByText('Option 1')).toBeInTheDocument()
    expect(getByText('Option 2')).toBeInTheDocument()
  })

  it('should render dark theme', () => {
    const { getByTestId } = renderWithApolloClient(
      <Image {...block} variant={ImageVariant.DARK} />
    )
    expect(getByTestId('ImageCard')).toHaveClass(
      'MuiImageComponent-dark'
    )
  })

  it('should select an option OnClick', () => {
    const { getByTestId, getAllByRole } = renderWithApolloClient(
      <Image {...block} />
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(buttons[0]).not.toBeDisabled()
    expect(buttons[0]).toContainElement(
      getByTestId('RadioOptionCheckCircleIcon')
    )
  })

  it('should disable unselected options', () => {
    const { getByTestId, getAllByRole } = renderWithApolloClient(
      <Image {...block} />
    )
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    expect(
      getByTestId('RadioOptionRadioButtonUncheckedIcon')
    ).toBeInTheDocument()
    expect(buttons[1]).toBeDisabled()
    expect(buttons[1]).toContainElement(
      getByTestId('RadioOptionRadioButtonUncheckedIcon')
    )
    fireEvent.click(buttons[1])
    expect(buttons[1]).toBeDisabled()
  })
})
