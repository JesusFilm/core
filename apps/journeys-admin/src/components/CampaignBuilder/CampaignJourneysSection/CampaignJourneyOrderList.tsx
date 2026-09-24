import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import X2Icon from '@core/shared/ui/icons/X2'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { LabelChip } from '../../LabelChip'

interface CampaignJourneyOrderListProps {
  journeys: readonly Journey[]
  onChange: (nextIds: string[]) => void
  disabled?: boolean
}

function move(ids: string[], from: number, to: number): string[] {
  const next = [...ids]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

/** Ordered list of picked journeys with up / down / remove controls. */
export function CampaignJourneyOrderList({
  journeys,
  onChange,
  disabled = false
}: CampaignJourneyOrderListProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  if (journeys.length === 0) return null
  const ids = journeys.map((journey) => journey.id)

  return (
    <List dense disablePadding data-testid="CampaignJourneyOrderList">
      {journeys.map((journey, index) => {
        const languageName =
          journey.language.name.find(({ primary }) => primary)?.value ??
          journey.language.name[0]?.value
        return (
          <ListItem
            key={journey.id}
            divider
            sx={{ px: 1 }}
            secondaryAction={
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  aria-label={t('Move {{title}} up', { title: journey.title })}
                  disabled={disabled || index === 0}
                  onClick={() => onChange(move(ids, index, index - 1))}
                >
                  <ChevronUpIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={t('Move {{title}} down', {
                    title: journey.title
                  })}
                  disabled={disabled || index === journeys.length - 1}
                  onClick={() => onChange(move(ids, index, index + 1))}
                >
                  <ChevronDownIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={t('Remove {{title}}', { title: journey.title })}
                  disabled={disabled}
                  onClick={() =>
                    onChange(ids.filter((id) => id !== journey.id))
                  }
                >
                  <X2Icon fontSize="small" />
                </IconButton>
              </Stack>
            }
          >
            <Typography
              sx={{
                minWidth: 28,
                color: 'text.secondary',
                fontVariantNumeric: 'tabular-nums'
              }}
            >
              {index + 1}.
            </Typography>
            <ListItemText
              primary={journey.title}
              secondary={languageName}
              slotProps={{
                primary: { noWrap: true },
                secondary: { noWrap: true }
              }}
              sx={{ pr: 14 }}
            />
            {journey.status === JourneyStatus.draft && (
              <LabelChip label={t('Draft')} sx={{ mr: 1 }} />
            )}
          </ListItem>
        )
      })}
    </List>
  )
}
