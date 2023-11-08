import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { MetadataTabPanel } from './MetadataTabPanel'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('MetadataTabPanel', () => {
  afterEach(() => jest.clearAllMocks())

  it('should handle form change', () => {
    const handleChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: { title: '', description: '', featuredAt: false },
              handleChange
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <MetadataTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox', { name: 'Title' }), {
      target: { value: 'My Cool Journey' }
    })

    expect(handleChange).toHaveBeenCalled()
    jest.clearAllMocks()
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.change(getByRole('textbox', { name: 'Description' }), {
      target: { value: 'My cool description' }
    })

    expect(handleChange).toHaveBeenCalled()
    jest.clearAllMocks()
    expect(handleChange).not.toHaveBeenCalled()

    fireEvent.click(getByRole('checkbox', { name: 'Featured' }))
    expect(handleChange).toHaveBeenCalled()
  })
})
