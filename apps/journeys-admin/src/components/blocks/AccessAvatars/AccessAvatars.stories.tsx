import { journeyAdminConfig } from '../../../libs/storybook'
import { AccessAvatars } from '.'
import { Meta, Story } from '@storybook/react'
import { AvatarsArray } from './AccessAvatars'

const AccessAvatarsDemo = {
  ...journeyAdminConfig,
  component: AccessAvatars,
  title: 'JourneyAdmin/AccessAvatarDemo'
}

const Template: Story = () => (
  <>
    <AccessAvatars accessAvatarsProps={avatars.slice(0, 1)} />
    <AccessAvatars accessAvatarsProps={avatars.slice(0, 4)} />
    <AccessAvatars accessAvatarsProps={avatars} />
  </>
)
// const Template: Story = ({ props }) => (
//   <AccessAvatars accessAvatarsProps={[props]} />
// )

export const Default: Story<AvatarsArray> = Template.bind({})
// Default.args = [
//   {
//     id: '1',
//     firstName: 'Amin',
//     lastName: 'Person',
//     image: 'https://source.unsplash.com/random/300x300',
//     email: 'amin@email.com'
//   },
//   {
//     id: '2',
//     firstName: 'Horace',
//     lastName: 'Reader',
//     image: 'https://source.unsplash.com/random/300x301',
//     email: 'horace@email.com'
//   },
//   {
//     id: '3',
//     firstName: 'Coral',
//     lastName: 'Ortega',
//     image: 'https://source.unsplash.com/random/301x300',
//     email: 'coral@email.com'
//   },
//   {
//     id: '4',
//     firstName: 'Effie',
//     lastName: 'Lowe',
//     image: 'https://source.unsplash.com/random/302x300',
//     email: 'effie@email.com'
//   },
//   {
//     id: '4',
//     firstName: 'Leffie',
//     lastName: 'Lowe',
//     image: 'https://source.unsplash.com/random/302x301',
//     email: 'leffie@email.com'
//   }
// ]

const avatars = [
  {
    id: '1',
    firstName: 'Amin',
    lastName: 'Person',
    image: 'https://source.unsplash.com/random/300x300',
    email: 'amin@email.com'
  },
  {
    id: '2',
    firstName: 'Horace',
    lastName: 'Reader',
    image: 'https://source.unsplash.com/random/300x301',
    email: 'horace@email.com'
  },
  {
    id: '3',
    firstName: 'Coral',
    lastName: 'Ortega',
    image: 'https://source.unsplash.com/random/301x300',
    email: 'coral@email.com'
  },
  {
    id: '4',
    firstName: 'Effie',
    lastName: 'Lowe',
    image: 'https://source.unsplash.com/random/302x300',
    email: 'effie@email.com'
  },
  {
    id: '5',
    firstName: 'Leffie',
    lastName: 'Lowe',
    image: 'https://source.unsplash.com/random/302x301',
    email: 'leffie@email.com'
  }
]

export default AccessAvatarsDemo as Meta
