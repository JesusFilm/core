import { graphql } from 'gql.tada'

import type { ActiveSession } from '../../auth/login'
import { loadCredential } from '../../config/credentials'
import {
  type EnvironmentConfig,
  type EnvironmentId,
  getEnvironment
} from '../../config/environments'
import {
  graphqlRequest,
  graphqlRequestUnauthenticated
} from '../../graphql/client'

/**
 * Returns a usable session for `envId` by loading a previously cached
 * credential off disk. Used for the *destination* env when it differs from
 * the active scribe session; the source env is read anonymously via the
 * public `journey()` query, so it does not need any cached credential.
 */
export function resolveCachedSession(
  envId: EnvironmentId
): ActiveSession | null {
  const env: EnvironmentConfig = getEnvironment(envId)
  const stored = loadCredential(envId)
  if (stored == null) return null
  return {
    environment: env,
    token: stored.token,
    email: stored.email,
    userId: stored.userId
  }
}

// ---------------------------------------------------------------------------
// Source-side queries
// ---------------------------------------------------------------------------

const JOURNEY_FOR_COPY = graphql(`
  query ScribeJourneyForCopy(
    $id: ID!
    $idType: IdType
    $options: JourneysQueryOptions
  ) {
    journey(id: $id, idType: $idType, options: $options) {
      id
      title
      description
      themeMode
      themeName
      seoTitle
      seoDescription
      strategySlug
      displayTitle
      menuButtonIcon
      socialNodeX
      socialNodeY
      website
      showShareButton
      showLikeButton
      showDislikeButton
      showHosts
      showChatButtons
      showReactionButtons
      showLogo
      showMenu
      showDisplayTitle
      showAssistant
      creatorDescription
      language {
        id
        bcp47
      }
      blocks {
        __typename
        id
        parentBlockId
        parentOrder
        ... on StepBlock {
          locked
          nextBlockId
          slug
        }
        ... on CardBlock {
          backgroundColor
          backdropBlur
          coverBlockId
          themeMode
          themeName
          fullscreen
          eventLabel
          showAssistant
          expandChatByDefault
        }
        ... on TypographyBlock {
          content
          variant
          color
          align
          settings {
            color
          }
        }
        ... on ButtonBlock {
          label
          buttonVariant: variant
          buttonColor: color
          size
          startIconId
          endIconId
          submitEnabled
          settings {
            alignment
          }
          eventLabel
          action {
            __typename
            gtmEventName
            parentBlockId
            ... on NavigateToBlockAction {
              blockId
            }
            ... on LinkAction {
              url
              customizable
              parentStepId
            }
            ... on EmailAction {
              email
              customizable
              parentStepId
            }
            ... on ChatAction {
              chatUrl
              customizable
              parentStepId
            }
            ... on PhoneAction {
              phone
              countryCode
              contactAction
              customizable
              parentStepId
            }
          }
        }
        ... on IconBlock {
          iconName: name
          iconColor: color
          iconSize: size
        }
        ... on ImageBlock {
          src
          alt
          width
          height
          blurhash
          scale
          focalTop
          focalLeft
          customizable
        }
        ... on VideoBlock {
          muted
          autoplay
          startAt
          endAt
          posterBlockId
          fullsize
          videoId
          videoVariantLanguageId
          source
          title
          description
          image
          duration
          objectFit
          showGeneratedSubtitles
          customizable
          notes
          eventLabel
          endEventLabel
          subtitleLanguage {
            id
          }
          action {
            __typename
            gtmEventName
            parentBlockId
            ... on NavigateToBlockAction {
              blockId
            }
            ... on LinkAction {
              url
              customizable
              parentStepId
            }
            ... on EmailAction {
              email
              customizable
              parentStepId
            }
            ... on ChatAction {
              chatUrl
              customizable
              parentStepId
            }
            ... on PhoneAction {
              phone
              countryCode
              contactAction
              customizable
              parentStepId
            }
          }
        }
        ... on VideoTriggerBlock {
          triggerStart
          triggerAction: action {
            __typename
            gtmEventName
            parentBlockId
            ... on NavigateToBlockAction {
              blockId
            }
            ... on LinkAction {
              url
              customizable
              parentStepId
            }
          }
        }
        ... on RadioQuestionBlock {
          gridView
        }
        ... on RadioOptionBlock {
          label
          pollOptionImageBlockId
          eventLabel
          action {
            __typename
            gtmEventName
            parentBlockId
            ... on NavigateToBlockAction {
              blockId
            }
            ... on LinkAction {
              url
              customizable
              parentStepId
            }
            ... on EmailAction {
              email
              customizable
              parentStepId
            }
            ... on ChatAction {
              chatUrl
              customizable
              parentStepId
            }
            ... on PhoneAction {
              phone
              countryCode
              contactAction
              customizable
              parentStepId
            }
          }
        }
        ... on MultiselectBlock {
          min
          max
        }
        ... on MultiselectOptionBlock {
          label
        }
        ... on SignUpBlock {
          submitLabel
          submitIconId
          action {
            __typename
            gtmEventName
            parentBlockId
            ... on NavigateToBlockAction {
              blockId
            }
            ... on LinkAction {
              url
              customizable
              parentStepId
            }
            ... on EmailAction {
              email
              customizable
              parentStepId
            }
            ... on ChatAction {
              chatUrl
              customizable
              parentStepId
            }
          }
        }
        ... on SpacerBlock {
          spacing
        }
        ... on TextResponseBlock {
          label
          placeholder
          required
          hint
          minRows
          type
          routeId
          integrationId
          hideLabel
        }
      }
    }
  }
`)

// ---------------------------------------------------------------------------
// Destination-side mutations
// ---------------------------------------------------------------------------

const JOURNEY_CREATE_FOR_COPY = graphql(`
  mutation ScribeJourneyCreateForCopy(
    $input: JourneyCreateInput!
    $teamId: ID!
  ) {
    journeyCreate(input: $input, teamId: $teamId) {
      id
      title
      slug
    }
  }
`)

const JOURNEY_UPDATE_FOR_COPY = graphql(`
  mutation ScribeJourneyUpdateForCopy($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const STEP_BLOCK_CREATE = graphql(`
  mutation ScribeStepBlockCreate($input: StepBlockCreateInput!) {
    stepBlockCreate(input: $input) {
      id
    }
  }
`)

const STEP_BLOCK_UPDATE = graphql(`
  mutation ScribeStepBlockUpdate($id: ID!, $input: StepBlockUpdateInput!) {
    stepBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const CARD_BLOCK_CREATE = graphql(`
  mutation ScribeCardBlockCreate($input: CardBlockCreateInput!) {
    cardBlockCreate(input: $input) {
      id
    }
  }
`)

const CARD_BLOCK_UPDATE = graphql(`
  mutation ScribeCardBlockUpdate($id: ID!, $input: CardBlockUpdateInput!) {
    cardBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const TYPOGRAPHY_BLOCK_CREATE = graphql(`
  mutation ScribeTypographyBlockCreate($input: TypographyBlockCreateInput!) {
    typographyBlockCreate(input: $input) {
      id
    }
  }
`)

const BUTTON_BLOCK_CREATE = graphql(`
  mutation ScribeButtonBlockCreate($input: ButtonBlockCreateInput!) {
    buttonBlockCreate(input: $input) {
      id
    }
  }
`)

const BUTTON_BLOCK_UPDATE = graphql(`
  mutation ScribeButtonBlockUpdate($id: ID!, $input: ButtonBlockUpdateInput!) {
    buttonBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const ICON_BLOCK_CREATE = graphql(`
  mutation ScribeIconBlockCreate($input: IconBlockCreateInput!) {
    iconBlockCreate(input: $input) {
      id
    }
  }
`)

const IMAGE_BLOCK_CREATE = graphql(`
  mutation ScribeImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
    }
  }
`)

const VIDEO_BLOCK_CREATE = graphql(`
  mutation ScribeVideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      id
    }
  }
`)

const VIDEO_BLOCK_UPDATE = graphql(`
  mutation ScribeVideoBlockUpdate($id: ID!, $input: VideoBlockUpdateInput!) {
    videoBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const RADIO_QUESTION_BLOCK_CREATE = graphql(`
  mutation ScribeRadioQuestionBlockCreate(
    $input: RadioQuestionBlockCreateInput!
  ) {
    radioQuestionBlockCreate(input: $input) {
      id
    }
  }
`)

const RADIO_OPTION_BLOCK_CREATE = graphql(`
  mutation ScribeRadioOptionBlockCreate($input: RadioOptionBlockCreateInput!) {
    radioOptionBlockCreate(input: $input) {
      id
    }
  }
`)

const RADIO_OPTION_BLOCK_UPDATE = graphql(`
  mutation ScribeRadioOptionBlockUpdate(
    $id: ID!
    $input: RadioOptionBlockUpdateInput!
  ) {
    radioOptionBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const MULTISELECT_BLOCK_CREATE = graphql(`
  mutation ScribeMultiselectBlockCreate($input: MultiselectBlockCreateInput!) {
    multiselectBlockCreate(input: $input) {
      id
    }
  }
`)

const MULTISELECT_BLOCK_UPDATE = graphql(`
  mutation ScribeMultiselectBlockUpdate(
    $id: ID!
    $input: MultiselectBlockUpdateInput!
  ) {
    multiselectBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const MULTISELECT_OPTION_BLOCK_CREATE = graphql(`
  mutation ScribeMultiselectOptionBlockCreate(
    $input: MultiselectOptionBlockCreateInput!
  ) {
    multiselectOptionBlockCreate(input: $input) {
      id
    }
  }
`)

const SIGNUP_BLOCK_CREATE = graphql(`
  mutation ScribeSignUpBlockCreate($input: SignUpBlockCreateInput!) {
    signUpBlockCreate(input: $input) {
      id
    }
  }
`)

const SIGNUP_BLOCK_UPDATE = graphql(`
  mutation ScribeSignUpBlockUpdate($id: ID!, $input: SignUpBlockUpdateInput!) {
    signUpBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const SPACER_BLOCK_CREATE = graphql(`
  mutation ScribeSpacerBlockCreate($input: SpacerBlockCreateInput!) {
    spacerBlockCreate(input: $input) {
      id
    }
  }
`)

const TEXT_RESPONSE_BLOCK_CREATE = graphql(`
  mutation ScribeTextResponseBlockCreate(
    $input: TextResponseBlockCreateInput!
  ) {
    textResponseBlockCreate(input: $input) {
      id
    }
  }
`)

const TEXT_RESPONSE_BLOCK_UPDATE = graphql(`
  mutation ScribeTextResponseBlockUpdate(
    $id: ID!
    $input: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockUpdate(id: $id, input: $input) {
      id
    }
  }
`)

const BLOCK_UPDATE_NAVIGATE_TO_BLOCK_ACTION = graphql(`
  mutation ScribeBlockUpdateNavigateToBlockAction(
    $id: ID!
    $input: NavigateToBlockActionInput!
  ) {
    blockUpdateNavigateToBlockAction(id: $id, input: $input) {
      gtmEventName
    }
  }
`)

const BLOCK_UPDATE_LINK_ACTION = graphql(`
  mutation ScribeBlockUpdateLinkAction($id: ID!, $input: LinkActionInput!) {
    blockUpdateLinkAction(id: $id, input: $input) {
      gtmEventName
    }
  }
`)

const BLOCK_UPDATE_EMAIL_ACTION = graphql(`
  mutation ScribeBlockUpdateEmailAction($id: ID!, $input: EmailActionInput!) {
    blockUpdateEmailAction(id: $id, input: $input) {
      gtmEventName
    }
  }
`)

const BLOCK_UPDATE_CHAT_ACTION = graphql(`
  mutation ScribeBlockUpdateChatAction($id: ID!, $input: ChatActionInput!) {
    blockUpdateChatAction(id: $id, input: $input) {
      gtmEventName
    }
  }
`)

const BLOCK_UPDATE_PHONE_ACTION = graphql(`
  mutation ScribeBlockUpdatePhoneAction($id: ID!, $input: PhoneActionInput!) {
    blockUpdatePhoneAction(id: $id, input: $input) {
      gtmEventName
    }
  }
`)

// ---------------------------------------------------------------------------
// Local types — narrow projections of the GraphQL union we care about
// ---------------------------------------------------------------------------

type ActionPayload =
  | {
      __typename: 'NavigateToBlockAction'
      gtmEventName: string | null
      blockId: string
    }
  | {
      __typename: 'LinkAction'
      gtmEventName: string | null
      url: string
      customizable: boolean | null
      parentStepId: string | null
    }
  | {
      __typename: 'EmailAction'
      gtmEventName: string | null
      email: string
      customizable: boolean | null
      parentStepId: string | null
    }
  | {
      __typename: 'ChatAction'
      gtmEventName: string | null
      chatUrl: string
      customizable: boolean | null
      parentStepId: string | null
    }
  | {
      __typename: 'PhoneAction'
      gtmEventName: string | null
      phone: string
      countryCode: string
      contactAction: string | null
      customizable: boolean | null
      parentStepId: string | null
    }

type SourceBlock = {
  __typename: string
  id: string
  parentBlockId: string | null
  parentOrder: number | null
  // The remaining fields are read with `Reflect`-style access to keep the
  // local types tractable; gql.tada gives us a typed response but the
  // discriminated union is verbose to mirror here, so we model the projection
  // as `unknown` and narrow per-branch below.
  [key: string]: unknown
}

interface CopyJourneyOptions {
  sourceEnvId: EnvironmentId
  sourceIdOrSlug: string
  destSession: ActiveSession
  destTeamId: string
}

export interface CopyJourneyResult {
  sourceJourneyId: string
  sourceJourneyTitle: string
  newJourneyId: string
  newJourneyTitle: string
  newJourneySlug: string
  newJourneyUrl: string
  blocksCopied: number
  warnings: string[]
}

/**
 * Copy a journey (regular blocks, not JourneySimple) from one environment
 * into the active destination team in another environment. Always lands as
 * a draft. Returns the new journey id, slug, and an admin URL.
 */
export async function copyJourneyAcrossEnvironments(
  options: CopyJourneyOptions
): Promise<CopyJourneyResult> {
  if (options.sourceEnvId === options.destSession.environment.id) {
    throw new Error(
      'Source and destination environments are the same. Use `duplicate_journey` for in-environment copies.'
    )
  }
  const sourceEnv = getEnvironment(options.sourceEnvId)

  const warnings: string[] = []
  const parsed = parseSourceReference(options.sourceIdOrSlug)
  const idType = isUuid(parsed.idOrSlug) ? 'databaseId' : 'slug'
  // The source `journey()` query and its `blocks` resolver are public — no
  // auth is required to read a journey by id/slug. We deliberately skip
  // sending a source-env token so the user never has to sign in to the
  // source environment to perform a copy. We also pass
  // `skipRoutingFilter: true` so journeys served from custom domains are
  // returned by id/slug without the caller having to know the hostname.
  const fetched = await graphqlRequestUnauthenticated(
    sourceEnv,
    JOURNEY_FOR_COPY,
    {
      id: parsed.idOrSlug,
      idType,
      options: { skipRoutingFilter: true }
    }
  )
  if (parsed.hostname != null) {
    warnings.push(
      `Source journey appears to live on custom domain "${parsed.hostname}". The journey was fetched via skipRoutingFilter and re-created in the destination team without any custom-domain routing — the copy will live at the destination's default URL.`
    )
  }
  const source = fetched.journey
  const sourceBlocks = (source.blocks ?? []) as unknown as SourceBlock[]

  const created = await graphqlRequest(
    options.destSession,
    JOURNEY_CREATE_FOR_COPY,
    {
      input: {
        title: source.title,
        description: source.description,
        languageId: source.language.id,
        themeMode: source.themeMode,
        themeName: source.themeName
      },
      teamId: options.destTeamId
    }
  )
  const newJourney = created.journeyCreate

  await graphqlRequest(options.destSession, JOURNEY_UPDATE_FOR_COPY, {
    id: newJourney.id,
    input: {
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      strategySlug: source.strategySlug,
      displayTitle: source.displayTitle,
      menuButtonIcon: source.menuButtonIcon,
      socialNodeX: source.socialNodeX,
      socialNodeY: source.socialNodeY,
      website: source.website,
      showShareButton: source.showShareButton,
      showLikeButton: source.showLikeButton,
      showDislikeButton: source.showDislikeButton,
      showHosts: source.showHosts,
      showChatButtons: source.showChatButtons,
      showReactionButtons: source.showReactionButtons,
      showLogo: source.showLogo,
      showMenu: source.showMenu,
      showDisplayTitle: source.showDisplayTitle,
      showAssistant: source.showAssistant,
      creatorDescription: source.creatorDescription
    }
  })

  const childrenByParent = new Map<string | null, SourceBlock[]>()
  for (const block of sourceBlocks) {
    const list = childrenByParent.get(block.parentBlockId) ?? []
    list.push(block)
    childrenByParent.set(block.parentBlockId, list)
  }
  for (const list of childrenByParent.values()) {
    list.sort(
      (a, b) =>
        (a.parentOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.parentOrder ?? Number.MAX_SAFE_INTEGER)
    )
  }

  const idMap = new Map<string, string>()

  const stepBlocks = (childrenByParent.get(null) ?? []).filter(
    (block) => block.__typename === 'StepBlock'
  )
  for (const step of stepBlocks) {
    const result = await graphqlRequest(
      options.destSession,
      STEP_BLOCK_CREATE,
      {
        input: {
          journeyId: newJourney.id,
          locked: (step.locked as boolean | null) ?? undefined
        }
      }
    )
    idMap.set(step.id, result.stepBlockCreate.id)
  }

  for (const step of stepBlocks) {
    await recreateDescendants({
      destSession: options.destSession,
      journeyId: newJourney.id,
      source: step,
      childrenByParent,
      idMap,
      warnings
    })
  }

  await linkUpStepBlocks({
    destSession: options.destSession,
    sourceBlocks,
    idMap,
    warnings
  })
  await linkUpRemainingFields({
    destSession: options.destSession,
    sourceBlocks,
    idMap,
    warnings
  })
  await replayActions({
    destSession: options.destSession,
    sourceBlocks,
    idMap,
    warnings
  })

  noteUnsupportedSourceContent({
    source: source as unknown as Record<string, unknown>,
    warnings
  })

  const newJourneyUrl = `${options.destSession.environment.journeysAdminUrl}/journeys/${newJourney.id}`

  return {
    sourceJourneyId: source.id,
    sourceJourneyTitle: source.title,
    newJourneyId: newJourney.id,
    newJourneyTitle: newJourney.title,
    newJourneySlug: newJourney.slug,
    newJourneyUrl,
    blocksCopied: idMap.size,
    warnings
  }
}

interface RecreateContext {
  destSession: ActiveSession
  journeyId: string
  source: SourceBlock
  childrenByParent: Map<string | null, SourceBlock[]>
  idMap: Map<string, string>
  warnings: string[]
}

async function recreateDescendants(ctx: RecreateContext): Promise<void> {
  const children = ctx.childrenByParent.get(ctx.source.id) ?? []
  for (const child of children) {
    const newId = await createBlockOfType({
      destSession: ctx.destSession,
      journeyId: ctx.journeyId,
      block: child,
      idMap: ctx.idMap,
      warnings: ctx.warnings
    })
    if (newId == null) continue
    ctx.idMap.set(child.id, newId)
    await recreateDescendants({ ...ctx, source: child })
  }
}

interface CreateBlockArgs {
  destSession: ActiveSession
  journeyId: string
  block: SourceBlock
  idMap: Map<string, string>
  warnings: string[]
}

async function createBlockOfType(
  args: CreateBlockArgs
): Promise<string | null> {
  const { destSession, journeyId, block, idMap, warnings } = args
  const parentBlockId =
    block.parentBlockId != null
      ? (idMap.get(block.parentBlockId) ?? null)
      : null

  switch (block.__typename) {
    case 'CardBlock': {
      if (parentBlockId == null) {
        warnings.push(`CardBlock ${block.id} has no mapped parent — skipped.`)
        return null
      }
      const result = await graphqlRequest(destSession, CARD_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          backgroundColor:
            (block.backgroundColor as string | null) ?? undefined,
          backdropBlur: (block.backdropBlur as number | null) ?? undefined,
          fullscreen: (block.fullscreen as boolean | null) ?? undefined,
          themeMode: (block.themeMode as never) ?? undefined,
          themeName: (block.themeName as never) ?? undefined,
          eventLabel: (block.eventLabel as never) ?? undefined
        }
      })
      return result.cardBlockCreate.id
    }
    case 'TypographyBlock': {
      if (parentBlockId == null) return null
      const settings = block.settings as { color: string | null } | null
      const result = await graphqlRequest(
        destSession,
        TYPOGRAPHY_BLOCK_CREATE,
        {
          input: {
            journeyId,
            parentBlockId,
            content: (block.content as string) ?? '',
            variant: (block.variant as never) ?? undefined,
            color: (block.color as never) ?? undefined,
            align: (block.align as never) ?? undefined,
            settings:
              settings?.color != null ? { color: settings.color } : undefined
          }
        }
      )
      return result.typographyBlockCreate.id
    }
    case 'ButtonBlock': {
      if (parentBlockId == null) return null
      const settings = block.settings as { alignment: string | null } | null
      const result = await graphqlRequest(destSession, BUTTON_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          label: (block.label as string) ?? '',
          variant: (block.buttonVariant as never) ?? undefined,
          color: (block.buttonColor as never) ?? undefined,
          size: (block.size as never) ?? undefined,
          submitEnabled: (block.submitEnabled as boolean | null) ?? undefined,
          eventLabel: (block.eventLabel as never) ?? undefined,
          settings:
            settings?.alignment != null
              ? { alignment: settings.alignment as never }
              : undefined
        }
      })
      return result.buttonBlockCreate.id
    }
    case 'IconBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(destSession, ICON_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          name: (block.iconName as never) ?? undefined,
          color: (block.iconColor as never) ?? undefined,
          size: (block.iconSize as never) ?? undefined
        }
      })
      return result.iconBlockCreate.id
    }
    case 'ImageBlock': {
      const result = await graphqlRequest(destSession, IMAGE_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          src: (block.src as string | null) ?? undefined,
          alt: (block.alt as string) ?? '',
          blurhash: (block.blurhash as string | null) ?? undefined,
          width: (block.width as number | null) ?? undefined,
          height: (block.height as number | null) ?? undefined,
          scale: (block.scale as number | null) ?? undefined,
          focalTop: (block.focalTop as number | null) ?? undefined,
          focalLeft: (block.focalLeft as number | null) ?? undefined,
          customizable: (block.customizable as boolean | null) ?? undefined
        }
      })
      return result.imageBlockCreate.id
    }
    case 'VideoBlock': {
      if (parentBlockId == null) return null
      const subtitleLanguage = block.subtitleLanguage as { id: string } | null
      const result = await graphqlRequest(destSession, VIDEO_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          videoId: (block.videoId as string | null) ?? undefined,
          videoVariantLanguageId:
            (block.videoVariantLanguageId as string | null) ?? undefined,
          source: (block.source as never) ?? undefined,
          title: (block.title as string | null) ?? undefined,
          description: (block.description as string | null) ?? undefined,
          image: (block.image as string | null) ?? undefined,
          duration: (block.duration as number | null) ?? undefined,
          objectFit: (block.objectFit as never) ?? undefined,
          startAt: (block.startAt as number | null) ?? undefined,
          endAt: (block.endAt as number | null) ?? undefined,
          muted: (block.muted as boolean | null) ?? undefined,
          autoplay: (block.autoplay as boolean | null) ?? undefined,
          fullsize: (block.fullsize as boolean | null) ?? undefined,
          subtitleLanguageId: subtitleLanguage?.id,
          showGeneratedSubtitles:
            (block.showGeneratedSubtitles as boolean | null) ?? undefined,
          customizable: (block.customizable as boolean | null) ?? undefined,
          notes: (block.notes as string | null) ?? undefined,
          eventLabel: (block.eventLabel as never) ?? undefined,
          endEventLabel: (block.endEventLabel as never) ?? undefined
        }
      })
      return result.videoBlockCreate.id
    }
    case 'VideoTriggerBlock': {
      warnings.push(
        `VideoTriggerBlock ${block.id} not copied — the gateway exposes no videoTriggerBlockCreate mutation. Re-add the trigger in journeys-admin if needed.`
      )
      return null
    }
    case 'RadioQuestionBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(
        destSession,
        RADIO_QUESTION_BLOCK_CREATE,
        {
          input: {
            journeyId,
            parentBlockId
          }
        }
      )
      if (block.gridView != null) {
        warnings.push(
          `RadioQuestionBlock ${block.id}: gridView is not exposed by radioQuestionBlockCreate/Update — verify in admin.`
        )
      }
      return result.radioQuestionBlockCreate.id
    }
    case 'RadioOptionBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(
        destSession,
        RADIO_OPTION_BLOCK_CREATE,
        {
          input: {
            journeyId,
            parentBlockId,
            label: (block.label as string) ?? '',
            eventLabel: (block.eventLabel as never) ?? undefined
          }
        }
      )
      return result.radioOptionBlockCreate.id
    }
    case 'MultiselectBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(
        destSession,
        MULTISELECT_BLOCK_CREATE,
        { input: { journeyId, parentBlockId } }
      )
      return result.multiselectBlockCreate.id
    }
    case 'MultiselectOptionBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(
        destSession,
        MULTISELECT_OPTION_BLOCK_CREATE,
        {
          input: {
            journeyId,
            parentBlockId,
            label: (block.label as string) ?? ''
          }
        }
      )
      return result.multiselectOptionBlockCreate.id
    }
    case 'SignUpBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(destSession, SIGNUP_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          submitLabel: (block.submitLabel as string) ?? ''
        }
      })
      return result.signUpBlockCreate.id
    }
    case 'SpacerBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(destSession, SPACER_BLOCK_CREATE, {
        input: {
          journeyId,
          parentBlockId,
          spacing: (block.spacing as number | null) ?? undefined
        }
      })
      return result.spacerBlockCreate.id
    }
    case 'TextResponseBlock': {
      if (parentBlockId == null) return null
      const result = await graphqlRequest(
        destSession,
        TEXT_RESPONSE_BLOCK_CREATE,
        {
          input: {
            journeyId,
            parentBlockId,
            label: (block.label as string) ?? ''
          }
        }
      )
      return result.textResponseBlockCreate.id
    }
    case 'StepBlock':
      // StepBlocks were created in phase 1.
      return null
    default:
      warnings.push(
        `Unsupported block type: ${block.__typename} (id ${block.id})`
      )
      return null
  }
}

interface LinkUpArgs {
  destSession: ActiveSession
  sourceBlocks: SourceBlock[]
  idMap: Map<string, string>
  warnings: string[]
}

async function linkUpStepBlocks(args: LinkUpArgs): Promise<void> {
  for (const block of args.sourceBlocks) {
    if (block.__typename !== 'StepBlock') continue
    const newId = args.idMap.get(block.id)
    if (newId == null) continue
    const mappedNext =
      block.nextBlockId != null
        ? args.idMap.get(block.nextBlockId as string)
        : null
    const slug = block.slug as string | null
    if (mappedNext == null && slug == null) continue
    await graphqlRequest(args.destSession, STEP_BLOCK_UPDATE, {
      id: newId,
      input: {
        nextBlockId: mappedNext ?? undefined,
        slug: slug ?? undefined
      }
    })
  }
}

async function linkUpRemainingFields(args: LinkUpArgs): Promise<void> {
  for (const block of args.sourceBlocks) {
    const newId = args.idMap.get(block.id)
    if (newId == null) continue

    switch (block.__typename) {
      case 'CardBlock': {
        const coverBlockId = block.coverBlockId as string | null
        const showAssistant = block.showAssistant as boolean | null
        const expandChatByDefault = block.expandChatByDefault as boolean | null
        const mappedCover =
          coverBlockId != null ? args.idMap.get(coverBlockId) : null
        if (
          mappedCover == null &&
          showAssistant == null &&
          expandChatByDefault == null
        ) {
          continue
        }
        await graphqlRequest(args.destSession, CARD_BLOCK_UPDATE, {
          id: newId,
          input: {
            coverBlockId: mappedCover ?? undefined,
            showAssistant: showAssistant ?? undefined,
            expandChatByDefault: expandChatByDefault ?? undefined
          }
        })
        break
      }
      case 'ButtonBlock': {
        const startIconId = block.startIconId as string | null
        const endIconId = block.endIconId as string | null
        const mappedStart =
          startIconId != null ? args.idMap.get(startIconId) : null
        const mappedEnd = endIconId != null ? args.idMap.get(endIconId) : null
        if (mappedStart == null && mappedEnd == null) continue
        await graphqlRequest(args.destSession, BUTTON_BLOCK_UPDATE, {
          id: newId,
          input: {
            startIconId: mappedStart ?? undefined,
            endIconId: mappedEnd ?? undefined
          }
        })
        break
      }
      case 'SignUpBlock': {
        const submitIconId = block.submitIconId as string | null
        const mapped =
          submitIconId != null ? args.idMap.get(submitIconId) : null
        if (mapped == null) continue
        await graphqlRequest(args.destSession, SIGNUP_BLOCK_UPDATE, {
          id: newId,
          input: { submitIconId: mapped }
        })
        break
      }
      case 'VideoBlock': {
        const posterBlockId = block.posterBlockId as string | null
        const mapped =
          posterBlockId != null ? args.idMap.get(posterBlockId) : null
        if (mapped == null) continue
        await graphqlRequest(args.destSession, VIDEO_BLOCK_UPDATE, {
          id: newId,
          input: { posterBlockId: mapped }
        })
        break
      }
      case 'RadioOptionBlock': {
        const pollOptionImageBlockId = block.pollOptionImageBlockId as
          | string
          | null
        const mapped =
          pollOptionImageBlockId != null
            ? args.idMap.get(pollOptionImageBlockId)
            : null
        if (mapped == null) continue
        await graphqlRequest(args.destSession, RADIO_OPTION_BLOCK_UPDATE, {
          id: newId,
          input: { pollOptionImageBlockId: mapped }
        })
        break
      }
      case 'MultiselectBlock': {
        const min = block.min as number | null
        const max = block.max as number | null
        if (min == null && max == null) continue
        await graphqlRequest(args.destSession, MULTISELECT_BLOCK_UPDATE, {
          id: newId,
          input: {
            min: min ?? undefined,
            max: max ?? undefined
          }
        })
        break
      }
      case 'TextResponseBlock': {
        const required = block.required as boolean | null
        const placeholder = block.placeholder as string | null
        const hint = block.hint as string | null
        const minRows = block.minRows as number | null
        const type = block.type as string | null
        const routeId = block.routeId as string | null
        const integrationId = block.integrationId as string | null
        const hideLabel = block.hideLabel as boolean | null
        if (
          required == null &&
          placeholder == null &&
          hint == null &&
          minRows == null &&
          type == null &&
          routeId == null &&
          integrationId == null &&
          hideLabel == null
        ) {
          continue
        }
        await graphqlRequest(args.destSession, TEXT_RESPONSE_BLOCK_UPDATE, {
          id: newId,
          input: {
            required: required ?? undefined,
            placeholder: placeholder ?? undefined,
            hint: hint ?? undefined,
            minRows: minRows ?? undefined,
            type: (type as never) ?? undefined,
            routeId: routeId ?? undefined,
            integrationId: integrationId ?? undefined,
            hideLabel: hideLabel ?? undefined
          }
        })
        break
      }
      default:
        break
    }
  }
}

async function replayActions(args: LinkUpArgs): Promise<void> {
  for (const block of args.sourceBlocks) {
    const action = (block.action ?? block.triggerAction) as
      | ActionPayload
      | null
      | undefined
    if (action == null) continue
    const newBlockId = args.idMap.get(block.id)
    if (newBlockId == null) continue
    await applyAction({
      destSession: args.destSession,
      newBlockId,
      action,
      idMap: args.idMap,
      warnings: args.warnings,
      sourceBlockId: block.id
    })
  }
}

interface ApplyActionArgs {
  destSession: ActiveSession
  newBlockId: string
  action: ActionPayload
  idMap: Map<string, string>
  warnings: string[]
  sourceBlockId: string
}

async function applyAction(args: ApplyActionArgs): Promise<void> {
  const { destSession, newBlockId, action, idMap, warnings, sourceBlockId } =
    args
  switch (action.__typename) {
    case 'NavigateToBlockAction': {
      const mapped = idMap.get(action.blockId)
      if (mapped == null) {
        warnings.push(
          `Block ${sourceBlockId}: NavigateToBlockAction targets ${action.blockId} which was not copied — action skipped.`
        )
        return
      }
      await graphqlRequest(destSession, BLOCK_UPDATE_NAVIGATE_TO_BLOCK_ACTION, {
        id: newBlockId,
        input: {
          blockId: mapped,
          gtmEventName: action.gtmEventName ?? undefined
        }
      })
      return
    }
    case 'LinkAction': {
      const mappedParentStep =
        action.parentStepId != null
          ? (idMap.get(action.parentStepId) ?? null)
          : null
      await graphqlRequest(destSession, BLOCK_UPDATE_LINK_ACTION, {
        id: newBlockId,
        input: {
          url: action.url,
          customizable: action.customizable ?? undefined,
          parentStepId: mappedParentStep ?? undefined,
          gtmEventName: action.gtmEventName ?? undefined
        }
      })
      return
    }
    case 'EmailAction': {
      const mappedParentStep =
        action.parentStepId != null
          ? (idMap.get(action.parentStepId) ?? null)
          : null
      await graphqlRequest(destSession, BLOCK_UPDATE_EMAIL_ACTION, {
        id: newBlockId,
        input: {
          email: action.email,
          customizable: action.customizable ?? undefined,
          parentStepId: mappedParentStep ?? undefined,
          gtmEventName: action.gtmEventName ?? undefined
        }
      })
      return
    }
    case 'ChatAction': {
      const mappedParentStep =
        action.parentStepId != null
          ? (idMap.get(action.parentStepId) ?? null)
          : null
      await graphqlRequest(destSession, BLOCK_UPDATE_CHAT_ACTION, {
        id: newBlockId,
        input: {
          chatUrl: action.chatUrl,
          customizable: action.customizable ?? undefined,
          parentStepId: mappedParentStep ?? undefined,
          gtmEventName: action.gtmEventName ?? undefined
        }
      })
      return
    }
    case 'PhoneAction': {
      const mappedParentStep =
        action.parentStepId != null
          ? (idMap.get(action.parentStepId) ?? null)
          : null
      await graphqlRequest(destSession, BLOCK_UPDATE_PHONE_ACTION, {
        id: newBlockId,
        input: {
          phone: action.phone,
          countryCode: action.countryCode,
          contactAction: (action.contactAction as never) ?? undefined,
          customizable: action.customizable ?? undefined,
          parentStepId: mappedParentStep ?? undefined,
          gtmEventName: action.gtmEventName ?? undefined
        }
      })
    }
  }
}

interface NoteUnsupportedArgs {
  source: Record<string, unknown>
  warnings: string[]
}

function noteUnsupportedSourceContent(args: NoteUnsupportedArgs): void {
  // These features are intentionally NOT replayed in v1. Surface them so the
  // operator knows what to fix up by hand if the source actually uses them.
  const checks: Array<{ key: string; description: string }> = [
    { key: 'chatButtons', description: 'chat buttons (link/platform pairs)' },
    { key: 'host', description: 'host (per-team author profile)' },
    { key: 'tags', description: 'tags' },
    {
      key: 'primaryImageBlock',
      description: 'social/share preview image (primaryImageBlock)'
    },
    {
      key: 'creatorImageBlock',
      description: 'creator avatar image (creatorImageBlock)'
    },
    {
      key: 'logoImageBlock',
      description: 'logo image (logoImageBlock)'
    },
    { key: 'menuStepBlock', description: 'menu step block' },
    {
      key: 'journeyCustomizationFields',
      description: 'journey customization fields'
    },
    { key: 'journeyTheme', description: 'custom journey theme (fonts)' }
  ]
  for (const check of checks) {
    const value = args.source[check.key]
    const present = Array.isArray(value) ? value.length > 0 : value != null
    if (present) {
      args.warnings.push(
        `Source has ${check.description} — not copied by scribe in this version.`
      )
    }
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  )
}

interface ParsedSourceReference {
  /** A bare UUID or slug, ready to pass to journey(id, idType). */
  idOrSlug: string
  /** Set when the input was a URL; the hostname the journey is served from. */
  hostname: string | null
}

/**
 * Accept a UUID, a slug, or a full URL (including custom-domain URLs) and
 * extract the identifier scribe should query by. For URLs, the last
 * non-empty path segment is treated as the slug and the hostname is
 * captured so we can warn the user when the source lives on a custom
 * domain.
 */
function parseSourceReference(value: string): ParsedSourceReference {
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return { idOrSlug: trimmed, hostname: null }
  }
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return { idOrSlug: trimmed, hostname: null }
  }
  const segments = url.pathname.split('/').filter((s) => s.length > 0)
  const last = segments[segments.length - 1] ?? ''
  if (last.length === 0) {
    throw new Error(
      `Could not extract a journey slug from URL "${trimmed}" — no path segment.`
    )
  }
  return { idOrSlug: last, hostname: url.hostname }
}
