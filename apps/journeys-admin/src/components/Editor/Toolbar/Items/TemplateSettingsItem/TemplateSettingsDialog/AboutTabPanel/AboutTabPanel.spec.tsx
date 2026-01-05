import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import {
  publishedGlobalTemplate,
  publishedLocalTemplate
} from '../../../../../../JourneyList/journeyListData'
import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { AboutTabPanel } from './AboutTabPanel'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('AboutTabPanel', () => {
  afterEach(() => jest.clearAllMocks())

  it('should call onChange on form change', async () => {
    const handleChange = jest.fn()
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showStrategySection =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'
    const { getByLabelText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: { creatorDescription: '', strategySlug: '' },
                handleChange
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <AboutTabPanel showStrategySection={showStrategySection} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.change(getByLabelText('Paste URL here'), {
      target: { value: 'https://www.canva.com/design/DAFvDBw1z1A/view' }
    })
    await waitFor(() => expect(handleChange).toHaveBeenCalled())
  })

  it('should validate form on error', async () => {
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showStrategySection =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'
    const { getByText } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: { creatorDescription: '', strategySlug: '' },
                errors: { strategySlug: 'Invalid embed link' }
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <AboutTabPanel showStrategySection={showStrategySection} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(getByText('Invalid embed link')).toBeInTheDocument()
    )
  })

  it('should not show strategy section for local template', () => {
    const publishedLocalTemplateJourney =
      publishedLocalTemplate as unknown as Journey
    const showStrategySection =
      publishedLocalTemplateJourney.team?.id === 'jfp-team'
    const { queryByText, queryByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedLocalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: { creatorDescription: '', strategySlug: '' }
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <AboutTabPanel showStrategySection={showStrategySection} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    expect(queryByText('Paste URL here')).not.toBeInTheDocument()
    expect(queryByTestId('strategy-iframe')).not.toBeInTheDocument()
  })

  it('should render strategy section preview with old canva links', async () => {
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showStrategySection =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
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
            <AboutTabPanel showStrategySection={showStrategySection} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toBeInTheDocument()
  })

  it('should render strategy section preview with new canva links', async () => {
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showStrategySection =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'
    const { queryByText, getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
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
            <AboutTabPanel showStrategySection={showStrategySection} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(queryByText('Strategy')).not.toBeInTheDocument()
    expect(getByTestId('strategy-iframe')).toBeInTheDocument()
  })

  it('should render Customize Template text area', () => {
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const showStrategySection =
      publishedGlobalTemplateJourney.team?.id === 'jfp-team'
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
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
            <AboutTabPanel showStrategySection={showStrategySection} />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByTestId('CustomizeTemplateSection')).toBeInTheDocument()
  })
})
