import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useRouter } from 'next/router'
import { ReactElement, SyntheticEvent } from 'react'

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
   * True when TemplateGalleryPageList owns its own Sort/bulk-actions menu
   * for the currently active tab — computed once in JourneyList (see its
   * showTemplateInfoPanel) and passed down rather than re-derived here from
   * the flag + route (NES-1872 review).
   */
  listControlsOwnedByContent?: boolean
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
  listControlsOwnedByContent = false
}: TeamModeProps): ReactElement => {
  // Sort and the bulk-actions menu here act on every active template,
  // collections and unsectioned alike — too blunt once the Collections
  // panel is showing (NES-1872). They move down into TemplateGalleryPageList,
  // scoped to just the All Templates (unsectioned) section, instead of
  // sitting in this shared row. The status filter is unaffected.
  const hideListControls = listControlsOwnedByContent

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
        <StatusFilterControl
          selectedStatus={selectedStatus}
          handleStatusChange={handleStatusChange}
          menuMarginRight={
            hideListControls
              ? { xs: 1, sm: infoPanelActive ? -2 : -12 }
              : undefined
          }
        />
        {!hideListControls && (
          <SortControl sortOrder={sortOrder} setSortOrder={setSortOrder} />
        )}
        {!hideListControls && (
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
        )}
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
