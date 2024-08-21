import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Trans, useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { getGoalDetails } from '@core/journeys/ui/getGoalDetails'
import Edit2Icon from '@core/shared/ui/icons/Edit2'

import type { Goal } from '../../Goals'

interface GoalsListItemProp {
  goal: Goal
  variant?: 'minimal'
  onClose?: () => void
}

export function GoalsListItem({
  goal: { count, url, goalType },
  variant,
  onClose
}: GoalsListItemProp): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    dispatch,
    state: { selectedGoalUrl }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const selected = selectedGoalUrl === url

  const iconStyles = {
    color: selected ? 'primary.main' : 'secondary.light',
    transition: (theme: Theme) => theme.transitions.create('color')
  }

  const { label, icon } = getGoalDetails(goalType, t, iconStyles)

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
    onClose?.()
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
          },
          '&:first-child > .MuiTableCell-root': {
            pt: variant === 'minimal' ? 0 : 4
          }
        }}
      >
        {variant !== 'minimal' ? (
          <TableCell
            width={0}
            align="center"
            sx={{
              display: { xs: 'none', sm: 'table-cell' },
              pr: 2,
              pl: 5
            }}
          >
            {icon}
          </TableCell>
        ) : null}
        <TableCell
          sx={{
            maxWidth: 0,
            width: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            px: variant === 'minimal' ? 0 : 4
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
            <Box
              sx={{
                display: {
                  xs: 'block',
                  sm: variant !== 'minimal' ? 'none' : 'block'
                }
              }}
            >
              {icon}
            </Box>
            <Typography variant="subtitle2" color="secondary.light">
              {label}
            </Typography>
          </Stack>
          <Typography variant="body2" color="secondary.light">
            <Trans
              t={t}
              count={count}
              i18nKey="Appears on <0>{{count}}</0> card"
              components={[<strong key={0} />]}
            />
          </Typography>
        </TableCell>
        {variant !== 'minimal' ? (
          <>
            <TableCell
              align="center"
              width={100}
              sx={{
                display: { xs: 'none', sm: 'table-cell' }
              }}
            >
              <Trans
                t={t}
                count={count}
                i18nKey="<0>{{count}}</0><1>card</1>"
                components={[
                  <Typography variant="subtitle2" key={0} />,
                  <Typography variant="body2" key={1} />
                ]}
              />
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
          </>
        ) : null}
      </TableRow>
    </>
  )
}
