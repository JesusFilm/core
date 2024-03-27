import { ApolloError } from '@apollo/client'
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

  it('should show error', () => {
    const { getByText } = render(
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
          errors={{ message: 'some error message' } as unknown as ApolloError}
        />
      </FormikProvider>
    )

    expect(getByText('some error message')).toBeInTheDocument()
  })

  it('should notify user that the domain name is a duplicate', () => {
    const { getByText } = render(
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
          errors={
            {
              message: 'Unique constraint failed on the fields: (`name`)'
            } as unknown as ApolloError
          }
        />
      </FormikProvider>
    )

    expect(getByText('domain name already exists')).toBeInTheDocument()
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
        <DomainNameUpdateForm
          loading={false}
          showDeleteButton={false}
          errors={
            {
              message: 'Unique constraint failed on the fields: (`name`)'
            } as unknown as ApolloError
          }
        />
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
