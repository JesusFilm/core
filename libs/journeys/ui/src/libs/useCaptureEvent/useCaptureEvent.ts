import { TypedDocumentNode, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  BlockEventLabel,
  CaptureEventTrigger
} from '../../../__generated__/globalTypes'

import {
  ChristDecisionCaptureEventCreate,
  ChristDecisionCaptureEventCreateVariables
} from './__generated__/ChristDecisionCaptureEventCreate'
import {
  Custom1CaptureEventCreate,
  Custom1CaptureEventCreateVariables
} from './__generated__/Custom1CaptureEventCreate'
import {
  Custom2CaptureEventCreate,
  Custom2CaptureEventCreateVariables
} from './__generated__/Custom2CaptureEventCreate'
import {
  Custom3CaptureEventCreate,
  Custom3CaptureEventCreateVariables
} from './__generated__/Custom3CaptureEventCreate'
import {
  GospelCompleteCaptureEventCreate,
  GospelCompleteCaptureEventCreateVariables
} from './__generated__/GospelCompleteCaptureEventCreate'
import {
  GospelStartCaptureEventCreate,
  GospelStartCaptureEventCreateVariables
} from './__generated__/GospelStartCaptureEventCreate'
import {
  PrayerRequestCaptureEventCreate,
  PrayerRequestCaptureEventCreateVariables
} from './__generated__/PrayerRequestCaptureEventCreate'
import {
  RsvpCaptureEventCreate,
  RsvpCaptureEventCreateVariables
} from './__generated__/RsvpCaptureEventCreate'
import {
  SpecialVideoCompleteCaptureEventCreate,
  SpecialVideoCompleteCaptureEventCreateVariables
} from './__generated__/SpecialVideoCompleteCaptureEventCreate'
import {
  SpecialVideoStartCaptureEventCreate,
  SpecialVideoStartCaptureEventCreateVariables
} from './__generated__/SpecialVideoStartCaptureEventCreate'

export const CHRIST_DECISION_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  ChristDecisionCaptureEventCreate,
  ChristDecisionCaptureEventCreateVariables
> = gql`
  mutation ChristDecisionCaptureEventCreate(
    $input: ChristDecisionCaptureEventCreateInput!
  ) {
    christDecisionCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const GOSPEL_START_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  GospelStartCaptureEventCreate,
  GospelStartCaptureEventCreateVariables
> = gql`
  mutation GospelStartCaptureEventCreate(
    $input: GospelStartCaptureEventCreateInput!
  ) {
    gospelStartCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const GOSPEL_COMPLETE_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  GospelCompleteCaptureEventCreate,
  GospelCompleteCaptureEventCreateVariables
> = gql`
  mutation GospelCompleteCaptureEventCreate(
    $input: GospelCompleteCaptureEventCreateInput!
  ) {
    gospelCompleteCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const PRAYER_REQUEST_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  PrayerRequestCaptureEventCreate,
  PrayerRequestCaptureEventCreateVariables
> = gql`
  mutation PrayerRequestCaptureEventCreate(
    $input: PrayerRequestCaptureEventCreateInput!
  ) {
    prayerRequestCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const RSVP_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  RsvpCaptureEventCreate,
  RsvpCaptureEventCreateVariables
> = gql`
  mutation RsvpCaptureEventCreate($input: RsvpCaptureEventCreateInput!) {
    rsvpCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const SPECIAL_VIDEO_START_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  SpecialVideoStartCaptureEventCreate,
  SpecialVideoStartCaptureEventCreateVariables
> = gql`
  mutation SpecialVideoStartCaptureEventCreate(
    $input: SpecialVideoStartCaptureEventCreateInput!
  ) {
    specialVideoStartCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const SPECIAL_VIDEO_COMPLETE_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  SpecialVideoCompleteCaptureEventCreate,
  SpecialVideoCompleteCaptureEventCreateVariables
> = gql`
  mutation SpecialVideoCompleteCaptureEventCreate(
    $input: SpecialVideoCompleteCaptureEventCreateInput!
  ) {
    specialVideoCompleteCaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const CUSTOM1_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  Custom1CaptureEventCreate,
  Custom1CaptureEventCreateVariables
> = gql`
  mutation Custom1CaptureEventCreate($input: Custom1CaptureEventCreateInput!) {
    custom1CaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const CUSTOM2_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  Custom2CaptureEventCreate,
  Custom2CaptureEventCreateVariables
> = gql`
  mutation Custom2CaptureEventCreate($input: Custom2CaptureEventCreateInput!) {
    custom2CaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

export const CUSTOM3_CAPTURE_EVENT_CREATE: TypedDocumentNode<
  Custom3CaptureEventCreate,
  Custom3CaptureEventCreateVariables
> = gql`
  mutation Custom3CaptureEventCreate($input: Custom3CaptureEventCreateInput!) {
    custom3CaptureEventCreate(input: $input) {
      id
      __typename
    }
  }
`

type CaptureEventResult =
  | ChristDecisionCaptureEventCreate
  | GospelStartCaptureEventCreate
  | GospelCompleteCaptureEventCreate
  | PrayerRequestCaptureEventCreate
  | RsvpCaptureEventCreate
  | SpecialVideoStartCaptureEventCreate
  | SpecialVideoCompleteCaptureEventCreate
  | Custom1CaptureEventCreate
  | Custom2CaptureEventCreate
  | Custom3CaptureEventCreate

const CAPTURE_MUTATIONS: Record<
  BlockEventLabel,
  TypedDocumentNode<
    CaptureEventResult,
    ChristDecisionCaptureEventCreateVariables
  > | null
> = {
  [BlockEventLabel.decisionForChrist]: CHRIST_DECISION_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.gospelPresentationStart]: GOSPEL_START_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.gospelPresentationComplete]:
    GOSPEL_COMPLETE_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.prayerRequest]: PRAYER_REQUEST_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.rsvp]: RSVP_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.specialVideoStart]: SPECIAL_VIDEO_START_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.specialVideoComplete]:
    SPECIAL_VIDEO_COMPLETE_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.custom1]: CUSTOM1_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.custom2]: CUSTOM2_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.custom3]: CUSTOM3_CAPTURE_EVENT_CREATE,
  [BlockEventLabel.share]: null,
  [BlockEventLabel.inviteFriend]: null
}

export interface CaptureEventInput {
  blockId: string
  stepId: string
  trigger: CaptureEventTrigger
}

export type CaptureEventSender = (
  eventLabel: BlockEventLabel,
  input: CaptureEventInput
) => void

/**
 * Returns a stable sender using the existing Apollo client and authentication.
 * Each supported occurrence gets its own UUID, retained across Apollo retries.
 * Missing Steps and unsupported tags are ignored; capture failures are contained.
 */
export function useCaptureEvent(): CaptureEventSender {
  const client = useApolloClient()
  return useCallback(
    (eventLabel, { blockId, stepId, trigger }) => {
      const mutation = CAPTURE_MUTATIONS[eventLabel]
      if (mutation == null || stepId === '') return

      // Allocate once per occurrence. Apollo link retries retain these variables.
      const input: ChristDecisionCaptureEventCreateVariables['input'] = {
        id: uuidv4(),
        blockId,
        stepId,
        trigger
      }
      void client.mutate({ mutation, variables: { input } }).catch(() => {
        // Capture delivery must not interrupt playback or the existing analytics.
      })
    },
    [client]
  )
}
