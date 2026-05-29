import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { ChangeEvent, ReactElement, SyntheticEvent } from 'react'

import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import type { ContentType } from '../../JourneyListView'
import { MenuControl, SortControl, StatusFilterControl } from '../Controls'
import type { SharedModeProps } from '../shared'

export interface ContentTypeOption {
  queryParam: ContentType
  displayValue: string
  tabIndex: number
}

export interface TeamModeProps extends SharedModeProps {
  activeContentTypeTab: number
  handleContentTypeChange: (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ) => void
  contentTypeOptions: ContentTypeOption[]
  router: ReturnType<typeof useRouter>
  /**
   * True when the NES-1538 Template Info side panel is mounted to the right
   * of this view. The 3-dots overflow menu normally uses a generous negative
   * marginRight to nestle against the (otherwise empty) viewport edge — but
   * when the info panel is there, that overhang reads as the kebab icon
   * jamming into the panel's left edge. With this flag on, the overhang
   * shrinks so the icon stays clear of the panel.
   */
  infoPanelActive?: boolean
  /**
   * NES-1695 opt-in trial state for the new folder-based templates view.
   * When true AND the Templates tab is active, the Status filter and Sort
   * control disappear from this Tabs row — the folder system inside the
   * panel replaces them. Owner: JourneyList.
   */
  newViewEnabled?: boolean
  /** Setter bound to the trial Switch. */
  onNewViewEnabledChange?: (next: boolean) => void
}

export const TeamMode = ({
  activeContentTypeTab,
  handleContentTypeChange,
  contentTypeOptions,
  selectedStatus,
  handleStatusChange,
  sortOrder,
  setSortOrder,
  setActiveEvent,
  router,
  renderList,
  infoPanelActive = false,
  newViewEnabled = false,
  onNewViewEnabledChange
}: TeamModeProps): ReactElement => {
  const { t } = useTranslation('apps-journeys-admin')
  const templatesTabIndex = contentTypeOptions[1].tabIndex
  const onTemplatesTab = activeContentTypeTab === templatesTabIndex
  const hideStatusAndSort = onTemplatesTab && newViewEnabled
  function handleToggleNewView(
    _event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ): void {
    onNewViewEnabledChange?.(checked)
  }
  return (
    <>
      <Tabs
        value={activeContentTypeTab}
        onChange={handleContentTypeChange}
        aria-label="journey content type tabs"
        data-testid="journey-list-view"
        sx={{
          // Allow overflow to prevent hover circle on JourneyListMenu from being clipped
          // MUI Tabs uses an internal scroller with overflow: hidden by default
          overflow: 'visible',
          pr: 2,
          display: 'flex',
          alignItems: 'center',
          '& .MuiTabs-scroller': {
            overflow: 'visible !important'
          },
          '& .MuiTab-root': {
            typography: 'subtitle2'
          }
        }}
      >
        <Tab
          label={contentTypeOptions[0].displayValue}
          {...tabA11yProps(
            'journeys-content-panel',
            contentTypeOptions[0].tabIndex
          )}
        />
        <Tab
          label={contentTypeOptions[1].displayValue}
          {...tabA11yProps(
            'templates-content-panel',
            contentTypeOptions[1].tabIndex
          )}
        />
        {!hideStatusAndSort && (
          <StatusFilterControl
            selectedStatus={selectedStatus}
            handleStatusChange={handleStatusChange}
          />
        )}
        {!hideStatusAndSort && (
          <SortControl sortOrder={sortOrder} setSortOrder={setSortOrder} />
        )}
        {/* NES-1695 opt-in trial toggle — only meaningful in the Templates tab.
          Sits at the right of the Tabs row alongside the existing 3-dot
          MenuControl. When ON, the Status/Sort filters above are hidden
          because the folder system in the panel replaces them. */}
        {onTemplatesTab && onNewViewEnabledChange != null && (
          <Box sx={{ ml: hideStatusAndSort ? 'auto' : 1, mr: 1 }}>
            <FormControlLabel
              data-testid="TemplatesNewViewToggleLabel"
              control={
                <Switch
                  data-testid="TemplatesNewViewToggle"
                  size="small"
                  checked={newViewEnabled}
                  onChange={handleToggleNewView}
                  inputProps={{
                    'aria-label': t('Toggle the new templates view')
                  }}
                />
              }
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2">
                    {t('Try the new view')}
                  </Typography>
                  <Chip label={t('Beta')} size="small" />
                </Stack>
              }
              sx={{ mr: 0 }}
            />
          </Box>
        )}
        <MenuControl
          setActiveEvent={setActiveEvent}
          menuMarginRight={{
            xs: 1,
            sm:
              router?.query?.type === 'templates'
                ? infoPanelActive
                  ? -2
                  : -12
                : -8
          }}
        />
      </Tabs>
      {/* Journeys tab panel */}
      <TabPanel
        name="journeys-content-panel"
        value={activeContentTypeTab}
        index={contentTypeOptions[0].tabIndex}
        unmountUntilVisible={
          router?.query?.type !== undefined &&
          router?.query?.type !== 'journeys'
        }
      >
        {renderList('journeys', selectedStatus)}
      </TabPanel>
      {/* Templates tab panel */}
      <TabPanel
        name="templates-content-panel"
        value={activeContentTypeTab}
        index={contentTypeOptions[1].tabIndex}
        unmountUntilVisible={
          router?.query?.type !== undefined &&
          router?.query?.type !== 'templates'
        }
      >
        {renderList('templates', selectedStatus)}
      </TabPanel>
    </>
  )
}
