import { MockedProvider } from '@apollo/client/testing'
import { render } from '@testing-library/react'
import { FormikContextType, FormikProvider } from 'formik'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { publishedGlobalTemplate } from '../../../../../../JourneyList/journeyListData'
import { TemplateSettingsFormValues } from '../useTemplateSettingsForm'

import { AboutTabPanel } from './AboutTabPanel'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

// NES-1678: The strategy-section tests (`should call onChange on form change`,
// `should validate form on error`, `should not show strategy section for local
// template`, `should render strategy section preview with old/new canva links`)
// were removed alongside the UI. The form still carries `strategySlug` through
// `TemplateSettingsFormValues` (via `JourneyUpdateInput`) so existing values
// round-trip on save, but there is no editing surface to assert against.
describe('AboutTabPanel', () => {
  afterEach(() => jest.clearAllMocks())

  it('should render Customize Template text area', () => {
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: publishedGlobalTemplateJourney }}>
          <FormikProvider
            value={
              {
                values: {
                  creatorDescription: ''
                }
              } as unknown as FormikContextType<TemplateSettingsFormValues>
            }
          >
            <AboutTabPanel />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(getByTestId('CustomizeTemplateSection')).toBeInTheDocument()
  })

  it('does not render the strategy section editing surface (NES-1678)', () => {
    // Regression guard: with a global-template journey (which used to show
    // the strategy section), neither the URL field nor the StrategySection
    // preview should render. If the section comes back, this assertion
    // will fail first.
    const publishedGlobalTemplateJourney =
      publishedGlobalTemplate as unknown as Journey
    const { queryByText, queryByTestId, queryByLabelText } = render(
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
            <AboutTabPanel />
          </FormikProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    expect(queryByLabelText('Paste URL here')).not.toBeInTheDocument()
    expect(queryByText('Paste URL here')).not.toBeInTheDocument()
    expect(queryByTestId('StrategySlugEdit')).not.toBeInTheDocument()
    expect(queryByTestId('strategy-iframe')).not.toBeInTheDocument()
    expect(
      queryByTestId('case-study-preview-placeholder')
    ).not.toBeInTheDocument()
  })
})
