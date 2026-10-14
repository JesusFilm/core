import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { CampaignVideoBlock } from '../../../libs/useCampaignVideoBlockCreateMutation'
import {
  CampaignVideoTextInput,
  useCampaignVideoBlockUpdateMutation
} from '../../../libs/useCampaignVideoBlockUpdateMutation'
import { CanvasMedia } from '../Canvas/CanvasMedia'
import { useCampaignStyleCommand } from '../utils/useCampaignStyleCommand'

/** The API's caps on a Campaign Video's overrides (PRD §15). */
const TITLE_MAX = 200
const DESCRIPTION_MAX = 1000

type VideoTextField = keyof CampaignVideoTextInput

interface CarouselCardEditProps {
  block: CampaignVideoBlock
}

/**
 * The Edit of a carousel card: the video it shows and its title and
 * description overrides. Each field is written when it loses focus, as one
 * Command; an empty field falls back to the video's own text.
 */
export function CarouselCardEdit({
  block
}: CarouselCardEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addStyle, error } = useCampaignStyleCommand()
  const writeText = useCampaignVideoBlockUpdateMutation()
  const [values, setValues] = useState({
    title: block.title ?? '',
    description: block.description ?? ''
  })

  useEffect(() => {
    setValues({
      title: block.title ?? '',
      description: block.description ?? ''
    })
  }, [block.title, block.description])

  function handleBlur(field: VideoTextField): void {
    const value = values[field].trim()
    const next = value === '' ? null : value
    if (next === (block[field] ?? null)) return
    addStyle<CampaignVideoBlock, CampaignVideoTextInput>({
      block,
      input: { [field]: next },
      previous: { [field]: block[field] },
      run: writeText
    })
  }

  return (
    <Stack
      spacing={4}
      data-testid="CampaignCarouselCardEdit"
      data-block-id={block.id}
    >
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <CanvasMedia media={block} />
      <TextField
        label={t('Title')}
        value={values.title}
        onChange={(event) =>
          setValues((current) => ({ ...current, title: event.target.value }))
        }
        onBlur={() => handleBlur('title')}
        helperText={`${values.title.length} / ${TITLE_MAX}`}
        slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
        size="small"
        fullWidth
      />
      <TextField
        label={t('Description')}
        value={values.description}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            description: event.target.value
          }))
        }
        onBlur={() => handleBlur('description')}
        helperText={`${values.description.length} / ${DESCRIPTION_MAX}`}
        slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX } }}
        size="small"
        multiline
        minRows={3}
        fullWidth
      />
    </Stack>
  )
}
