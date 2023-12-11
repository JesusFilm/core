import { Form as FormiumFormType } from '@formium/types'
import { render } from '@testing-library/react'

import { TreeBlock } from '../../libs/block'

import { FormFields } from './__generated__/FormFields'

import { Form } from '.'

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn(() => ({ id: 'userId', name: 'userName' }))
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Form', () => {
  it('should render form', () => {
    const block = {
      id: 'formBlock.id',
      form: { id: 'form.id', name: 'form name' } as unknown as FormiumFormType
    } as unknown as TreeBlock<FormFields>

    const { getByTestId } = render(<Form {...block} />)
    expect(getByTestId('FormBlock-formBlock.id')).toBeInTheDocument()
  })

  it('should render placeholder', () => {
    const block = {
      id: 'formBlock.id'
    } as unknown as TreeBlock<FormFields>

    const { getByText } = render(<Form {...block} />)
    expect(getByText('Form')).toBeInTheDocument()
  })
})
