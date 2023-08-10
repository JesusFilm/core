import Language from '@mui/icons-material/Language'
import Typography from '@mui/material/Typography'
import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'
import { ComponentProps } from 'react'

import { Dialog } from './Dialog'

describe('Dialog', () => {
  const dialogProps: ComponentProps<typeof Dialog> = {
    open: true,
    onClose: jest.fn(),
    dialogTitle: {
      icon: <Language />,
      title: 'Title',
      closeButton: true
    },
    children: <Typography>Children</Typography>
  }

  it('should display the content', () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <Dialog {...dialogProps} />
    )
    expect(getByTestId('LanguageIcon')).toBeInTheDocument()
    expect(getByText('Title')).toBeInTheDocument()
    expect(getByText('Children')).toBeInTheDocument()
    expect(queryByTestId('dialog-action')).not.toBeInTheDocument()
  })

  it('should close the dialog when the close button is clicked', () => {
    const { getByTestId } = render(<Dialog {...dialogProps} />)
    fireEvent.click(getByTestId('CloseRoundedIcon'))
    expect(dialogProps.onClose).toHaveBeenCalled()
  })

  describe('dialogAction', () => {
    const input: ComponentProps<typeof Dialog> = {
      ...dialogProps,
      dialogAction: {
        onSubmit: jest.fn(),
        submitLabel: 'Accept',
        closeLabel: 'Cancel'
      },
      dialogActionChildren: <Typography>Custom Action Component</Typography>
    }

    it('should show Save button by default', () => {
      const { getByTestId, getByRole } = render(
        <Dialog {...input} dialogAction={{ onSubmit: jest.fn() }} />
      )
      expect(getByTestId('dialog-action').children).toHaveLength(1)
      expect(getByTestId('dialog-action').children[0]).toEqual(
        getByRole('button', { name: 'Save' })
      )
    })

    it('should show the custom labels for buttons', () => {
      const { getByTestId, getByRole } = render(<Dialog {...input} />)
      expect(getByTestId('dialog-action').children).toHaveLength(2)
      expect(getByTestId('dialog-action').children[0]).toEqual(
        getByRole('button', { name: 'Cancel' })
      )
      expect(getByTestId('dialog-action').children[1]).toEqual(
        getByRole('button', { name: 'Accept' })
      )
    })

    it('should close the dialog when cancel is clicked', () => {
      const { getByRole } = render(<Dialog {...input} />)
      fireEvent.click(getByRole('button', { name: 'Cancel' }))
      expect(dialogProps.onClose).toHaveBeenCalled()
    })

    it('should call the submit function', () => {
      const { getByRole } = render(<Dialog {...input} />)
      fireEvent.click(getByRole('button', { name: 'Accept' }))
      expect(input.dialogAction?.onSubmit).toHaveBeenCalled()
    })

    it('should show loading spinner if dialog is in submitting state', () => {
      const { getByTestId } = render(<Dialog {...input} loading />)
      expect(getByTestId('dialog-loading-icon')).toBeInTheDocument()
    })
  })

  describe('dialogActionChildren', () => {
    it('should display the dialog action component if no dialog action buttons', () => {
      const { getByText, getByTestId } = render(
        <Dialog
          {...dialogProps}
          dialogAction={undefined}
          dialogActionChildren={
            <Typography>Custom Action Component</Typography>
          }
        />
      )
      expect(getByTestId('dialog-action').children).toHaveLength(1)
      expect(getByTestId('dialog-action').children[0]).toEqual(
        getByText('Custom Action Component')
      )
    })
  })
})
