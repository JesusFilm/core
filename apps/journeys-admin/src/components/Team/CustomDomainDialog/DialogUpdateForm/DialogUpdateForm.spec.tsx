import { fireEvent, render } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { DialogUpdateForm } from './DialogUpdateForm'

describe('DialogUpdateForm', () => {
  const handleChange = jest.fn()
  const handleSubmit = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handleSubmit on delete', () => {
    const { getByTestId } = render(
      <FormikProvider
        value={
          {
            values: { domainName: 'mockdomain.com' },
            errors: { domainName: undefined },
            handleSubmit,
            handleChange
          } as unknown as FormikContextType<{ domainName: string }>
        }
      >
        <DialogUpdateForm loading={false} showDeleteButton />
      </FormikProvider>
    )

    fireEvent.click(getByTestId('DeleteCustomDomainIcon'))
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('should handleSubmit when adding domain', () => {
    const { queryByTestId, getByRole } = render(
      <FormikProvider
        value={
          {
            values: { domainName: 'mockdomain.com' },
            errors: { domainName: undefined },
            handleSubmit,
            handleChange
          } as unknown as FormikContextType<{ domainName: string }>
        }
      >
        <DialogUpdateForm loading={false} showDeleteButton={false} />
      </FormikProvider>
    )

    expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleSubmit).toHaveBeenCalled()
  })
})
