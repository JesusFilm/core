import {
  Form,
  FormElementType,
  FormStatus,
  FormSubmitLayout,
  FormValidate
} from '@formium/types'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { formiumClient } from '../../libs/formiumClient'
import ArrowRight from '../icons/ArrowRight'

import { FormiumForm } from './FormiumForm'

jest.mock('@core/shared/ui/formiumClient', () => ({
  __esModule: true,
  formiumClient: {
    submitForm: jest.fn()
  }
}))

const form: Form = {
  actionIds: [],
  createAt: '2023-10-09T02:59:18.299Z',
  createId: '65076cdeaa22460001b3d3ea',
  customerId: '65076cedaa22460001b3d3ec',
  id: '65236c864f0b2e0001233fed',
  keys: [],
  name: 'single-page-test',
  previewUrl: 'https://previewurl.com',
  projectId: '65076cedaa22460001b3d3ed',
  schema: {
    fields: {
      'qgdEnz3-l': {
        actions: [],
        dynamic: false,
        hidden: false,
        id: 'qgdEnz3-l',
        items: ['_SmxT8v1Ur'],
        slug: '____',
        title: 'single-page-test',
        type: FormElementType.PAGE
      },
      _SmxT8v1Ur: {
        actions: [],
        dynamic: false,
        hidden: false,
        id: '_SmxT8v1Ur',
        items: [],
        slug: 'field',
        title: 'field',
        type: FormElementType.SHORT_TEXT
      }
    },
    pageIds: ['qgdEnz3-l']
  },
  status: FormStatus.ACTIVE,
  slug: 'single-page-test',
  submitCount: 0,
  submitLayout: FormSubmitLayout.LIST,
  updateAt: '2023-10-09T02:59:38.335Z',
  updateId: '65236c9a4f0b2e0001233fee',
  validate: FormValidate.ANY
}

describe('FormiumForm', () => {
  it('should render default form', () => {
    const { getByText, getByRole, getByTestId } = render(
      <FormiumForm
        form={form}
        userId="user.id"
        email="user.email"
        handleClick={jest.fn()}
      />
    )

    expect(getByText('single-page-test')).toBeInTheDocument()
    expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument()
    expect(getByTestId('CheckBrokenIcon')).toBeInTheDocument()
  })

  it('should submit form', async () => {
    const handleClick = jest.fn()
    const { getByRole } = render(
      <FormiumForm
        form={form}
        userId="user.id"
        email="user.email"
        handleClick={handleClick}
      />
    )

    fireEvent.click(getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(formiumClient.submitForm).toHaveBeenCalledWith(
        'single-page-test',
        {
          field: '',
          hiddenUserId: 'user.id',
          hiddenUserEmail: 'user.email'
        }
      )
    })
    expect(handleClick).toHaveBeenCalled()
  })

  it('should hide page title', () => {
    const { queryByText } = render(
      <FormiumForm
        form={form}
        userId="user.id"
        email="user.email"
        handleClick={jest.fn()}
        hiddenPageTitle
      />
    )

    expect(queryByText('single-page-test')).not.toBeInTheDocument()
  })

  it('should hide show custom submit button', () => {
    const { getByRole, getByTestId } = render(
      <FormiumForm
        form={form}
        userId="user.id"
        email="user.email"
        handleClick={jest.fn()}
        submitText="custom submit text"
        submitIcon={<ArrowRight />}
      />
    )

    expect(
      getByRole('button', { name: 'custom submit text' })
    ).toBeInTheDocument()
    expect(getByTestId('ArrowRightIcon')).toBeInTheDocument()
  })
})
