/**
 * The narrow shape of the options passed to a mocked AI SDK text call. Only the
 * user turn is described — the system prompt travels separately as
 * `instructions`, so `messages` holds the user turn alone.
 */
export interface MockTextCallOptions {
  messages: Array<{ content: Array<{ text: string }> }>
}

/**
 * The user prompt text from a mocked `generateText`/`streamText` call. Pass the
 * options object the mock was called with (`mock.calls[n][0]`).
 */
export function promptOf(options: unknown): string {
  const { messages } = options as MockTextCallOptions
  return messages[0].content[0].text
}
