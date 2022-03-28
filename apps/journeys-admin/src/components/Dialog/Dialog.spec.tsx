import Typography from '@mui/material/Typography'
import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'
import { noop } from 'lodash'
import { Dialog, DialogProps } from './Dialog'

describe('Dialog', () => {
  const dialogProps: DialogProps = {
    open: true,
    handleClose: jest.fn(),
    dialogAction: {
      onSubmit: jest.fn(),
      submitText: 'Accept'
    },
    title: 'Title',
    description: 'Description',
    children: <Typography>Children</Typography>
  }
  it('should display the content', () => {
    const { getByText } = render(<Dialog {...dialogProps} />)
    expect(getByText('Title')).toBeInTheDocument()
    expect(getByText('Description')).toBeInTheDocument()
    expect(getByText('Children')).toBeInTheDocument()
  })

  it('should close the dialog when the close button is clicked', () => {
    const { getByTestId } = render(<Dialog {...dialogProps} />)
    fireEvent.click(getByTestId('CloseRoundedIcon'))
    expect(dialogProps.handleClose).toHaveBeenCalled()
  })

  it('should close the dialog when cancel is clicked', () => {
    const { getByRole } = render(<Dialog {...dialogProps} />)
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(dialogProps.handleClose).toHaveBeenCalled()
  })

  it('should call the submit function', () => {
    const { getByRole } = render(<Dialog {...dialogProps} />)
    fireEvent.click(getByRole('button', { name: 'Accept' }))
    expect(dialogProps.dialogAction?.onSubmit).toHaveBeenCalled()
  })
})
