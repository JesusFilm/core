import Button from '@mui/material/Button'
import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import ArrowLeftIcon from '../../icons/ArrowLeft'

import { FormiumProvider, useFormium } from './FormiumProvider'

describe('FormiumContext', () => {
  it('should pass submit button props', () => {
    function TestButton(): ReactElement {
      const { submitText, submitIcon } = useFormium()
      return <Button endIcon={submitIcon}>{submitText}</Button>
    }

    const { getByTestId, getByRole } = render(
      <FormiumProvider
        value={{ submitText: 'Button Submit', submitIcon: <ArrowLeftIcon /> }}
      >
        <TestButton />
      </FormiumProvider>
    )

    expect(getByRole('button')).toHaveTextContent('Button Submit')
    expect(getByTestId('ArrowLeftIcon')).toBeInTheDocument()
  })
})
