import { render, fireEvent } from '@testing-library/react'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import AddIcon from '@mui/icons-material/Add'
import { ContainedIconButton } from './ContainedIconButton'

describe('ContainedIconButton', () => {
  const onClick = jest.fn()
  const testImageSrc =
    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg'
  it('should render button', async () => {
    const { getByRole } = render(
      <ContainedIconButton
        thumbnailIcon={<NoteAddIcon />}
        label="Label"
        onClick={onClick}
        actionIcon={<AddIcon />}
      />
    )

    expect(getByRole('button')).toHaveTextContent('Label')
  })

  it('should call onClick on button click', () => {
    const { getByRole } = render(
      <ContainedIconButton
        thumbnailIcon={<NoteAddIcon />}
        label="Label"
        onClick={onClick}
        actionIcon={<AddIcon />}
      />
    )
    fireEvent.click(getByRole('button'))

    expect(onClick).toHaveBeenCalled()
  })

  it('should render imageSrc when given', () => {
    const { getByRole } = render(
      <ContainedIconButton
        imageSrc={testImageSrc}
        thumbnailIcon={<NoteAddIcon />}
        label="Label"
        onClick={onClick}
        actionIcon={<AddIcon />}
      />
    )
    expect(getByRole('imageSrc')).toHaveTextContent(
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg'
    )
  })
})
