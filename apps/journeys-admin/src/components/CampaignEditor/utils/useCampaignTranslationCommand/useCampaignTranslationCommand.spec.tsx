import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement, useState } from 'react'

import { imageSectionBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign as Campaign } from '../../../../../__generated__/GetCampaign'
import {
  CampaignTextField,
  CampaignTextSource
} from '../../../../../__generated__/globalTypes'
import { translationValue } from '../../../../libs/useCampaignBlockTextMutation'
import { CAMPAIGN_TRANSLATION_SET } from '../../../../libs/useCampaignTranslationSetMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign, withEmptyTranslations } from '../../data'
import {
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  SpyMock,
  UndoRedo
} from '../../testing'

import { useCampaignTranslationCommand } from './useCampaignTranslationCommand'

const IMAGE_ID = 'imageSectionId'
const FRENCH_ALT = 'Une famille'
const NEW_FRENCH_ALT = 'Une famille qui lit ensemble'
const REFUSAL = 'value must be at most 250 characters'

/** The seeded campaign with an Image section whose alt already has a French translation. */
const imageCampaign: Campaign = {
  ...campaign,
  blocks: [
    ...campaign.blocks,
    {
      ...withEmptyTranslations(imageSectionBlock),
      altTranslations: [
        {
          __typename: 'TranslatedValue',
          languageId: '496',
          value: FRENCH_ALT,
          source: CampaignTextSource.human
        }
      ]
    } as Campaign['blocks'][number]
  ]
}

function translationSetMock(value: string): SpyMock {
  return {
    request: {
      query: CAMPAIGN_TRANSLATION_SET,
      variables: {
        input: {
          target: { blockId: IMAGE_ID },
          field: CampaignTextField.alt,
          languageId: '496',
          value
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        campaignTranslationSet: [
          {
            __typename: 'TranslatedValue',
            languageId: '496',
            value,
            source: CampaignTextSource.human
          }
        ]
      }
    }))
  }
}

function refusedMock(value: string): SpyMock {
  return {
    request: translationSetMock(value).request,
    result: vi.fn(() => ({
      errors: [
        new GraphQLError(REFUSAL, {
          extensions: { code: 'BAD_USER_INPUT', field: 'value' }
        })
      ]
    }))
  }
}

/** The image's alt panel while previewing French: one button commits a new translation. */
function Harness(): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const { addTranslation, error } = useCampaignTranslationCommand()
  const block = current.blocks.find((candidate) => candidate.id === IMAGE_ID)
  if (block?.__typename !== 'CampaignImageBlock') return null
  const committed = translationValue(block.altTranslations, '496')
  return (
    <>
      <button
        onClick={() =>
          addTranslation({
            block,
            field: CampaignTextField.alt,
            languageId: '496',
            value: NEW_FRENCH_ALT,
            previous: committed
          })
        }
      >
        Translate alt
      </button>
      <span data-testid="FrenchAlt">{committed}</span>
      {error != null && <span data-testid="InlineError">{error}</span>}
    </>
  )
}

/** The Harness with a way to unmount it, as selecting another block does. */
function RemovableHarness(): ReactElement {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <button onClick={() => setMounted(false)}>Unmount panel</button>
      {mounted && <Harness />}
    </>
  )
}

/** Shows the Preview Language and switches it to English, as the language picker does. */
function PreviewLanguageControl(): ReactElement {
  const { state, dispatch } = useCampaignEditor()
  return (
    <>
      <span data-testid="PreviewLanguage">{state.previewLanguageId}</span>
      <button
        onClick={() =>
          dispatch({
            type: 'SetPreviewLanguageAction',
            previewLanguageId: '529'
          })
        }
      >
        Preview English
      </button>
    </>
  )
}

function renderHarness(
  mocks: MockLink.MockedResponse[],
  panel: ReactElement = <Harness />
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaign={imageCampaign}
      initialState={{ previewLanguageId: '496', selectedBlockId: IMAGE_ID }}
      mocks={mocks}
    >
      <UndoRedo />
      <CommandProbe />
      <SelectionProbe />
      <PreviewLanguageControl />
      {panel}
    </QueriedEditor>
  )
}

describe('useCampaignTranslationCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('writes a translation as one Command and undo writes the previous translation back in the Preview Language it was made in', async () => {
    const execute = translationSetMock(NEW_FRENCH_ALT)
    const undo = translationSetMock(FRENCH_ALT)
    renderHarness([execute, undo])
    expect(await screen.findByTestId('FrenchAlt')).toHaveTextContent(FRENCH_ALT)

    fireEvent.click(screen.getByRole('button', { name: 'Translate alt' }))

    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(execute.result).toHaveBeenCalled())
    expect(screen.getByTestId('FrenchAlt')).toHaveTextContent(NEW_FRENCH_ALT)

    fireEvent.click(screen.getByRole('button', { name: 'Preview English' }))
    expect(screen.getByTestId('PreviewLanguage')).toHaveTextContent('529')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('PreviewLanguage')).toHaveTextContent('496')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(IMAGE_ID)
    await waitFor(() => expect(undo.result).toHaveBeenCalled())
    expect(screen.getByTestId('FrenchAlt')).toHaveTextContent(FRENCH_ALT)
  })

  it('shows a refused first execute in the hook’s error, not the snackbar, and rolls the translation back', async () => {
    const refused = refusedMock(NEW_FRENCH_ALT)
    renderHarness([refused])
    await screen.findByTestId('FrenchAlt')

    fireEvent.click(screen.getByRole('button', { name: 'Translate alt' }))

    expect(await screen.findByTestId('InlineError')).toHaveTextContent(REFUSAL)
    expect(refused.result).toHaveBeenCalled()
    expect(screen.getAllByText(REFUSAL)).toHaveLength(1)
    expect(screen.getByTestId('FrenchAlt')).toHaveTextContent(FRENCH_ALT)
  })

  it('reports a refused undo in the snackbar after the panel has unmounted', async () => {
    const execute = translationSetMock(NEW_FRENCH_ALT)
    const refusedUndo = refusedMock(FRENCH_ALT)
    renderHarness([execute, refusedUndo], <RemovableHarness />)
    await screen.findByTestId('FrenchAlt')

    fireEvent.click(screen.getByRole('button', { name: 'Translate alt' }))
    await waitFor(() => expect(execute.result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Unmount panel' }))
    expect(screen.queryByTestId('FrenchAlt')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(await screen.findByText(REFUSAL)).toBeInTheDocument()
    expect(refusedUndo.result).toHaveBeenCalled()
    expect(screen.queryByTestId('InlineError')).not.toBeInTheDocument()
  })
})
