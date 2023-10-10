import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import ArrowLeftIcon from '../../icons/ArrowLeft'

import { FormiumProvider, useFormium } from './FormiumProvider'

describe('FormiumContext', () => {
  it('should pass submit button props', () => {
    function TestComponent(): ReactElement {
      const { hiddenPageTitle, submitText, submitIcon } = useFormium()
      return (
        <>
          {!hiddenPageTitle && <Typography>Page Title</Typography>}
          <Button endIcon={submitIcon}>{submitText}</Button>
        </>
      )
    }

    const { getByTestId, getByRole, queryByText } = render(
      <FormiumProvider
        value={{
          hiddenPageTitle: true,
          submitText: 'Button Submit',
          submitIcon: <ArrowLeftIcon />
        }}
      >
        <TestComponent />
      </FormiumProvider>
    )
    expect(queryByText('Page Title')).not.toBeInTheDocument()
    expect(getByRole('button')).toHaveTextContent('Button Submit')
    expect(getByTestId('ArrowLeftIcon')).toBeInTheDocument()
  })
})
