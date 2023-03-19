import { render, fireEvent } from '@testing-library/react'
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { ContainedIconButton } from './ContainedIconButton'

describe('ContainedIconButton', () => {
  const onClick = jest.fn()

  it('should render button', async () => {
    const { getByRole } = render(
      <ContainedIconButton
        icon={NoteAddIcon}
        label="Label"
        onClick={onClick}
      />
    )

    expect(getByRole('button')).toHaveTextContent(
      'Label'
    )
  })

  it('should call onClick on button click', () => {
    const { getByRole } = render(
      <ContainedIconButton
        icon={NoteAddIcon}
        label="Label"
        onClick={onClick}
      />
    )
    fireEvent.click(getByRole('button'))

    expect(onClick).toHaveBeenCalled()
  })

})
