import { builder } from '../builder'

import { type LogEntry, checkJourneysData } from './service'

const UserDeleteJourneysLogEntry =
  builder.objectRef<LogEntry>('UserDeleteJourneysLogEntry')

builder.objectType(UserDeleteJourneysLogEntry, {
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false }),
    level: t.exposeString('level', { nullable: false }),
    timestamp: t.exposeString('timestamp', { nullable: false })
  })
})

interface UserDeleteJourneysCheckResultShape {
  journeysToDelete: number
  journeysToTransfer: number
  journeysToRemove: number
  teamsToDelete: number
  teamsToTransfer: number
  teamsToRemove: number
  logs: LogEntry[]
}

const UserDeleteJourneysCheckResult =
  builder.objectRef<UserDeleteJourneysCheckResultShape>(
    'UserDeleteJourneysCheckResult'
  )

builder.objectType(UserDeleteJourneysCheckResult, {
  fields: (t) => ({
    journeysToDelete: t.exposeInt('journeysToDelete', { nullable: false }),
    journeysToTransfer: t.exposeInt('journeysToTransfer', { nullable: false }),
    journeysToRemove: t.exposeInt('journeysToRemove', { nullable: false }),
    teamsToDelete: t.exposeInt('teamsToDelete', { nullable: false }),
    teamsToTransfer: t.exposeInt('teamsToTransfer', { nullable: false }),
    teamsToRemove: t.exposeInt('teamsToRemove', { nullable: false }),
    logs: t.field({
      type: [UserDeleteJourneysLogEntry],
      nullable: false,
      resolve: (parent) => parent.logs
    })
  })
})

export { UserDeleteJourneysLogEntry }

builder.mutationField('userDeleteJourneysCheck', (t) =>
  t.withAuth({ isValidInterop: true }).field({
    type: UserDeleteJourneysCheckResult,
    nullable: false,
    args: {
      userId: t.arg.string({ required: true })
    },
    resolve: async (_parent, { userId }) => {
      return await checkJourneysData(userId)
    }
  })
)
