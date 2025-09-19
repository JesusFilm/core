'use client'

import type { CropPath, ExportPreset, Video, VideoDetailsResponse, VideoSearchResponse, VideoSummary, SearchResult } from '../types'

const SEARCH_ENDPOINT = '/api/videos/search'
const VIDEO_ENDPOINT = '/api/videos'

type ExportRequestPayload = {
  presetId: ExportPreset['id']
  path: CropPath
  targetFormat?: ExportPreset['format']
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Request failed')
  }

  return response.json() as Promise<T>
}

export async function searchVideos(query: string): Promise<SearchResult[]> {
  const queryString = query ? `?q=${encodeURIComponent(query)}` : ''

  const response = await fetch(`${SEARCH_ENDPOINT}${queryString}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  const body = await handleResponse<VideoSearchResponse>(response)
  return body.items || []
}

export async function getVideo(slug: string): Promise<Video> {
  const response = await fetch(`${VIDEO_ENDPOINT}/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  })

  const body = await handleResponse<VideoDetailsResponse>(response)
  if (!body.video) {
    throw new Error('Video not found')
  }
  return body.video
}

export interface ExportResponse {
  job: {
    id: string
    videoSlug: string
    presetId: string
    status: 'queued' | 'processing' | 'complete' | 'error'
    progress: number
    createdAt: string
    updatedAt: string
    downloadUrl?: string
    error?: string
  }
  message: string
}

export async function requestExport(slug: string, payload: ExportRequestPayload): Promise<ExportResponse> {
  const response = await fetch(`${VIDEO_ENDPOINT}/${slug}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  return handleResponse<ExportResponse>(response)
}
