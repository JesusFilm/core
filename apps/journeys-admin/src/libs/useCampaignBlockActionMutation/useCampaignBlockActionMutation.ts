import { ApolloCache, ApolloLink, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignBlockDeleteAction,
  CampaignBlockDeleteActionVariables
} from '../../../__generated__/CampaignBlockDeleteAction'
import {
  CampaignBlockUpdateLinkAction,
  CampaignBlockUpdateLinkActionVariables
} from '../../../__generated__/CampaignBlockUpdateLinkAction'
import {
  CampaignBlockUpdateNavigateToRegionAction,
  CampaignBlockUpdateNavigateToRegionActionVariables
} from '../../../__generated__/CampaignBlockUpdateNavigateToRegionAction'
import {
  CampaignBlockUpdateScrollToBlockAction,
  CampaignBlockUpdateScrollToBlockActionVariables
} from '../../../__generated__/CampaignBlockUpdateScrollToBlockAction'
import {
  GetCampaign_campaign_blocks_CampaignButtonBlock_action as CampaignButtonAction,
  GetCampaign_campaign_blocks_CampaignButtonBlock as CampaignButtonBlock
} from '../../../__generated__/GetCampaign'

export type { CampaignButtonAction, CampaignButtonBlock }

/** The action fields the editor caches on a button; the same ones the public block fields read. */
export const CAMPAIGN_ACTION_FIELDS = gql`
  fragment CampaignActionFields on CampaignAction {
    __typename
    parentBlockId
    ... on CampaignLinkAction {
      url
      target
    }
    ... on CampaignScrollToBlockAction {
      blockId
    }
    ... on CampaignNavigateToRegionAction {
      regionId
    }
  }
`

export const CAMPAIGN_BLOCK_UPDATE_LINK_ACTION = gql`
  ${CAMPAIGN_ACTION_FIELDS}
  mutation CampaignBlockUpdateLinkAction(
    $id: ID!
    $input: CampaignLinkActionInput!
  ) {
    campaignBlockUpdateLinkAction(id: $id, input: $input) {
      ...CampaignActionFields
    }
  }
`

export const CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION = gql`
  ${CAMPAIGN_ACTION_FIELDS}
  mutation CampaignBlockUpdateScrollToBlockAction(
    $id: ID!
    $input: CampaignScrollToBlockActionInput!
  ) {
    campaignBlockUpdateScrollToBlockAction(id: $id, input: $input) {
      ...CampaignActionFields
    }
  }
`

export const CAMPAIGN_BLOCK_UPDATE_NAVIGATE_TO_REGION_ACTION = gql`
  ${CAMPAIGN_ACTION_FIELDS}
  mutation CampaignBlockUpdateNavigateToRegionAction(
    $id: ID!
    $input: CampaignNavigateToRegionActionInput!
  ) {
    campaignBlockUpdateNavigateToRegionAction(id: $id, input: $input) {
      ...CampaignActionFields
    }
  }
`

export const CAMPAIGN_BLOCK_DELETE_ACTION = gql`
  ${CAMPAIGN_ACTION_FIELDS}
  mutation CampaignBlockDeleteAction($id: ID!) {
    campaignBlockDeleteAction(id: $id) {
      id
      action {
        ...CampaignActionFields
      }
    }
  }
`

type CampaignActionResult =
  | CampaignBlockUpdateLinkAction
  | CampaignBlockUpdateScrollToBlockAction
  | CampaignBlockUpdateNavigateToRegionAction
  | CampaignBlockDeleteAction

export type CampaignActionMutate = (
  block: Pick<CampaignButtonBlock, 'id'>,
  action: CampaignButtonAction | null
) => Promise<ApolloLink.Result<CampaignActionResult>>

/**
 * An action has no id of its own, so a returned action is not normalised:
 * write it onto its button's `action` field by hand. Delete returns the
 * button itself, which Apollo normalises unaided.
 */
function writeAction(
  cache: ApolloCache,
  blockId: string,
  action: CampaignButtonAction | null | undefined
): void {
  if (action === undefined) return
  cache.modify({
    id: cache.identify({ __typename: 'CampaignButtonBlock', id: blockId }),
    fields: { action: () => action }
  })
}

/**
 * Write a button's one action through the mutation for its kind, or remove
 * it, optimistically. A region action with no region (its region was deleted)
 * cannot be written back, so it removes the action instead. The returned promise rejects with the API's error so
 * the caller can show its message verbatim.
 */
export function useCampaignBlockActionMutation(): CampaignActionMutate {
  const [updateLink] = useMutation<
    CampaignBlockUpdateLinkAction,
    CampaignBlockUpdateLinkActionVariables
  >(CAMPAIGN_BLOCK_UPDATE_LINK_ACTION)
  const [updateScrollToBlock] = useMutation<
    CampaignBlockUpdateScrollToBlockAction,
    CampaignBlockUpdateScrollToBlockActionVariables
  >(CAMPAIGN_BLOCK_UPDATE_SCROLL_TO_BLOCK_ACTION)
  const [updateNavigateToRegion] = useMutation<
    CampaignBlockUpdateNavigateToRegionAction,
    CampaignBlockUpdateNavigateToRegionActionVariables
  >(CAMPAIGN_BLOCK_UPDATE_NAVIGATE_TO_REGION_ACTION)
  const [deleteAction] = useMutation<
    CampaignBlockDeleteAction,
    CampaignBlockDeleteActionVariables
  >(CAMPAIGN_BLOCK_DELETE_ACTION)

  async function removeAction(
    block: Pick<CampaignButtonBlock, 'id'>
  ): ReturnType<CampaignActionMutate> {
    return await deleteAction({
      variables: { id: block.id },
      optimisticResponse: {
        campaignBlockDeleteAction: {
          __typename: 'CampaignButtonBlock',
          id: block.id,
          action: null
        }
      }
    })
  }

  return async function mutate(block, action) {
    switch (action?.__typename) {
      case 'CampaignLinkAction':
        return await updateLink({
          variables: {
            id: block.id,
            input: { url: action.url, target: action.target }
          },
          optimisticResponse: { campaignBlockUpdateLinkAction: action },
          update(cache, { data }) {
            writeAction(cache, block.id, data?.campaignBlockUpdateLinkAction)
          }
        })
      case 'CampaignScrollToBlockAction':
        return await updateScrollToBlock({
          variables: { id: block.id, input: { blockId: action.blockId } },
          optimisticResponse: {
            campaignBlockUpdateScrollToBlockAction: action
          },
          update(cache, { data }) {
            writeAction(
              cache,
              block.id,
              data?.campaignBlockUpdateScrollToBlockAction
            )
          }
        })
      case 'CampaignNavigateToRegionAction':
        if (action.regionId == null) return await removeAction(block)
        return await updateNavigateToRegion({
          variables: { id: block.id, input: { regionId: action.regionId } },
          optimisticResponse: {
            campaignBlockUpdateNavigateToRegionAction: action
          },
          update(cache, { data }) {
            writeAction(
              cache,
              block.id,
              data?.campaignBlockUpdateNavigateToRegionAction
            )
          }
        })
      default:
        return await removeAction(block)
    }
  }
}
