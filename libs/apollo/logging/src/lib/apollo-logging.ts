// modified from https://github.com/alias-rahil/apollo-winston-logging-plugin

import { v4 as uuidv4 } from 'uuid'
import {
  ApolloServerPlugin,
  GraphQLRequestListener
} from 'apollo-server-plugin-base'
import * as winston from 'winston'

const stringify = (obj: unknown) => JSON.stringify(obj)
const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
})

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
}

export const apolloWinstonLoggingPlugin = (
  opts: Options = {}
): ApolloServerPlugin => {
  const {
    didEncounterErrors = true,
    didResolveOperation = false,
    executionDidStart = false,
    parsingDidStart = false,
    responseForOperation = false,
    validationDidStart = false,
    willSendResponse = true,
    requestDidStart = true
  } = opts.config || {}

  const { debug = 'debug', info = 'info', error = 'error' } = opts.levels || {}
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
