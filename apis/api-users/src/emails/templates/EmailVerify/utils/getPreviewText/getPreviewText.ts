import type { AppType } from '../../../../../schema/user/enums/app'

export function getPreviewText(app: NonNullable<AppType>): string {
  switch (app) {
    case 'JesusFilmApp':
      return 'Verify your email address on Jesus Film App'
    case 'NextSteps':
    default:
      return 'Verify your email address on Next Steps'
  }
}
