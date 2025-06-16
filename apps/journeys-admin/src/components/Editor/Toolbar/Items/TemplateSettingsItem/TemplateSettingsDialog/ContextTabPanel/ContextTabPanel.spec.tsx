import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'
import { HttpResponse, http } from 'msw'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { mswServer } from '../../../../../../../../test/mswServer'
import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { ContextTabPanel } from './ContextTabPanel'

jest.mock('next-firebase-auth', () => ({
  useUser: () => ({ getIdToken: () => Promise.resolve('token') })
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (str: string) => str })
}))

describe('ContextTabPanel', () => {
  it('renders and allows typing', () => {
    const handleChange = jest.fn()
    const { getByLabelText } = render(
      <JourneyProvider value={{ journey: defaultJourney }}>
        <FormikProvider
          value={
            {
              values: { context: '' },
              errors: {},
              handleChange
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <ContextTabPanel />
        </FormikProvider>
      </JourneyProvider>
    )
    fireEvent.change(getByLabelText('AI Context'), {
      target: { value: 'test' }
    })
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows error message', () => {
    const { getByText } = render(
      <JourneyProvider value={{ journey: defaultJourney }}>
        <FormikProvider
          value={
            {
              values: { context: '' },
              errors: { context: 'Some error' }
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <ContextTabPanel />
        </FormikProvider>
      </JourneyProvider>
    )
    expect(getByText('Some error')).toBeInTheDocument()
  })

  it('calls setFieldValue with generated text on generate', async () => {
    const setFieldValue = jest.fn()
    mswServer.use(
      http.post('/api/journey/context', () => {
        return HttpResponse.json({ text: 'generated context' })
      })
    )
    const { getByRole } = render(
      <JourneyProvider value={{ journey: defaultJourney }}>
        <FormikProvider
          value={
            {
              values: { context: '' },
              errors: {},
              handleChange: jest.fn(),
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <ContextTabPanel />
        </FormikProvider>
      </JourneyProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Generate with AI' }))
    await waitFor(() =>
      expect(setFieldValue).toHaveBeenCalledWith('context', 'generated context')
    )
  })

  it('handles fetch error gracefully', async () => {
    const setFieldValue = jest.fn()
    mswServer.use(
      http.post('/api/journey/context', () => {
        return HttpResponse.error()
      })
    )
    const { getByRole } = render(
      <JourneyProvider value={{ journey: defaultJourney }}>
        <FormikProvider
          value={
            {
              values: { context: '' },
              errors: {},
              handleChange: jest.fn(),
              setFieldValue
            } as unknown as FormikContextType<TemplateSettingsFormValues>
          }
        >
          <ContextTabPanel />
        </FormikProvider>
      </JourneyProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Generate with AI' }))
    await waitFor(() => expect(setFieldValue).not.toHaveBeenCalled())
  })
})
