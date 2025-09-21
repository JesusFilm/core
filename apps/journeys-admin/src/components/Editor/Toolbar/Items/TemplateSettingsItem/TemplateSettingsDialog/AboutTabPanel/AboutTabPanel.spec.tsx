import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { AboutTabPanel } from './AboutTabPanel'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('AboutTabPanel', () => {
  afterEach(() => jest.clearAllMocks())

  it('should call onChange on form change', async () => {
    const handleChange = jest.fn()
    const { getByLabelText } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: { creatorDescription: '', strategySlug: '' },
              handleChange
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <AboutTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    fireEvent.change(getByLabelText('Paste URL here'), {
      target: { value: 'https://www.canva.com/design/DAFvDBw1z1A/view' }
    })
    await waitFor(() => expect(handleChange).toHaveBeenCalled())
  })

  it('should validate form on error', async () => {
    const { getByText } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: { creatorDescription: '', strategySlug: '' },
              errors: { strategySlug: 'Invalid embed link' }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <AboutTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('Invalid embed link')).toBeInTheDocument()
    )
  })

  it('should render strategy section preview with old canva links', async () => {
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                creatorDescription: '',
                strategySlug: 'https://www.canva.com/design/DAFvDBw1z1A/view'
              }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <AboutTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toBeInTheDocument()
  })

  it('should render strategy section preview with new canva links', async () => {
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                creatorDescription: '',
                strategySlug:
                  'https://www.canva.com/design/DAF9QMJYu1Y/XmioFIQOATVa-lXCEYucmg/view'
              }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <AboutTabPanel />
        </FormikProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toBeInTheDocument()
  })

  it('should render Customize Template text area', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <FormikProvider
          value={
            {
              values: {
                creatorDescription: '',
                strategySlug:
                  'https://www.canva.com/design/DAF9QMJYu1Y/XmioFIQOATVa-lXCEYucmg/view'
              }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <FlagsProvider flags={{ journeyCustomization: true }}>
            <AboutTabPanel />
          </FlagsProvider>
        </FormikProvider>
      </MockedProvider>
    )

    expect(getByTestId('CustomizeTemplateSection')).toBeInTheDocument()
  })
})
