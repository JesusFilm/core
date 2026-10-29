import { ApolloLink, InMemoryCache } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { waitFor } from '@testing-library/react'
import { parse } from 'graphql'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { CAMPAIGN_POSSIBLE_TYPES } from '@core/journeys/ui/Campaign/libs/campaignPossibleTypes'
import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import { DebounceLink } from '../../libs/apolloClient/DebounceLink'
import { GET_CAMPAIGN, useCampaignQuery } from '../../libs/useCampaignQuery'

import {
  CampaignEditorProvider,
  CampaignEditorState,
  useCampaignEditor
} from './CampaignEditorProvider'
import { campaign } from './data'
import { NavigatorHoverProvider } from './Navigator/NavigatorHover'
import { TranslationRunProvider } from './TranslationRunProvider'
import {
  CampaignCommandProvider,
  textDebounceKey
} from './utils/useCampaignCommand'

/** A cache that matches campaign fragments exactly, as the app's cache does. */
export function campaignCache(): InMemoryCache {
  return new InMemoryCache({ possibleTypes: CAMPAIGN_POSSIBLE_TYPES })
}

/** The `GetCampaign` mock for a campaign fixture. */
export function getCampaignMockFor(
  campaignProp: Campaign
): Record<string, unknown> {
  return {
    request: { query: GET_CAMPAIGN, variables: { id: campaignProp.id } },
    result: { data: { campaign: campaignProp } }
  }
}

export const getCampaignMock = getCampaignMockFor(campaign)

/** Shows the selection kind, selected block id and page the provider holds. */
export function SelectionProbe(): ReactElement {
  const { selection, state } = useCampaignEditor()
  return (
    <>
      <span data-testid="SelectionKind">{selection.kind}</span>
      <span data-testid="SelectedBlockId">{state.selectedBlockId ?? ''}</span>
      <span data-testid="SelectedRegionId">{state.selectedRegionId ?? ''}</span>
      <span data-testid="PageKind">{state.pageKind}</span>
      <span data-testid="RegionId">{state.regionId ?? ''}</span>
    </>
  )
}

/** Shows the Command stack size and the id of the command undo would run. */
export function CommandProbe(): ReactElement {
  const { state } = useCommand()
  return (
    <>
      <span data-testid="CommandCount">{state.commands.length}</span>
      <span data-testid="UndoCommandId">{state.undo?.id ?? ''}</span>
    </>
  )
}

/** Lists the campaign's regions the provider sees, one line per region, in order. */
export function RegionsProbe(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  return (
    <ul data-testid="Regions">
      {[...current.regions]
        .sort((a, b) => a.order - b.order)
        .map((region) => (
          <li key={region.id} data-testid={`Region-${region.id}`}>
            {[
              region.name,
              region.slug,
              String(region.order),
              String(region.listed),
              region.countries.map((country) => country.countryId).join(',')
            ].join('|')}
          </li>
        ))}
    </ul>
  )
}

/** Lists the campaign's blocks the provider sees, one line per block. */
export function BlocksProbe(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  return (
    <ul data-testid="Blocks">
      {current.blocks.map((block) => (
        <li key={block.id} data-testid={`Block-${block.id}`}>
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
        </li>
      ))}
    </ul>
  )
}

interface QueriedEditorProps {
  /** Rendered inside the providers once the campaign query resolves. */
  children: ReactNode
  initialState?: Partial<CampaignEditorState>
}

function QueriedEditorInner({
  children,
  initialState
}: QueriedEditorProps): ReactElement | null {
  const { data } = useCampaignQuery({ id: campaign.id })
  if (data?.campaign == null) return null
  return (
    <CampaignEditorProvider
      campaign={data.campaign}
      initialState={initialState}
    >
      <CampaignCommandProvider>
        <NavigatorHoverProvider>{children}</NavigatorHoverProvider>
      </CampaignCommandProvider>
    </CampaignEditorProvider>
  )
}

interface RenderEditorProps extends QueriedEditorProps {
  mocks?: Array<Record<string, unknown>>
  /** The campaign `GetCampaign` resolves to; defaults to the seeded fixture. */
  campaignData?: Campaign
  cache?: InMemoryCache
  /** A custom link (for instance with the DebounceLink); it must serve GetCampaign itself. */
  link?: ApolloLink
  /** The campaign the query mock serves; the seeded fixture by default. */
  campaignProp?: Campaign
}

/**
 * The editor's providers over a campaign read from the Apollo cache through
 * `GetCampaign`, so cache updates made by mutations flow back into the
 * provider as they do in the app.
 */
export function QueriedEditor({
  children,
  initialState,
  mocks = [],
  campaignData,
  cache = campaignCache(),
  link,
  campaignProp = campaign
}: RenderEditorProps): ReactElement {
  return (
    <MockedProvider
      {...(link != null
        ? { link }
        : {
            mocks: [
              getCampaignMockFor(campaignData ?? campaignProp),
              ...mocks
            ] as never
          })}
      cache={cache}
    >
      <SnackbarProvider>
        <CommandProvider>
          <TranslationRunProvider>
            <QueriedEditorInner initialState={initialState}>
              {children}
            </QueriedEditorInner>
          </TranslationRunProvider>
        </CommandProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

/** The editor's providers over the static campaign fixture; a custom `link` replaces `mocks`. */
export function StaticEditor({
  children,
  initialState,
  mocks = [],
  cache = campaignCache(),
  link,
  campaignProp = campaign
}: RenderEditorProps): ReactElement {
  return (
    <MockedProvider
      {...(link != null ? { link } : { mocks: mocks as never })}
      cache={cache}
    >
      <SnackbarProvider>
        <CommandProvider>
          <CampaignEditorProvider
            campaign={campaignProp}
            initialState={initialState}
          >
            <CampaignCommandProvider>
              <NavigatorHoverProvider>
                <TranslationRunProvider>{children}</TranslationRunProvider>
              </NavigatorHoverProvider>
            </CampaignCommandProvider>
          </CampaignEditorProvider>
        </CommandProvider>
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
  mocks: Array<Record<string, unknown>> = [],
  campaignProp: Campaign = campaign
): ApolloLink {
  return ApolloLink.from([
    new DebounceLink(500),
    new ApolloLink((operation, forward) => {
      const name = operation.operationName ?? ''
      if (name !== 'GetCampaign') requests.push(name)
      return forward(operation)
    }),
    new MockLink([
      getCampaignMockFor(campaignProp),
      {
        request: { query: PENDING_TEXT_SAVE },
        result: { data: { pendingTextSave: true } }
      },
      ...mocks
    ] as never)
  ])
}

/**
 * A button that queues a text save for a block's field on its debounce, as
 * typing does; it stays pending until something flushes it or 500 ms pass.
 */
export function PendingTextSave({
  block
}: {
  block: { __typename: string; id: string }
}): ReactElement {
  const client = useApolloClient()
  return (
    <button
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
