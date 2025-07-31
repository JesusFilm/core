import { fireEvent, render, screen } from '@testing-library/react'

import { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'

import { GridVariant } from './GridVariant'

describe('GridVariant', () => {
  it('should show label', () => {
    render(<GridVariant label="label" handleClick={jest.fn()} children={[]} />)

    expect(screen.getByText('label')).toBeInTheDocument()
  })

  it('should show editable label', () => {
    render(
      <GridVariant
        label="label"
        editableLabel={<span>editableLabel</span>}
        handleClick={jest.fn()}
        children={[]}
      />
    )

    expect(screen.getByText('editableLabel')).toBeInTheDocument()
  })

  it('should handleClick', () => {
    const handleClick = jest.fn()

    render(
      <GridVariant label="label" handleClick={handleClick} children={[]} />
    )

    fireEvent.click(screen.getByTestId('JourneysRadioOptionGrid'))

    expect(handleClick).toHaveBeenCalled()
  })

  it('should show default image', () => {
    render(<GridVariant label="label" handleClick={jest.fn()} children={[]} />)

    expect(screen.getByTestId('LogoGrayscaleIcon')).toBeInTheDocument()
  })

  it('should show image', () => {
    const imageBlock = {
      id: '123',
      src: 'https://example.com/image.jpg',
      alt: 'poll image'
    } as unknown as TreeBlock<ImageFields>

    render(
      <GridVariant
        label="label"
        handleClick={jest.fn()}
        children={[imageBlock]}
        pollOptionImageId="123"
      />
    )

    expect(screen.getByRole('img', { name: 'poll image' })).toBeInTheDocument()
  })
})
