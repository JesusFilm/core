import Typography from '@mui/material/Typography'
import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'
import { Dialog, DialogProps } from './Dialog'

describe('Dialog', () => {
  const dialogProps: DialogProps = {
    open: true,
    handleClose: jest.fn(),
    dialogTitle: {
      title: 'Title',
      closeButton: true
    },
    dialogAction: {
      onSubmit: jest.fn()
    },
    children: <Typography>Children</Typography>
  }
  it('should display the content', () => {
    const { getByText, getByRole } = render(<Dialog {...dialogProps} />)
    expect(getByText('Title')).toBeInTheDocument()
    expect(getByText('Children')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('should close the dialog when the close button is clicked', () => {
    const { getByTestId } = render(<Dialog {...dialogProps} />)
    fireEvent.click(getByTestId('CloseRoundedIcon'))
    expect(dialogProps.handleClose).toHaveBeenCalled()
  })

  it('should show the custom labels for buttons', () => {
    const input: DialogProps = {
      ...dialogProps,
      dialogAction: {
        onSubmit: jest.fn(),
        submitLabel: 'Accept',
        closeLabel: 'Cancel'
      }
    }
    const { getByRole } = render(<Dialog {...input} />)
    expect(getByRole('button', { name: 'Accept' })).toBeInTheDocument()
    expect(getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should close the dialog when cancel is clicked', () => {
    const input: DialogProps = {
      ...dialogProps,
      dialogAction: {
        onSubmit: jest.fn(),
        closeLabel: 'Cancel'
      }
    }
    const { getByRole } = render(<Dialog {...input} />)
    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(dialogProps.handleClose).toHaveBeenCalled()
  })

  it('should call the submit function', () => {
    const { getByRole } = render(<Dialog {...dialogProps} />)
    fireEvent.click(getByRole('button', { name: 'Save' }))
    expect(dialogProps.dialogAction?.onSubmit).toHaveBeenCalled()
  })
})
