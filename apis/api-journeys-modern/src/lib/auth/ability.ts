import { User } from '@core/yoga/firebaseClient'

import {
  Journey as JourneyObject,
  journeyAcl
} from '../../schema/journey/journey.acl'
import {
  QrCode as QrCodeObject,
  qrCodeAcl
} from '../../schema/qrCode/qrCode.acl'

export enum Action {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Manage = 'manage'
}

export enum Subject {
  Journey = 'Journey',
  QrCode = 'QrCode'
}

interface SubjectObjectTypes {
  [Subject.Journey]: JourneyObject
  [Subject.QrCode]: QrCodeObject
}

export function ability(
  action: Action,
  subjectObject: SubjectFnReturn,
  user: User
): boolean {
  if (!subjectObject) return false
  const { subject, object } = subjectObject

  switch (subject) {
    case Subject.Journey: {
      return journeyAcl(action, object as JourneyObject, user)
    }
    case Subject.QrCode: {
      return qrCodeAcl(action, object as QrCodeObject, user)
    }
    default:
      return false
  }
}

export function subject(
  subject: SubjectKey,
  object: SubjectObjectTypes[SubjectKey]
): { subject: SubjectKey; object: SubjectObjectTypes[SubjectKey] } {
  return { subject, object }
}

type SubjectFn = typeof subject
type SubjectKey = keyof typeof Subject
type SubjectFnReturn = ReturnType<SubjectFn>
