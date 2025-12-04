import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { RenderResult, render } from '@testing-library/react'
import { User } from 'next-firebase-auth'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '../../ThemeProvider'
import type { JourneyListEvent } from '../JourneyList'
import type { ContentType, JourneyStatusFilter } from '../JourneyListView'
import { SortOrder } from '../JourneySort'

import { JourneyListContent } from './JourneyListContent'

export interface RenderJourneyListContentOptions {
  mocks: MockedResponse[]
  contentType: ContentType
  status: JourneyStatusFilter
  user?: User
  event?: JourneyListEvent
  sortOrder?: SortOrder
}

export const renderJourneyListContent = (
  options: RenderJourneyListContentOptions
): RenderResult => {
  const { mocks, contentType, status, user, event, sortOrder } = options

  return render(
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <SnackbarProvider>
          <JourneyListContent
            contentType={contentType}
            status={status}
            user={user}
            event={event}
            sortOrder={sortOrder}
          />
        </SnackbarProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}
