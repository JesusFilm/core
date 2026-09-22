import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

import BibleIcon from '@core/shared/ui/icons/Bible'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'

interface GoalDescriptionProps {
  label: string
  description: string
  icon: ReactNode
}

export function ActionInformation(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const GoalDescription = ({
    label,
    description,
    icon
  }: GoalDescriptionProps): ReactElement => (
    <Stack
      direction="row"
      sx={{
        gap: 3,
        pb: 2
      }}
    >
      {icon}
      <Stack direction="column">
        <Typography variant="subtitle2" gutterBottom sx={{ pt: 0.5 }}>
          {label}
        </Typography>
        <Typography
          variant="caption"
          gutterBottom
          sx={{
            color: 'secondary.light'
          }}
        >
          {description}
        </Typography>
      </Stack>
    </Stack>
  )

  return (
    <Stack
      data-testid="ActionInformation"
      sx={{
        gap: 2,
        p: 6
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: 'secondary.dark'
        }}
      >
        {t('What are Goals?')}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'secondary.light',
          mb: 6
        }}
      >
        {t(
          'Depending on the link you provide for the actions, the target of your Journey will be determined automatically from the following list:'
        )}
      </Typography>
      <GoalDescription
        label={t('Start a Chat')}
        description={t('If the goal is to go any chat platform')}
        icon={<MessageChat1Icon />}
      />
      <GoalDescription
        label={t('Visit a Website')}
        description={t(
          'This could be your church or ministry website, or whatever you want to redirect the viewer to.'
        )}
        icon={<LinkAngledIcon />}
      />
      <GoalDescription
        label={t('Link to Bible')}
        description={t('If the target of the journey is to download the Bible')}
        icon={<BibleIcon />}
      />
    </Stack>
  )
}
