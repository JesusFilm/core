import type { ComponentType } from 'react'

import type { AppType } from '../../../../../schema/user/enums/app'

import { JesusFilmAppVerificationContent } from '../../JesusFilmAppVerificationContent/Body'
import type { VerificationContentProps } from '../../NextStepsVerificationContent/Body'
import { NextStepsVerificationContent } from '../../NextStepsVerificationContent/Body'

export function getVerificationContent(
  app: NonNullable<AppType>
): ComponentType<VerificationContentProps> {
  switch (app) {
    case 'JesusFilmApp':
      return JesusFilmAppVerificationContent
    case 'NextSteps':
    default:
      return NextStepsVerificationContent
  }
}
