export interface SuggestionsRequest {
  contextText: string
}

export interface Suggestion {
  id: string
  text: string
}

export interface SuggestionsState {
  suggestions: Suggestion[]
  loading: boolean
  error: string | null
}
