import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../../../../../../libs/storybook'

import { ProjectIdSelect } from '.'

const ProjectIdSelectDemo: Meta<typeof ProjectIdSelect> = {
  ...simpleComponentConfig,
  component: ProjectIdSelect,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Form/ProjectIdSelect'
}

const Template: StoryObj<ComponentProps<typeof ProjectIdSelect>> = {
  render: ({ ...args }) => (
    <MockedProvider>
      <ProjectIdSelect {...args} />
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'id',
    currentProjectId: null,
    projects: [],
    loading: false
  }
}

export const Filled = {
  ...Template,
  args: {
    id: 'id',
    currentProjectId: 'projectId',
    projects: [
      { __typename: 'FormiumProject', id: 'projectId', name: 'project name' }
    ],
    loading: false
  }
}

export const Loading = {
  ...Template,
  args: {
    id: 'id',
    currentProjectId: null,
    projects: [],
    loading: true
  }
}

export default ProjectIdSelectDemo
