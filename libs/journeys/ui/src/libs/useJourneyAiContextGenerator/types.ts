export interface BlockContext {
  blockId: string
  contextText: string
  language?: string
  suggestions: string[]
}

export interface JourneyAiContextGeneratorReturn {
  aiContextData: BlockContext[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}
