import type { AppType } from '../../../../../schema/user/enums/app'

export function getPreviewText(app: NonNullable<AppType>): string {
  switch (app) {
    case 'Default':
      return 'Verify your email address with the Jesus Film Project'
    case 'NextSteps':
      return 'Verify your email address on Next Steps'
    default:
      return 'Verify your email address on Next Steps'
  }
}
