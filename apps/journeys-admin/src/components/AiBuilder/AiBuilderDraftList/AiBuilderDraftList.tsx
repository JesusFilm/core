import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import Trash2Icon from '@core/shared/ui/icons/Trash2'

import type { AiBuilderDraft } from '../libs/aiBuilderDraft'

interface AiBuilderDraftListProps {
  drafts: AiBuilderDraft[]
  activeId: string | null
  disabled: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function AiBuilderDraftList({
  drafts,
  activeId,
  disabled,
  onSelect,
  onNew,
  onDelete
}: AiBuilderDraftListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
      <Button
        variant="outlined"
        onClick={onNew}
        disabled={disabled}
        sx={{ m: 2 }}
      >
        {t('New draft')}
      </Button>
      <List dense sx={{ overflowY: 'auto', flexGrow: 1 }}>
        {drafts.map((draft) => (
          <ListItem
            key={draft.id}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                aria-label={t('Delete draft')}
                disabled={disabled}
                onClick={() => onDelete(draft.id)}
              >
                <Trash2Icon />
              </IconButton>
            }
          >
            <ListItemButton
              selected={draft.id === activeId}
              disabled={disabled}
              onClick={() => onSelect(draft.id)}
            >
              <ListItemText
                primary={draft.title === '' ? t('Untitled draft') : draft.title}
                secondary={new Date(draft.updatedAt).toLocaleString()}
                slotProps={{ primary: { noWrap: true } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}
