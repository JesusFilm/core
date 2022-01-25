// modified from https://github.com/alias-rahil/apollo-winston-logging-plugin

import { v4 as uuidv4 } from 'uuid'
import {
  ApolloServerPlugin,
  GraphQLRequestListener
} from 'apollo-server-plugin-base'
import winston from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch'
import AWS from 'aws-sdk'

const stringify = (obj: unknown): string => JSON.stringify(obj)
interface Options {
  config?: {
    didEncounterErrors?: boolean
    didResolveOperation?: boolean
    executionDidStart?: boolean
    parsingDidStart?: boolean
    responseForOperation?: boolean
    validationDidStart?: boolean
    willSendResponse?: boolean
    requestDidStart?: boolean
  }

  winstonInstance?: winston.Logger

  levels?: {
    debug?: string
    info?: string
    error?: string
  }

  level?: string
}

const transports =
  process.env.AWS_ACCESS_KEY_ID != null
    ? []
    : [new winston.transports.Console()]

export const apolloWinstonLoggingPlugin = (
  opts: Options = {}
): ApolloServerPlugin => {
  const logger = winston.createLogger({
    level: opts.level ?? 'warn',
    transports: transports
  })
  if (process.env.AWS_ACCESS_KEY_ID != null) {
    AWS.config.update({
      region: 'us-east-2'
    })
    logger.add(
      new WinstonCloudWatch({
        name: 'api-gateway',
        logGroupName: 'JesusFilm-core',
        logStreamName: 'api-gateway',
        level: opts.level ?? 'warn',
        retentionInDays: 7
      })
    )
  }
  const {
    didEncounterErrors = true,
    didResolveOperation = false,
    executionDidStart = false,
    parsingDidStart = false,
    responseForOperation = false,
    validationDidStart = false,
    willSendResponse = true,
    requestDidStart = true
  } = opts.config ?? {}

  const { debug = 'debug', info = 'info', error = 'error' } = opts.levels ?? {}
  const { winstonInstance = logger } = opts

  return {
    async requestDidStart(context) {
      const id = uuidv4()
      const { query, operationName, variables } = context.request
      if (requestDidStart) {
        winstonInstance.log(
          info,
          stringify({
            id,
            event: 'request',
            operationName,
            query: query?.replace(/\s+/g, ' '),
            variables
          })
        )
      }
      const handlers: GraphQLRequestListener = {
        async didEncounterErrors({ errors }) {
          if (didEncounterErrors) {
            winstonInstance.log(
              error,
              stringify({ id, event: 'errors', errors })
            )
          }
        },

        async willSendResponse({ response }) {
          if (willSendResponse) {
            winstonInstance.log(
              debug,
              stringify({
                id,
                event: 'response',
                response: response.data
              })
            )
          }
        },

        async didResolveOperation(ctx) {
          if (didResolveOperation) {
            winstonInstance.log(
              debug,
              stringify({
                id,
                event: 'didResolveOperation',
                ctx
              })
            )
          }
        },
        async executionDidStart(ctx) {
          if (executionDidStart) {
            winstonInstance.log(
              debug,
              stringify({ id, event: 'executionDidStart', ctx })
            )
          }
        },

        async parsingDidStart(ctx) {
          if (parsingDidStart) {
            winstonInstance.log(
              debug,
              stringify({ id, event: 'parsingDidStart', ctx })
            )
          }
        },

        async validationDidStart(ctx) {
          if (validationDidStart) {
            winstonInstance.log(
              debug,
              stringify({ id, event: 'validationDidStart', ctx })
            )
          }
        },

        async responseForOperation(ctx) {
          if (responseForOperation) {
            winstonInstance.log(
              debug,
              stringify({
                id,
                event: 'responseForOperation',
                ctx
              })
            )
          }
          return null
        }
      }
      return handlers
    }
  }
}
