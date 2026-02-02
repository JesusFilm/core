import type { ComponentType } from 'react'

import type { AppType } from '../../../../../schema/user/enums/app'
import { JesusFilmAppVerificationFooter } from '../../JesusFilmAppVerificationContent/Footer'
import { NextStepsVerificationFooter } from '../../NextStepsVerificationContent/Footer'

export function getFooterContent(app: NonNullable<AppType>): ComponentType {
  switch (app) {
    case 'NextSteps':
      return NextStepsVerificationFooter
    case 'JesusFilmApp':
      return JesusFilmAppVerificationFooter
    default:
      return NextStepsVerificationFooter
  }
}
