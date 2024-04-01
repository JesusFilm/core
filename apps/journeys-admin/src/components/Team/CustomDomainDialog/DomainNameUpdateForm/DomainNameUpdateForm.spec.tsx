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
        <DomainNameUpdateForm loading={false} showDeleteButton />
      </FormikProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Disconnect' }))
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
        <DomainNameUpdateForm loading={false} showDeleteButton={false} />
      </FormikProvider>
    )

    expect(queryByTestId('DeleteCustomDomainIcon')).not.toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Connect' }))
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('should validate', () => {
    const { getByText } = render(
      <FormikProvider
        value={
          {
            values: { domainName: '-mockdomain.-com' },
            errors: { domainName: 'Invalid domain name' },
            handleSubmit,
            handleChange
          } as unknown as FormikContextType<{ domainName: string }>
        }
      >
        <DomainNameUpdateForm loading={false} showDeleteButton={false} />
      </FormikProvider>
    )

    expect(getByText('Invalid domain name')).toBeInTheDocument()
  })

  it('should have the proper link for instructions button', () => {
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
        <DomainNameUpdateForm loading={false} showDeleteButton={false} />
      </FormikProvider>
    )

    expect(getByRole('link', { name: 'Instructions' })).toHaveAttribute(
      'href',
      'https://support.nextstep.is/article/1365-custom-domains'
    )
    expect(getByRole('link', { name: 'Instructions' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })
})
