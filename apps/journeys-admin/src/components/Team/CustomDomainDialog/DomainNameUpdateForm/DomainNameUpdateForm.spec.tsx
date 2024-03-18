import { fireEvent, render } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { DomainNameUpdateForm } from './DomainNameUpdateForm'

describe('DomainNameUpdateForm', () => {
  const handleChange = jest.fn()
  const handleSubmit = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handleSubmit on delete', () => {
    const { getByRole } = render(
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
        <DomainNameUpdateForm
          loading={false}
          showDeleteButton
          errors={undefined}
        />
      </FormikProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Reset' }))
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
        <DomainNameUpdateForm
          loading={false}
          showDeleteButton={false}
          errors={undefined}
        />
      </FormikProvider>
    )

    expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Apply' }))
    expect(handleSubmit).toHaveBeenCalled()
  })
})
