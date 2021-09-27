import { Meta } from '@storybook/react'
import { ReactElement } from 'react'
import { Conductor } from '.'
import { journeysConfig } from '../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: Conductor,
  title: 'Journeys/Conductor'
}

export const Default = (): ReactElement => <Conductor blocks={[]} />

export default Demo as Meta
