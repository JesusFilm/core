import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import BibleIcon from '@core/shared/ui/icons/Bible'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import LinkAngledIcon from '@core/shared/ui/icons/LinkAngled'
import MessageChat1Icon from '@core/shared/ui/icons/MessageChat1'

import type { Goal } from '../../Goals'

interface GoalsListItemProp {
  goal: Goal
}

export function GoalsListItem({
  goal: { count, url, goalType }
}: GoalsListItemProp): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    dispatch,
    state: { selectedGoalUrl }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const selected = selectedGoalUrl === url

  let goalLabel: string, goalIcon: ReactElement

  switch (goalType) {
    case GoalType.Chat:
      goalLabel = t('Start a Conversation')
      goalIcon = (
        <MessageChat1Icon
          sx={{
            color: selected ? 'primary.main' : 'secondary.light',
            transition: (theme) => theme.transitions.create('color')
          }}
        />
      )
      break
    case GoalType.Bible:
      goalLabel = t('Link to Bible')
      goalIcon = (
        <BibleIcon
          sx={{
            color: selected ? 'primary.main' : 'secondary.light',
            transition: (theme) => theme.transitions.create('color')
          }}
        />
      )
      break
    default:
      goalLabel = t('Visit a Website')
      goalIcon = (
        <LinkAngledIcon
          sx={{
            color: selected ? 'primary.main' : 'secondary.light',
            transition: (theme) => theme.transitions.create('color')
          }}
        />
      )
      break
  }

  function handleClick(): void {
    dispatch({
      type: 'SetSelectedGoalUrlAction',
      selectedGoalUrl: url
    })
    if (!smUp) {
      dispatch({
        type: 'SetActiveSlideAction',
        activeSlide: ActiveSlide.Drawer
      })
    }
  }

  return (
    <>
      <TableRow
        onClick={() => handleClick()}
        selected={selected}
        sx={{
          cursor: 'pointer',
          backgroundColor: 'background.paper',
          transition: (theme) => theme.transitions.create('background-color'),
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.6)'
            }
          }
        }}
      >
        <TableCell
          width={0}
          align="center"
          sx={{
            display: { xs: 'none', sm: 'table-cell' },
            pr: 2,
            pl: 5
          }}
        >
          {goalIcon}
        </TableCell>
        <TableCell
          sx={{
            maxWidth: 0,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              transition: (theme) => theme.transitions.create('color'),
              color: selected ? 'secondary.dark' : 'text.primary',
              pb: 1
            }}
          >
            {url}
          </Typography>
          <Stack
            gap={2}
            direction="row"
            alignItems="center"
            pb={2.5}
            sx={{
              transition: (theme) => theme.transitions.create('color'),
              color: selected ? 'primary.main' : 'secondary.light'
            }}
          >
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>{goalIcon}</Box>
            <Typography variant="subtitle2" color="secondary.light">
              {goalLabel}
            </Typography>
          </Stack>
          <Typography variant="body2" color="secondary.light">
            <Trans t={t} count={count}>
              Appears on <strong>{count}</strong> card
            </Trans>
          </Typography>
        </TableCell>
        <TableCell
          align="center"
          width={100}
          sx={{
            display: { xs: 'none', sm: 'table-cell' }
          }}
        >
          <Trans t={t} count={count}>
            <Typography variant="subtitle2">{count}</Typography>
            <Typography variant="body2">card</Typography>
          </Trans>
        </TableCell>
        <TableCell
          width={40}
          sx={{
            display: { xs: 'none', sm: 'table-cell' },
            pl: 0,
            pr: 5
          }}
        >
          <Edit2Icon
            sx={{
              transition: (theme) => theme.transitions.create('color'),
              color: selected ? 'primary.main' : 'background.default'
            }}
          />
        </TableCell>
      </TableRow>
    </>
  )
}
