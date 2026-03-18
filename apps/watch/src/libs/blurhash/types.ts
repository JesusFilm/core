export interface BlurhashResult {
  blurhash: string
  dominantColor: string
}

export interface BlurhashResponse {
  blurhash: string
  dominantColor: string
}

export interface BlurhashErrorResponse {
  error: string
}

export type BlurhashApiResponse = BlurhashResponse | BlurhashErrorResponse
