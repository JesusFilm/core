import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_RadioOptionBlock as RadioOptionBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  BlockEventLabel,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { TEMPLATE_LABELS } from '../../../../../../../libs/useTemplateLabelsQuery'
import { MuxVideoUploadProvider } from '../../../../../../MuxVideoUploadProvider'

import { Button } from './Button'
import { Card } from './Card'
import { RadioOption } from './RadioOption'
import { Video } from './Video'

const common = {
  id: 'block.id',
  parentBlockId: 'parent.id',
  parentOrder: 0,
  eventLabel: BlockEventLabel.custom1,
  children: []
}

const card: TreeBlock<CardBlock> = {
  ...common,
  __typename: 'CardBlock',
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  showAssistant: null,
  expandChatByDefault: null
}

const button: TreeBlock<ButtonBlock> = {
  ...common,
  __typename: 'ButtonBlock',
  label: 'Button',
  buttonVariant: null,
  buttonColor: null,
  size: null,
  startIconId: null,
  endIconId: null,
  submitEnabled: false,
  action: null,
  settings: null
}

const radioOption: TreeBlock<RadioOptionBlock> = {
  ...common,
  __typename: 'RadioOptionBlock',
  label: 'Option',
  action: null,
  pollOptionImageBlockId: null
}

const video: TreeBlock<VideoBlock> = {
  ...common,
  __typename: 'VideoBlock',
  endEventLabel: BlockEventLabel.custom2,
  videoId: null,
  videoVariantLanguageId: null,
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  posterBlockId: null,
  muted: true,
  autoplay: true,
  startAt: null,
  endAt: null,
  fullsize: null,
  action: null,
  mediaVideo: null,
  subtitleLanguage: null,
  showGeneratedSubtitles: null,
  customizable: null,
  notes: null
}

const cases = [
  { name: 'Card', element: <Card {...card} />, block: card },
  { name: 'Button', element: <Button {...button} />, block: button },
  {
    name: 'RadioOption',
    element: <RadioOption {...radioOption} />,
    block: radioOption
  },
  { name: 'Video', element: <Video {...video} />, block: video }
]

function renderProperties(
  element: ReactElement,
  block: TreeBlock,
  template: boolean,
  cache: InMemoryCache
): void {
  render(
    <MockedProvider cache={cache}>
      <SnackbarProvider>
        <FlagsProvider flags={{ editJourneyTrackingMetrics: true }}>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                id: template ? 'template.id' : 'child.id',
                template,
                fromTemplateId: template ? 'another-parent.id' : 'template.id'
              },
              renderMode: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: block }}>
              <MuxVideoUploadProvider>{element}</MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </FlagsProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

function writeLabels(cache: InMemoryCache, custom1Label: string): void {
  cache.writeQuery({
    query: TEMPLATE_LABELS,
    variables: { id: 'template.id' },
    data: {
      adminJourney: {
        __typename: 'Journey',
        id: 'template.id',
        custom1Label,
        custom2Label: 'Follow-up',
        custom3Label: null
      }
    }
  })
}

describe('Tracking property summaries', () => {
  it.each(cases)(
    'shows and refreshes $name template names from the cache',
    async ({ name, element, block }) => {
      const cache = new InMemoryCache()
      writeLabels(cache, '<b>Registered</b>')
      renderProperties(element, block, true, cache)

      const suffix = name === 'Video' ? ' / Follow-up' : ''
      expect(
        await screen.findByRole('button', {
          name: `Tracking <b>Registered</b>${suffix}`
        })
      ).toBeInTheDocument()

      act(() => writeLabels(cache, 'Attending'))

      expect(
        await screen.findByRole('button', {
          name: `Tracking Attending${suffix}`
        })
      ).toBeInTheDocument()
    }
  )

  it.each(cases)(
    'keeps $name child summaries on defaults',
    async ({ name, element, block }) => {
      const cache = new InMemoryCache()
      writeLabels(cache, 'Parent definition')
      renderProperties(element, block, false, cache)

      const suffix = name === 'Video' ? ' / Custom Tracking 2' : ''
      expect(
        await screen.findByRole('button', {
          name: `Tracking Custom Tracking 1${suffix}`
        })
      ).toBeInTheDocument()
      expect(screen.queryByText('Parent definition')).not.toBeInTheDocument()
    }
  )
})
