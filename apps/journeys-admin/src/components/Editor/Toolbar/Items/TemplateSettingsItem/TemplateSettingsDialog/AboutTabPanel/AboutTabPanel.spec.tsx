import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
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

  describe('Quick Start toggle', () => {
    const journey = publishedGlobalTemplate as unknown as Journey

    it('should render the Quick Start toggle section', () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: false },
                  setFieldValue: jest.fn()
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByTestId('QuickStartToggleSection')).toBeInTheDocument()
      expect(screen.getByText('Show Quick Start label')).toBeInTheDocument()
    })

    it('should render the Quick Start toggle as unchecked when customizable is false', () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: false },
                  setFieldValue: jest.fn()
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(
        within(screen.getByTestId('CustomizableToggle')).getByRole('checkbox')
      ).not.toBeChecked()
    })

    it('should render the Quick Start toggle as checked when customizable is true', () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: true },
                  setFieldValue: jest.fn()
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(
        within(screen.getByTestId('CustomizableToggle')).getByRole('checkbox')
      ).toBeChecked()
    })

    it('should call setFieldValue with true when toggle is switched on', async () => {
      const setFieldValue = jest.fn()

      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: false },
                  setFieldValue
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(
        within(screen.getByTestId('CustomizableToggle')).getByRole('checkbox')
      )

      await waitFor(() =>
        expect(setFieldValue).toHaveBeenCalledWith('customizable', true)
      )
    })

    it('should call setFieldValue with false when toggle is switched off', async () => {
      const setFieldValue = jest.fn()

      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: true },
                  setFieldValue
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(
        within(screen.getByTestId('CustomizableToggle')).getByRole('checkbox')
      )

      await waitFor(() =>
        expect(setFieldValue).toHaveBeenCalledWith('customizable', false)
      )
    })

    it('should show badge preview with reduced opacity when toggle is off', () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: false },
                  setFieldValue: jest.fn()
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const previewBox = screen.getByText('Preview')
        .parentElement as HTMLElement
      expect(previewBox).toHaveStyle({ opacity: '0.3' })
    })

    it('should show badge preview at full opacity when toggle is on', () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey }}>
            <FormikProvider
              value={
                {
                  values: { creatorDescription: '', customizable: true },
                  setFieldValue: jest.fn()
                } as unknown as FormikContextType<TemplateSettingsFormValues>
              }
            >
              <AboutTabPanel />
            </FormikProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      const previewBox = screen.getByText('Preview')
        .parentElement as HTMLElement
      expect(previewBox).toHaveStyle({ opacity: '1' })
    })
  })
})
