import { ApolloLink, InMemoryCache } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { MockLink, MockSubscriptionLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { act, waitFor } from '@testing-library/react'
import { parse } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { CAMPAIGN_POSSIBLE_TYPES } from '@core/journeys/ui/Campaign/libs/campaignPossibleTypes'
import { useCommand } from '@core/journeys/ui/CommandProvider'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign,
  GetCampaignVariables
} from '../../../__generated__/GetCampaign'
import { DebounceLink } from '../../libs/apolloClient/DebounceLink'
import { GET_CAMPAIGN, useCampaignQuery } from '../../libs/useCampaignQuery'
import { CommandRedoItem } from '../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../Editor/Toolbar/Items/CommandUndoItem'

import {
  CampaignEditorState,
  useCampaignEditor
} from './CampaignEditorProvider'
import { CampaignEditorProviders } from './CampaignEditorProviders'
import { campaign as campaignFixture } from './data'
import { textDebounceKey } from './utils/useCampaignCommand'

/** A cache that matches campaign fragments exactly, as the app's cache does. */
export function campaignCache(): InMemoryCache {
  return new InMemoryCache({ possibleTypes: CAMPAIGN_POSSIBLE_TYPES })
}

/** A mock whose `result` is a spy, so a spec can assert the request was sent. */
export type SpyMock = MockLink.MockedResponse & {
  result: ReturnType<typeof vi.fn>
}

/** The `GetCampaign` mock for a campaign fixture. */
export function getCampaignMockFor(campaign: Campaign): MockLink.MockedResponse<
  GetCampaign,
  GetCampaignVariables
> & {
  result: { data: GetCampaign }
} {
  return {
    request: { query: GET_CAMPAIGN, variables: { id: campaign.id } },
    result: { data: { campaign } }
  }
}

export const getCampaignMock = getCampaignMockFor(campaignFixture)

/** Shows the selection kind, selected block id and page the provider holds. */
export function SelectionProbe(): ReactElement {
  const { selection, state } = useCampaignEditor()
  return (
    <>
      <Typography component="span" data-testid="SelectionKind">
        {selection.kind}
      </Typography>
      <Typography component="span" data-testid="SelectedBlockId">
        {state.selectedBlockId ?? ''}
      </Typography>
      <Typography component="span" data-testid="SelectedRegionId">
        {state.selectedRegionId ?? ''}
      </Typography>
      <Typography component="span" data-testid="PageKind">
        {state.pageKind}
      </Typography>
      <Typography component="span" data-testid="RegionId">
        {state.regionId ?? ''}
      </Typography>
    </>
  )
}

/** Shows the Command stack size and the id of the command undo would run. */
export function CommandProbe(): ReactElement {
  const { state } = useCommand()
  return (
    <>
      <Typography component="span" data-testid="CommandCount">
        {state.commands.length}
      </Typography>
      <Typography component="span" data-testid="UndoCommandId">
        {state.undo?.id ?? ''}
      </Typography>
    </>
  )
}

/** The Undo and Redo buttons, as the Left Rail's icon buttons run them. */
export function UndoRedo(): ReactElement {
  return (
    <>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
    </>
  )
}

interface PreviewLanguageSwitchProps {
  languageIds: string[]
}

/** Buttons that set the Preview Language, as the Pages Panel's language choice does, labelled `Preview <languageId>`. */
export function PreviewLanguageSwitch({
  languageIds
}: PreviewLanguageSwitchProps): ReactElement {
  const { dispatch } = useCampaignEditor()
  return (
    <>
      {languageIds.map((languageId) => (
        <Button
          key={languageId}
          aria-label={`Preview ${languageId}`}
          onClick={() =>
            dispatch({
              type: 'SetPreviewLanguageAction',
              previewLanguageId: languageId
            })
          }
        />
      ))}
    </>
  )
}

/** Lists the campaign's regions the provider sees, one line per region, in order. */
export function RegionsProbe(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  return (
    <Box component="ul" data-testid="Regions">
      {[...current.regions]
        .sort((a, b) => a.order - b.order)
        .map((region) => (
          <Box
            component="li"
            key={region.id}
            data-testid={`Region-${region.id}`}
          >
            {[
              region.name,
              region.slug,
              String(region.order),
              String(region.listed),
              region.countries.map((country) => country.countryId).join(',')
            ].join('|')}
          </Box>
        ))}
    </Box>
  )
}

/** Lists the campaign's blocks the provider sees, one line per block. */
export function BlocksProbe(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  return (
    <Box component="ul" data-testid="Blocks">
      {current.blocks.map((block) => (
        <Box component="li" key={block.id} data-testid={`Block-${block.id}`}>
          {[
            block.__typename,
            block.parentBlockId ?? '',
            String(block.parentOrder),
            'placement' in block ? String(block.placement) : '',
            'content' in block ? JSON.stringify(block.content) : '',
            'label' in block ? JSON.stringify(block.label) : '',
            'align' in block ? String(block.align) : '',
            'action' in block ? String(block.action?.__typename ?? null) : ''
          ].join('|')}
        </Box>
      ))}
    </Box>
  )
}

interface EditorProps {
  /** Rendered inside the editor's providers. */
  children: ReactNode
  initialState?: Partial<CampaignEditorState>
  mocks?: MockLink.MockedResponse[]
  cache?: InMemoryCache
  /** A custom link (for instance with the DebounceLink); it replaces `mocks`, and for QueriedEditor it must serve GetCampaign itself. */
  link?: ApolloLink
  /** The campaign the editor opens (and `GetCampaign` resolves to); the seeded fixture by default. */
  campaign?: Campaign
}

interface QueriedProvidersProps {
  children: ReactNode
  campaignId: string
  initialState?: Partial<CampaignEditorState>
}

function QueriedProviders({
  children,
  campaignId,
  initialState
}: QueriedProvidersProps): ReactElement | null {
  const { data } = useCampaignQuery({ id: campaignId })
  if (data?.campaign == null) return null
  return (
    <CampaignEditorProviders
      campaign={data.campaign}
      initialState={initialState}
    >
      {children}
    </CampaignEditorProviders>
  )
}

/**
 * The editor's providers over a campaign read from the Apollo cache through
 * `GetCampaign`, so cache updates made by mutations flow back into the
 * provider as they do in the app. Children render once the query resolves.
 */
export function QueriedEditor({
  children,
  initialState,
  mocks = [],
  cache = campaignCache(),
  link,
  campaign = campaignFixture
}: EditorProps): ReactElement {
  return (
    <MockedProvider
      {...(link != null
        ? { link }
        : { mocks: [getCampaignMockFor(campaign), ...mocks] })}
      cache={cache}
    >
      <SnackbarProvider>
        <QueriedProviders campaignId={campaign.id} initialState={initialState}>
          {children}
        </QueriedProviders>
      </SnackbarProvider>
    </MockedProvider>
  )
}

/** The editor's providers over a static campaign; mutations' cache writes do not reach it. */
export function StaticEditor({
  children,
  initialState,
  mocks = [],
  cache = campaignCache(),
  link,
  campaign = campaignFixture
}: EditorProps): ReactElement {
  return (
    <MockedProvider {...(link != null ? { link } : { mocks })} cache={cache}>
      <SnackbarProvider>
        <CampaignEditorProviders
          campaign={campaign}
          initialState={initialState}
        >
          {children}
        </CampaignEditorProviders>
      </SnackbarProvider>
    </MockedProvider>
  )
}

/** Wait until the canvas iframe has rendered the given test id, then return the frame body. */
export async function frameBody(
  baseElement: HTMLElement,
  testId: string
): Promise<HTMLElement> {
  const iframe = baseElement.getElementsByTagName('iframe')[0]
  await waitFor(() =>
    expect(
      iframe.contentDocument?.body.querySelector(`[data-testid="${testId}"]`)
    ).not.toBeNull()
  )
  return iframe.contentDocument?.body as HTMLElement
}

// Not an API field, so it is parsed rather than tagged with gql to keep
// codegen from validating it against the schema.
const PENDING_TEXT_SAVE = parse(`
  mutation PendingTextSave {
    pendingTextSave
  }
`)

/**
 * The editor's link with the app's DebounceLink in front, and a spy that
 * pushes each mutation's name onto `requests` as it reaches the API.
 */
export function debounceSpyLink(
  requests: string[],
  mocks: MockLink.MockedResponse[] = [],
  campaign: Campaign = campaignFixture
): ApolloLink {
  return ApolloLink.from([
    new DebounceLink(500),
    new ApolloLink((operation, forward) => {
      const name = operation.operationName ?? ''
      if (name !== 'GetCampaign') requests.push(name)
      return forward(operation)
    }),
    new MockLink([
      getCampaignMockFor(campaign),
      {
        request: { query: PENDING_TEXT_SAVE },
        result: { data: { pendingTextSave: true } }
      },
      ...mocks
    ])
  ])
}

interface PendingTextSaveProps {
  block: { __typename: string; id: string }
}

/**
 * A button that queues a text save for a block's field on its debounce, as
 * typing does; it stays pending until something flushes it or 500 ms pass.
 */
export function PendingTextSave({ block }: PendingTextSaveProps): ReactElement {
  const client = useApolloClient()
  return (
    <Button
      aria-label="Queue text save"
      onClick={() => {
        client
          .mutate({
            mutation: PENDING_TEXT_SAVE,
            context: { debounceKey: textDebounceKey(block, 'title') }
          })
          .catch(() => undefined)
      }}
    />
  )
}

/**
 * Runs `action` with the clock stopped, so every request it sends stays in
 * flight (MockLink answers on a timer) while the spec asserts the optimistic
 * state. Testing Library's async queries wait on timers, so assert
 * synchronously until `landRequests`.
 */
export async function holdRequests(action: () => void): Promise<void> {
  vi.useFakeTimers()
  action()
  await act(async () => undefined)
}

/**
 * Delivers the responses `holdRequests` held, and any request they set off,
 * then gives the real clock back.
 */
export async function landRequests(): Promise<void> {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(50)
  })
  vi.useRealTimers()
}

/**
 * Sends a result down a MockSubscriptionLink, which delivers it on a timer,
 * and lets the editor take it in along with any request it sets off.
 */
export async function emitSubscription(
  link: MockSubscriptionLink,
  result: MockSubscriptionLink.Result,
  complete = false
): Promise<void> {
  vi.useFakeTimers()
  try {
    link.simulateResult(result, complete)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50)
    })
  } finally {
    vi.useRealTimers()
  }
}
