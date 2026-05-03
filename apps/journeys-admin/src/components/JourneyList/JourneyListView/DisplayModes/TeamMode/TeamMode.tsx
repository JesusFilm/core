import Box from '@mui/material/Box'
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
  renderList
}: TeamModeProps): ReactElement => {
  const isDemoMode =
    (contentTypeOptions[2] != null &&
      activeContentTypeTab === contentTypeOptions[2].tabIndex) ||
    (contentTypeOptions[3] != null &&
      activeContentTypeTab === contentTypeOptions[3].tabIndex)

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
        {contentTypeOptions[2] != null && (
          <Tab
            label={contentTypeOptions[2].displayValue}
            {...tabA11yProps(
              'folders-demo-content-panel',
              contentTypeOptions[2].tabIndex
            )}
          />
        )}
        {contentTypeOptions[3] != null && (
          <Tab
            label={contentTypeOptions[3].displayValue}
            {...tabA11yProps(
              'collections-demo-content-panel',
              contentTypeOptions[3].tabIndex
            )}
          />
        )}
        {!isDemoMode && (
          <StatusFilterControl
            selectedStatus={selectedStatus}
            handleStatusChange={handleStatusChange}
          />
        )}
        {!isDemoMode && (
          <SortControl sortOrder={sortOrder} setSortOrder={setSortOrder} />
        )}
        {!isDemoMode && (
          <MenuControl
            setActiveEvent={setActiveEvent}
            menuMarginRight={{
              xs: 1,
              sm: router?.query?.type === 'templates' ? -12 : -8
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
        router?.query?.type !== undefined && router?.query?.type !== 'journeys'
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
        router?.query?.type !== undefined && router?.query?.type !== 'templates'
      }
    >
      {renderList('templates', selectedStatus)}
    </TabPanel>
    {/* Folders Demo tab panel */}
    {contentTypeOptions[2] != null && (
      <TabPanel
        name="folders-demo-content-panel"
        value={activeContentTypeTab}
        index={contentTypeOptions[2].tabIndex}
        unmountUntilVisible={
          router?.query?.type !== undefined &&
          router?.query?.type !== 'foldersDemo'
        }
      >
        {renderList('foldersDemo', selectedStatus)}
      </TabPanel>
    )}
    {/* Collections Demo tab panel */}
    {contentTypeOptions[3] != null && (
      <TabPanel
        name="collections-demo-content-panel"
        value={activeContentTypeTab}
        index={contentTypeOptions[3].tabIndex}
        unmountUntilVisible={
          router?.query?.type !== undefined &&
          router?.query?.type !== 'collectionsDemo'
        }
      >
        {renderList('collectionsDemo', selectedStatus)}
      </TabPanel>
    )}
  </>
  )
}
