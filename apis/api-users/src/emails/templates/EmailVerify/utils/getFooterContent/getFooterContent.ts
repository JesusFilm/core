import type { ComponentType } from 'react'

import { NextStepsFooterContent } from '@core/yoga/email/components/Footer'

import type { AppType } from '../../../../../schema/user/enums/app'
import { JesusFilmVerificationFooter } from '../../JesusFilmAppVerificationContent/Footer'

export function getFooterContent(app: NonNullable<AppType>): ComponentType {
  switch (app) {
    case 'NextSteps':
      return NextStepsFooterContent
    case 'Default':
      return JesusFilmVerificationFooter
    default:
      return NextStepsFooterContent
  }
}
