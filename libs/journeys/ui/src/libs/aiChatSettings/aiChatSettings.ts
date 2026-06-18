/**
 * TEMPORARY front-end ↔ back-end mapper for the per-card AI chat settings.
 *
 * The editor UI (NES-1734) speaks in `enableAiChat` / `collapseChat`, but the
 * GraphQL schema and Prisma still use the legacy `showAssistant` /
 * `expandChatByDefault` field names. This module is the single place that
 * translates between the two — including the inversion of the collapse flag
 * and the "pop open by default" semantics.
 *
 * Remove this mapper once the backend fields are renamed in NES-1735.
 */

/** Per-card AI chat settings, in the editor's vocabulary. */
export interface AiChatSettings {
  /** Whether AI chat exists on the card (legacy `showAssistant`). */
  enableAiChat: boolean
  /**
   * Whether the chat starts collapsed for viewers (the inverse of the legacy
   * `expandChatByDefault`). Off by default → the chat pops open.
   */
  collapseChat: boolean
}

/** The legacy CardBlock fields this mapper reads from. */
export interface CardBlockAiChatFields {
  showAssistant?: boolean | null
  expandChatByDefault?: boolean | null
}

/** The legacy fields shaped for a `CardBlockUpdateInput` mutation. */
export interface CardBlockAiChatInput {
  showAssistant: boolean
  expandChatByDefault: boolean
}

/**
 * Back-end → front-end.
 *
 * `collapseChat` is true only when the card has explicitly opted into a
 * collapsed start (`expandChatByDefault === false`). `null` / `undefined` /
 * `true` all mean "pop open" — which is also what migrates pre-existing
 * chat-enabled cards (stored as `expandChatByDefault: null`) to the new
 * pop-open default with no data migration.
 */
export function toAiChatSettings(block: CardBlockAiChatFields): AiChatSettings {
  return {
    enableAiChat: block.showAssistant === true,
    collapseChat: block.expandChatByDefault === false
  }
}

/**
 * Front-end → back-end mutation input.
 *
 * `collapseChat` off → expand (`expandChatByDefault: true`); `collapseChat`
 * on → start collapsed (`expandChatByDefault: false`).
 */
export function toCardBlockAiChatInput(
  settings: AiChatSettings
): CardBlockAiChatInput {
  return {
    showAssistant: settings.enableAiChat,
    expandChatByDefault: !settings.collapseChat
  }
}
