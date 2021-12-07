import { AccessAvatar, Role } from './AccessAvatars'

export const user1: AccessAvatar = {
  id: '1',
  firstName: 'Amin',
  lastName: 'Person',
  image: 'https://source.unsplash.com/random/300x300',
  email: 'amin@email.com',
  role: Role.inviteRequested
}

export const user2: AccessAvatar = {
  id: '2',
  firstName: 'Horace',
  lastName: 'Reader',
  image: 'https://source.unsplash.com/random/300x301',
  email: 'horace@email.com',
  role: Role.editor
}
export const user3: AccessAvatar = {
  id: '3',
  firstName: 'Coral',
  lastName: 'Ortega',
  image: 'https://source.unsplash.com/random/301x300',
  email: 'coral@email.com',
  role: Role.owner
}
export const user4: AccessAvatar = {
  id: '4',
  firstName: 'Effie',
  lastName: 'Lowe',
  image: 'https://source.unsplash.com/random/302x300',
  email: 'effie@email.com',
  role: Role.editor
}
export const user5: AccessAvatar = {
  id: '5',
  firstName: 'Janelle',
  lastName: 'Clegg',
  image: 'https://source.unsplash.com/random/302x301',
  email: 'jan@email.com',
  role: Role.inviteRequested
}

export const user6: AccessAvatar = {
  id: '6',
  firstName: 'Drake',
  lastName: 'Graham',
  image: 'https://source.unsplash.com/random/301x302',
  email: 'grahamDrake@email.com',
  role: Role.inviteRequested
}
