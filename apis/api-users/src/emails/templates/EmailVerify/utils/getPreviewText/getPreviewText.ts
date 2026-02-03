import type { AppType } from '../../../../../schema/user/enums/app'

export function getPreviewText(app: NonNullable<AppType>): string {
  switch (app) {
    case 'NextSteps':
      return 'Verify your email address on Next Steps'
    case 'Default':
    default:
      return 'Verify your email address with the Jesus Film Project'
  }
}
