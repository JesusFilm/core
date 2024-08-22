import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import type { Goal } from '../Goals'

import { GoalsListItem } from './GoalsListItem'

interface GoalsListProps {
  goals: Goal[]
  variant?: 'minimal'
  onClose?: () => void
}

export function GoalsList({
  goals,
  variant,
  onClose
}: GoalsListProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()

  function handleClick(): void {
    dispatch({ type: 'SetSelectedGoalUrlAction' })
  }

  return (
    <>
      <Stack
        sx={{
          gap: { xs: 4, sm: variant !== 'minimal' ? 12 : 4 },
          mx: { xs: 0, sm: variant !== 'minimal' ? 8 : 0 },
          overflow: 'hidden'
        }}
        data-testid="GoalsList"
      >
        {variant !== 'minimal' ? (
          <Stack sx={{ mx: { xs: 6, sm: 0 } }}>
            <Box
              sx={{
                pb: 3,
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="h1">{t('The Journey Goals')}</Typography>
              <Button
                variant="outlined"
                startIcon={
                  <InformationCircleContainedIcon
                    sx={{ color: 'secondary.light' }}
                  />
                }
                sx={{
                  display: 'flex',
                  color: 'secondary.main',
                  borderColor: 'secondary.main',
                  borderRadius: 2,
                  alignSelf: { xs: 'end', sm: 'none' },
                  mb: { xs: 4, sm: 0 }
                }}
                onClick={() => handleClick()}
              >
                <Typography variant="subtitle2">{t('Learn More')}</Typography>
              </Button>
            </Box>
            <Typography>
              {t(
                'You can change them to your own clicking on the rows of this table'
              )}
            </Typography>
          </Stack>
        ) : null}
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: 'none',
            border: variant !== 'minimal' ? '1px solid #DEDFE0' : 0,
            backgroundColor: 'transparent',
            overflowY: 'auto'
          }}
        >
          <Table stickyHeader>
            <TableHead
              sx={{
                '& .MuiTableCell-stickyHeader': {
                  bgcolor: 'background.paper',
                  borderBottom: ({ palette }) =>
                    variant !== 'minimal' ? `1.5px solid ${palette.divider}` : 0
                }
              }}
            >
              <TableRow sx={{ backgroundColor: 'background.paper' }}>
                {variant !== 'minimal' ? (
                  <>
                    <TableCell
                      sx={{
                        display: {
                          xs: 'none',
                          sm: 'table-cell'
                        }
                      }}
                      width={60}
                    />
                    <TableCell width="100%">
                      <Typography variant="subtitle2">
                        {t('Target and Goal')}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        display: {
                          xs: 'none',
                          sm: 'table-cell'
                        }
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        align="center"
                        width={100}
                      >
                        {t('Appears on')}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        display: {
                          xs: 'none',
                          sm: 'table-cell'
                        }
                      }}
                      width={50}
                    />
                  </>
                ) : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {goals?.map((goal) => (
                <GoalsListItem
                  key={goal.url}
                  variant={variant}
                  goal={goal}
                  onClose={onClose}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </>
  )
}
