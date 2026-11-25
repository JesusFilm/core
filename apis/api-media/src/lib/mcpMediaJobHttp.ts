import type { ServerResponse } from 'node:http'

import type { Plugin } from 'graphql-yoga'
import { z } from 'zod'

import type { PrismaClient } from '@core/prisma/media/client'
import {
  boundedJson,
  fingerprint,
  internalSignature,
  maxTransportBytes,
  readRequest,
  safeReadError,
  sameSecret,
  verifyReadCredential
} from '@core/yoga/mcp/readContract'

import type { MediaJobs } from './mcpMediaJobs'
import type { MediaSourcesConfig } from './mcpMediaSources'
import { muxCallbackJob } from './mcpVideoProvider'

export function mediaJobHttp(
  config: MediaSourcesConfig & {
    adminOrigin: string
    muxWebhookSecret?: string
  },
  db: PrismaClient,
  jobs: MediaJobs,
  browserIdentity: (token: string) => Promise<string>
): Plugin {
  return {
    async onRequest(payload) {
      const { request, serverContext } = payload
      const url = new URL(request.url, 'http://localhost')
      if (url.pathname === '/mcp/mux-callback') {
        try {
          if (
            request.method !== 'POST' ||
            !config.muxWebhookSecret ||
            url.search
          )
            throw new Error('Denied')
          // Preserve signed raw bytes, with the shared bounded transport reader.
          const reader = request.body?.getReader()
          if (!reader) throw new Error('Denied')
          const chunks: Uint8Array[] = []
          let size = 0
          let timer: ReturnType<typeof setTimeout> | undefined
          const expired = new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error('Denied')), 5000)
          })
          try {
            while (true) {
              const value = await Promise.race([reader.read(), expired])
              if (value.done) break
              size += value.value.length
              if (size > 65536) throw new Error('Denied')
              chunks.push(value.value)
            }
          } finally {
            clearTimeout(timer)
            await reader.cancel()
          }
          const raw = Buffer.concat(chunks).toString('utf8')
          const id = muxCallbackJob(
            String(raw),
            request.headers.get('mux-signature') ?? '',
            config.muxWebhookSecret
          )
          if (id) await jobs.callback(id)
          payload.endResponse(new Response(null, { status: 204 }))
        } catch {
          payload.endResponse(new Response(null, { status: 403 }))
        }
        return
      }
      if (
        url.pathname !== '/mcp/media-jobs' &&
        !url.pathname.startsWith('/mcp/uploads/')
      )
        return
      const headers = {
        'Cache-Control': 'private, no-store',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        ...(request.headers.get('origin') === config.adminOrigin
          ? {
              'Access-Control-Allow-Origin': config.adminOrigin,
              Vary: 'Origin'
            }
          : {})
      }
      const privateResponse = async (
        context: Parameters<MediaJobs['result']>[0],
        jobId: string,
        cancellation?: unknown
      ) => {
        const response = (serverContext as { res?: ServerResponse }).res
        if (!response || response.destroyed || response.writableEnded)
          throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        const { data, permitId } = await jobs.resultForOutput(context, jobId)
        if (response.closed || response.destroyed || response.writableEnded) {
          await jobs.closeOutput(permitId)
          throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        }
        const close = () => {
          response.off('finish', close)
          response.off('close', close)
          void jobs.closeOutput(permitId).catch(() => undefined)
        }
        response.once('finish', close)
        response.once('close', close)
        payload.endResponse(
          Response.json(
            { data: { ...data, ...(cancellation ? { cancellation } : {}) } },
            { headers }
          )
        )
      }
      try {
        if (url.search || url.hash) throw new Error('VALIDATION_FAILED')
        if (url.pathname === '/mcp/media-jobs') {
          if (request.method !== 'POST' || request.headers.has('authorization'))
            throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
          const body = z
            .object({
              credential: z.string(),
              permitId: z.string().uuid(),
              request: readRequest
            })
            .strict()
            .parse(
              await boundedJson(new Response(request.body), maxTransportBytes)
            )
          if (
            !sameSecret(
              request.headers.get('x-mcp-signature') ?? '',
              internalSignature(
                body.credential,
                JSON.stringify(body),
                config.internalSecret
              )
            )
          )
            throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
          const claims = verifyReadCredential(body.credential, config)
          if (
            claims.requestHash !== fingerprint(body.request) ||
            ![
              'journey_media_start',
              'journey_media_status',
              'journey_media_cancel'
            ].includes(body.request.tool)
          )
            throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
          const input = body.request
          if (
            input.tool !== 'journey_media_start' &&
            input.tool !== 'journey_media_status' &&
            input.tool !== 'journey_media_cancel'
          )
            throw new Error('VALIDATION_FAILED')
          const context = jobs.fromClaims(claims, input.input.journeyId)
          let jobId: string
          if (input.tool === 'journey_media_start') {
            const { journeyId: _journeyId, ...start } = input.input
            jobId = await jobs.admit(context, start)
          } else jobId = input.input.jobId
          const cancellation =
            input.tool === 'journey_media_cancel'
              ? await jobs.cancel(context, jobId, input.input.idempotencyKey)
              : undefined
          await privateResponse(context, jobId, cancellation)
          return
        }
        if (
          request.headers.has('origin') &&
          request.headers.get('origin') !== config.adminOrigin
        )
          throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        if (request.method === 'OPTIONS') {
          payload.endResponse(
            new Response(null, {
              status: 204,
              headers: {
                ...headers,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers':
                  'Authorization, Content-Type, X-Upload-Offset, X-Upload-Sha256, X-Upload-Action'
              }
            })
          )
          return
        }
        const jobId = z
          .string()
          .uuid()
          .parse(url.pathname.slice('/mcp/uploads/'.length))
        const job = await db.mcpMediaJob.findUnique({ where: { id: jobId } })
        if (!job) throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
        const authorization = request.headers.get('authorization') ?? ''
        let context: { userId: string; connectionId: string; journeyId: string }
        if (authorization.startsWith('Upload '))
          context = jobs.ticketContext(authorization.slice(7), job)
        else {
          const match = /^JWT ([^\s]+)$/.exec(authorization)
          if (!match || (await browserIdentity(match[1])) !== job.userId)
            throw new Error('ACCESS_DENIED_OR_NOT_FOUND')
          context = {
            userId: job.userId,
            connectionId: job.connectionId,
            journeyId: job.journeyId
          }
        }
        if (request.method === 'PUT') {
          if (!request.body) throw new Error('VALIDATION_FAILED')
          await jobs.chunk(
            context,
            jobId,
            Number(request.headers.get('x-upload-offset')),
            request.headers.get('x-upload-sha256') ?? '',
            request.body
          )
        } else if (request.method === 'POST') {
          const action = request.headers.get('x-upload-action')
          if (action === 'bind')
            await jobs.bind(
              context,
              jobId,
              (await boundedJson(
                new Response(request.body),
                4096
              )) as Parameters<MediaJobs['bind']>[2]
            )
          else if (action === 'resume') await jobs.resume(context, jobId)
          else if (action === 'cancel')
            await jobs.cancel(context, jobId, `browser-cancel:${jobId}`)
          else throw new Error('VALIDATION_FAILED')
        } else if (request.method !== 'GET')
          throw new Error('VALIDATION_FAILED')
        await privateResponse(context, jobId)
      } catch (error) {
        payload.endResponse(
          Response.json(
            { error: safeReadError(error) },
            { status: 403, headers }
          )
        )
      }
    }
  }
}
