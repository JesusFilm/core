import { ApolloLink, InMemoryCache, gql } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { DebounceLink } from '../../../../libs/apolloClient/DebounceLink'
import {
  CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
  CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_TEXT,
  CampaignTextBlock,
  CampaignTextField,
  isCampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { CAMPAIGN_STRING_UPDATE } from '../../../../libs/useCampaignStringUpdateMutation'
import { CAMPAIGN_TRANSLATION_SET } from '../../../../libs/useCampaignTranslationSetMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import {
  CampaignEditorState,
  useCampaignEditor
} from '../../CampaignEditorProvider'
import { campaign, campaignStrings } from '../../data'
import {
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  campaignCache,
  getCampaignMock
} from '../../testing'

import {
  textDebounceKey,
  useCampaignTextCommand
} from './useCampaignTextCommand'

const hero = campaign.blocks.find(
  (block) => block.id === 'heroId'
) as CampaignTextBlock

/** One inline field over the block as the cache currently holds it. */
function Field({
  blockId,
  field
}: {
  blockId: string
  field: CampaignTextField
}): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find((candidate) => candidate.id === blockId)
  if (block == null || !isCampaignTextBlock(block)) return null
  return <BoundField block={block} field={field} />
}

function BoundField({
  block,
  field
}: {
  block: CampaignTextBlock
  field: CampaignTextField
}): ReactElement {
  const { value, error, handleChange, handleFocus, handleBlur } =
    useCampaignTextCommand({ block, field })
  return (
    <>
      <input
        aria-label={field}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {error != null && <span role="alert">{error}</span>}
    </>
  )
}

interface Mock {
  request: Record<string, unknown>
  result: ReturnType<typeof vi.fn>
  delay?: number
  maxUsageCount?: number
}

function heroMock(title: string): Mock {
  return {
    request: {
      query: CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
      variables: { id: 'heroId', input: { title } }
    },
    result: vi.fn(() => ({
      data: {
        campaignHeroBlockUpdate: {
          __typename: 'CampaignHeroBlock',
          id: 'heroId',
          eyebrow: 'Christmas 2026',
          title,
          lede: 'Pick your region to find a journey in your language, ready to share.'
        }
      }
    }))
  }
}

const HERO_TITLE = gql`
  fragment HeroTitle on CampaignHeroBlock {
    title
  }
`

function readTitle(cache: InMemoryCache): string | undefined {
  return (
    cache.readFragment<{ title: string }>({
      id: 'CampaignHeroBlock:heroId',
      fragment: HERO_TITLE,
      optimistic: true
    })?.title ?? undefined
  )
}

function renderField(
  mocks: Mock[],
  options: {
    blockId?: string
    field?: CampaignTextField
    initialState?: Partial<CampaignEditorState>
    cache?: InMemoryCache
  } = {}
): ReturnType<typeof render> {
  const link = ApolloLink.from([
    new DebounceLink(500),
    new MockLink([getCampaignMock, ...mocks] as never)
  ])
  return render(
    <QueriedEditor
      link={link}
      cache={options.cache ?? campaignCache()}
      initialState={options.initialState}
    >
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <SelectionProbe />
      <Field
        blockId={options.blockId ?? 'heroId'}
        field={options.field ?? 'title'}
      />
    </QueriedEditor>
  )
}

describe('useCampaignTextCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('groups typing into one Command by a stable id while focused and resets it on blur', async () => {
    const mocks = [heroMock('S'), heroMock('Sh'), heroMock('Sha')]
    renderField(mocks)
    const input = await screen.findByRole('textbox', { name: 'title' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'S' } })
    const firstId = screen.getByTestId('UndoCommandId').textContent
    expect(firstId).not.toBe('')
    fireEvent.change(input, { target: { value: 'Sh' } })
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.getByTestId('UndoCommandId')).toHaveTextContent(firstId)

    fireEvent.blur(input)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Sha' } })
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')
    expect(screen.getByTestId('UndoCommandId')).not.toHaveTextContent(firstId)

    // The Apollo link debounces the field's keystrokes to the last value.
    await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
    expect(mocks[0].result).not.toHaveBeenCalled()
    expect(mocks[1].result).not.toHaveBeenCalled()
  })

  it('keys the debounce by typename, block and field', () => {
    expect(textDebounceKey(hero, 'title')).toBe(
      'CampaignHeroBlock:heroId:title'
    )
  })

  it('undoes by writing the previous value back through the same mutation, optimistically', async () => {
    const cache = campaignCache()
    const mocks = [
      heroMock('New title'),
      { ...heroMock('Share the story of Christmas'), delay: 300 }
    ]
    renderField(mocks, { cache })
    const input = await screen.findByRole('textbox', { name: 'title' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'New title' } })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(readTitle(cache)).toBe('New title')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    // The optimistic response shows the previous value before the request returns.
    await waitFor(() =>
      expect(readTitle(cache)).toBe('Share the story of Christmas')
    )
    expect(mocks[1].result).not.toHaveBeenCalled()
    expect(input).toHaveValue('Share the story of Christmas')
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())

    // After an undo the next keystroke starts a fresh Command.
    const undone = screen.getByTestId('UndoCommandId').textContent
    fireEvent.change(input, { target: { value: 'New title' } })
    expect(screen.getByTestId('UndoCommandId')).not.toHaveTextContent(undone)
  })

  it('keeps what was typed when the API returns the trimmed text', async () => {
    const mocks = [
      {
        ...heroMock('Hello'),
        request: {
          query: CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
          variables: { id: 'heroId', input: { title: 'Hello ' } }
        }
      }
    ]
    renderField(mocks)
    const input = await screen.findByRole('textbox', { name: 'title' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Hello ' } })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

    await waitFor(() => expect(input).toHaveValue('Hello '))
  })

  it('undoes to the value the field held before the last undo, not the one typed after it', async () => {
    const mocks = [
      { ...heroMock('A'), maxUsageCount: 2 },
      heroMock('AB'),
      heroMock('AC')
    ]
    const cache = campaignCache()
    renderField(mocks, { cache })
    const input = await screen.findByRole('textbox', { name: 'title' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'A' } })
    fireEvent.blur(input)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'AB' } })
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(input).toHaveValue('A'))
    fireEvent.change(input, { target: { value: 'AC' } })
    await waitFor(() => expect(mocks[2].result).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(input).toHaveValue('A'))
    expect(readTitle(cache)).toBe('A')
  })

  it('redoes the change through the same mutation', async () => {
    const mocks = [
      { ...heroMock('New title'), maxUsageCount: 2 },
      heroMock('Share the story of Christmas')
    ]
    renderField(mocks)
    const input = await screen.findByRole('textbox', { name: 'title' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'New title' } })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(mocks[0].result).toHaveBeenCalledTimes(2))
    expect(input).toHaveValue('New title')
  })

  it('focuses the page and block a Command was made on before undoing it', async () => {
    const regionHeader = campaign.blocks.find(
      (block) => block.id === 'regionHeaderId'
    )
    const intro =
      regionHeader?.__typename === 'CampaignRegionHeaderBlock'
        ? regionHeader.intro
        : ''
    function introMock(value: string | null): Mock {
      return {
        request: {
          query: CAMPAIGN_REGION_HEADER_BLOCK_UPDATE_TEXT,
          variables: { id: 'regionHeaderId', input: { intro: value } }
        },
        result: vi.fn(() => ({
          data: {
            campaignRegionHeaderBlockUpdate: {
              __typename: 'CampaignRegionHeaderBlock',
              id: 'regionHeaderId',
              intro: value
            }
          }
        }))
      }
    }
    const mocks = [introMock('Hello'), introMock(intro)]
    renderField(mocks, {
      blockId: 'regionHeaderId',
      field: 'intro',
      initialState: { pageKind: CampaignPageKind.landing }
    })
    const input = await screen.findByRole('textbox', { name: 'intro' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Hello' } })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(screen.getByTestId('PageKind')).toHaveTextContent('landing')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'regionHeaderId'
    )
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
  })

  it('surfaces the API message verbatim when a save fails and rolls the value back', async () => {
    const failing: Mock = {
      ...heroMock('Bad'),
      result: vi.fn(() => ({
        errors: [{ message: 'title must be at most 150 characters' }]
      }))
    }
    renderField([failing])
    const input = await screen.findByRole('textbox', { name: 'title' })

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Bad' } })

    expect(
      await screen.findByText('title must be at most 150 characters')
    ).toBeInTheDocument()
    await waitFor(() =>
      expect(input).toHaveValue('Share the story of Christmas')
    )
  })
})

describe('useCampaignTextCommand on Campaign Strings and translations', () => {
  const copy = campaignStrings.find((string) => string.key === 'copy')!

  function StringField({
    stringKey
  }: {
    stringKey: string
  }): ReactElement | null {
    const { campaign: current } = useCampaignEditor()
    const string = current.strings.find(
      (candidate) => candidate.key === stringKey
    )
    if (string == null) return null
    return <BoundStringField string={string} />
  }

  function BoundStringField({
    string
  }: {
    string: (typeof campaignStrings)[number]
  }): ReactElement {
    const { value, fallback, handleChange, handleFocus, handleBlur } =
      useCampaignTextCommand({ string })
    return (
      <>
        <input
          aria-label={string.key}
          value={value}
          placeholder={fallback}
          onChange={(event) => handleChange(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </>
    )
  }

  function stringMock(value: string): Mock {
    return {
      request: {
        query: CAMPAIGN_STRING_UPDATE,
        variables: { campaignId: 'campaignId', key: 'copy', value }
      },
      result: vi.fn(() => ({
        data: {
          campaignStringUpdate: {
            __typename: 'CampaignString',
            id: copy.id,
            key: 'copy',
            value
          }
        }
      }))
    }
  }

  function translationMock(
    target: Record<string, string>,
    field: string,
    value: string,
    translations: Array<{ languageId: string; value: string }>
  ): Mock {
    return {
      request: {
        query: CAMPAIGN_TRANSLATION_SET,
        variables: {
          input: { target, field, languageId: '496', value }
        }
      },
      result: vi.fn(() => ({
        data: {
          campaignTranslationSet: translations.map((translation) => ({
            __typename: 'TranslatedValue',
            source: 'human',
            ...translation
          }))
        }
      }))
    }
  }

  function renderWith(
    mocks: Mock[],
    children: ReactElement,
    initialState?: Partial<CampaignEditorState>
  ): ReturnType<typeof render> & { cache: InMemoryCache } {
    const cache = campaignCache()
    const link = ApolloLink.from([
      new DebounceLink(500),
      new MockLink([getCampaignMock, ...mocks] as never)
    ])
    const rendered = render(
      <QueriedEditor link={link} cache={cache} initialState={initialState}>
        <CommandUndoItem variant="button" />
        <CommandProbe />
        <SelectionProbe />
        <PreviewLanguageProbe />
        {children}
      </QueriedEditor>
    )
    return { ...rendered, cache }
  }

  function PreviewLanguageProbe(): ReactElement {
    const {
      state: { previewLanguageId }
    } = useCampaignEditor()
    return <span data-testid="PreviewLanguage">{previewLanguageId}</span>
  }

  it('edits a Campaign String in the default language as one Command through campaignStringUpdate', async () => {
    const mocks = [stringMock('Copy the link'), stringMock('Copy link')]
    renderWith(mocks, <StringField stringKey="copy" />)
    const input = await screen.findByRole('textbox', { name: 'copy' })
    expect(input).toHaveValue('Copy link')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Copy the link' } })
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(input).toHaveValue('Copy link')
  })

  it('edits any text while previewing a non-default language as one Command through campaignTranslationSet with source human', async () => {
    const mocks = [
      translationMock({ blockId: 'heroId' }, 'title', 'Noël', [
        { languageId: '496', value: 'Noël' }
      ]),
      translationMock({ blockId: 'heroId' }, 'title', '', [])
    ]
    const { cache } = renderWith(
      mocks,
      <Field blockId="heroId" field="title" />,
      {
        previewLanguageId: '496'
      }
    )
    const input = await screen.findByRole('textbox', { name: 'title' })
    // No French translation yet: the field starts empty and the API never
    // receives a default-language write.
    expect(input).toHaveValue('')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Noël' } })
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(readTitle(cache)).toBe('Share the story of Christmas')
    const heroTranslations = cache.readFragment<{
      titleTranslations: Array<{
        languageId: string
        value: string
        source: string
      }>
    }>({
      id: 'CampaignHeroBlock:heroId',
      fragment: gql`
        fragment HeroTitleTranslations on CampaignHeroBlock {
          titleTranslations {
            languageId
            value
            source
          }
        }
      `
    })
    expect(heroTranslations?.titleTranslations).toEqual([
      {
        __typename: 'TranslatedValue',
        languageId: '496',
        value: 'Noël',
        source: 'human'
      }
    ])

    // Undo clears the entry it wrote, in the language it was written.
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByTestId('PreviewLanguage')).toHaveTextContent('496')
    await waitFor(() => expect(mocks[1].result).toHaveBeenCalled())
    expect(input).toHaveValue('')
  })

  it('translates a Campaign String by stringId while previewing a non-default language', async () => {
    const mocks = [
      translationMock({ stringId: copy.id }, 'value', 'Copier le lien', [
        { languageId: '496', value: 'Copier le lien' }
      ])
    ]
    renderWith(mocks, <StringField stringKey="copy" />, {
      previewLanguageId: '496'
    })
    const input = await screen.findByRole('textbox', { name: 'copy' })
    expect(input).toHaveValue('')
    expect(input).toHaveAttribute('placeholder', 'Copy link')

    fireEvent.focus(input)
    fireEvent.change(input, { target: { value: 'Copier le lien' } })
    await waitFor(() => expect(mocks[0].result).toHaveBeenCalled())
    expect(input).toHaveValue('Copier le lien')
  })
})
