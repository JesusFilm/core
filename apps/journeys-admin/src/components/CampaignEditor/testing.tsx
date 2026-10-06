import { ApolloLink, InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { waitFor } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import { CAMPAIGN_POSSIBLE_TYPES } from '../../libs/apolloClient/campaignPossibleTypes'
import { GET_CAMPAIGN, useCampaignQuery } from '../../libs/useCampaignQuery'

import {
  CampaignEditorProvider,
  CampaignEditorState,
  useCampaignEditor
} from './CampaignEditorProvider'
import { campaign } from './data'

/** A cache that matches campaign fragments exactly, as the app's cache does. */
export function campaignCache(): InMemoryCache {
  return new InMemoryCache({ possibleTypes: CAMPAIGN_POSSIBLE_TYPES })
}

export const getCampaignMock = {
  request: { query: GET_CAMPAIGN, variables: { id: campaign.id } },
  result: { data: { campaign } }
}

/** Shows the selection kind, selected block id and page the provider holds. */
export function SelectionProbe(): ReactElement {
  const { selection, state } = useCampaignEditor()
  return (
    <>
      <span data-testid="SelectionKind">{selection.kind}</span>
      <span data-testid="SelectedBlockId">{state.selectedBlockId ?? ''}</span>
      <span data-testid="PageKind">{state.pageKind}</span>
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
      {children}
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
  link
}: RenderEditorProps): ReactElement {
  const campaignMock =
    campaignData == null
      ? getCampaignMock
      : { ...getCampaignMock, result: { data: { campaign: campaignData } } }
  return (
    <MockedProvider
      {...(link != null
        ? { link }
        : { mocks: [campaignMock, ...mocks] as never })}
      cache={cache}
    >
      <CommandProvider>
        <QueriedEditorInner initialState={initialState}>
          {children}
        </QueriedEditorInner>
      </CommandProvider>
    </MockedProvider>
  )
}

/** The editor's providers over the static campaign fixture. */
export function StaticEditor({
  children,
  initialState,
  mocks = [],
  cache = campaignCache(),
  campaignProp = campaign
}: RenderEditorProps & { campaignProp?: Campaign }): ReactElement {
  return (
    <MockedProvider mocks={mocks as never} cache={cache}>
      <CommandProvider>
        <CampaignEditorProvider
          campaign={campaignProp}
          initialState={initialState}
        >
          {children}
        </CampaignEditorProvider>
      </CommandProvider>
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
