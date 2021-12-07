import { AccessAvatar, Role } from './AccessAvatars'

export function createToolTipTitle(user: AccessAvatar): string {
  if (user.firstName != null && user.lastName != null) {
    return `${user.firstName} ${user.lastName}`
  } else if (user.email != null) {
    return `${user.email}`
  } else {
    return 'Anonymous'
  }
}

export function createFallbackLetter(user: AccessAvatar): string | null {
  if (user.firstName != null) {
    return `${user.firstName[0].toUpperCase()}`
  } else if (user.email != null) {
    return `${user.email[0].toUpperCase()}`
  } else {
    return null
  }
}

export function orderAvatars(users: AccessAvatar[]): AccessAvatar[] {
  const owners = users.filter((user) => user.role === Role.owner)
  const editors = users.filter((user) => user.role === Role.editor)
  return owners.concat(editors)
}
