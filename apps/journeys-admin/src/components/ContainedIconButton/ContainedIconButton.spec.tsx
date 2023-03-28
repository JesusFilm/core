import { render, fireEvent } from '@testing-library/react'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import AddIcon from '@mui/icons-material/Add'
import { noop } from 'lodash'
import { ContainedIconButton } from './ContainedIconButton'

describe('ContainedIconButton', () => {
  it('should render button', async () => {
    const { getByRole } = render(
      <ContainedIconButton
        thumbnailIcon={<NoteAddIcon />}
        label="Label"
        handleClick={noop}
        actionIcon={<AddIcon />}
      />
    )

    expect(getByRole('button')).toHaveTextContent('Label')
  })

  it('should call handleClick on button click', () => {
    const { getByRole } = render(
      <ContainedIconButton
        thumbnailIcon={<NoteAddIcon />}
        label="Label"
        handleClick={noop}
        actionIcon={<AddIcon />}
      />
    )
    fireEvent.click(getByRole('button'))

    expect(noop).toHaveBeenCalled()
  })
})
