import { AccessAvatarsProps, AccessAvatar } from './AccessAvatars'

const user1: AccessAvatar = {
  id: '1',
  firstName: 'Amin',
  lastName: 'Person',
  image: 'https://source.unsplash.com/random/300x300',
  email: 'amin@email.com'
}

const user2: AccessAvatar = {
  id: '2',
  firstName: 'Horace',
  lastName: 'Reader',
  image: 'https://source.unsplash.com/random/300x301',
  email: 'horace@email.com'
}
const user3: AccessAvatar = {
  id: '3',
  firstName: 'Coral',
  lastName: 'Ortega',
  image: 'https://source.unsplash.com/random/301x300',
  email: 'coral@email.com'
}
const user4: AccessAvatar = {
  id: '4',
  firstName: 'Effie',
  lastName: 'Lowe',
  image: 'https://source.unsplash.com/random/302x300',
  email: 'effie@email.com'
}
const user5: AccessAvatar = {
  id: '5',
  firstName: 'Janelle',
  lastName: 'Clegg',
  image: 'https://source.unsplash.com/random/300x300',
  email: 'jan@email.com'
}

export const singleAvatar: AccessAvatarsProps = {
  users: [user1]
}

export const multipleAvatars: AccessAvatarsProps = {
  users: [user1, user2, user3]
}

export const fallBackAvatars: AccessAvatarsProps = {
  users: [
    { ...user1, image: undefined },
    { ...user2, image: undefined },
    { ...user2, image: undefined }
  ]
}

export const moreThanMaxAvatars: AccessAvatarsProps = {
  users: [user1, user2, user3, user4, user5]
}
