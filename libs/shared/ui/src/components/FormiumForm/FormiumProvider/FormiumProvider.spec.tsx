import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import ArrowLeftIcon from '../../icons/ArrowLeft'

import { FormiumProvider, useFormium } from './FormiumProvider'

describe('FormiumContext', () => {
  it('should pass submit button props', () => {
    function TestButton(): ReactElement {
      const { formSubtitle, submitText, submitIcon } = useFormium()
      return (
        <>
          <Typography>{formSubtitle}</Typography>
          <Button endIcon={submitIcon}>{submitText}</Button>
        </>
      )
    }

    const { getByTestId, getByRole, getByText } = render(
      <FormiumProvider
        value={{
          formSubtitle: 'custom subtitle',
          submitText: 'Button Submit',
          submitIcon: <ArrowLeftIcon />
        }}
      >
        <TestButton />
      </FormiumProvider>
    )
    expect(getByText('custom subtitle')).toBeInTheDocument()
    expect(getByRole('button')).toHaveTextContent('Button Submit')
    expect(getByTestId('ArrowLeftIcon')).toBeInTheDocument()
  })
})
