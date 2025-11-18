import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { format } from 'date-fns'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { UserTeamRole } from '../../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../../libs/useCurrentUserLazyQuery'
import { useIntegrationQuery } from '../../../libs/useIntegrationQuery'
import { useUserTeamsAndInvitesQuery } from '../../../libs/useUserTeamsAndInvitesQuery'

import { GoogleIntegrationDeleteSyncDialog } from './GoogleIntegrationDeleteSyncDialog/GoogleIntegrationDeleteSyncDialog'
import { GoogleIntegrationRemoveDialog } from './GoogleIntegrationRemoveDialog/GoogleIntegrationRemoveDialog'

export const GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION = gql`
  query GoogleSheetsSyncsByIntegration($filter: GoogleSheetsSyncsFilter!) {
    googleSheetsSyncs(filter: $filter) {
      id
      spreadsheetId
      sheetName
      email
      deletedAt
      createdAt
      journey {
        id
        slug
        title
      }
    }
  }
`

interface GoogleSheetsSyncsByIntegrationQuery {
  googleSheetsSyncs: Array<{
    id: string
    spreadsheetId: string | null
    sheetName: string | null
    email: string | null
    deletedAt: string | null
    createdAt: string
    journey: {
      id: string
      slug: string | null
      title: string | null
    } | null
  }>
}

export function GoogleIntegrationDetails(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const integrationId = router.query.integrationId
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)

  const { data, loading: integrationLoading } = useIntegrationQuery({
    teamId: router.query.teamId as string
  })
  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()
  const { data: teamData } = useUserTeamsAndInvitesQuery(
    router.query.teamId != null
      ? {
          teamId: router.query.teamId as string,
          where: { role: [UserTeamRole.manager, UserTeamRole.member] }
        }
      : undefined
  )

  const { data: syncsData, loading: syncsLoading } =
    useQuery<GoogleSheetsSyncsByIntegrationQuery>(
      GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION,
      {
        variables: { filter: { integrationId: integrationId as string } },
        skip: typeof integrationId !== 'string'
      }
    )

  const googleSheetsSyncs = syncsData?.googleSheetsSyncs ?? []
  const activeSyncs = googleSheetsSyncs.filter((sync) => sync.deletedAt == null)
  const historySyncs = googleSheetsSyncs.filter(
    (sync) => sync.deletedAt != null
  )
  const [syncPendingDelete, setSyncPendingDelete] = useState<string | null>(
    null
  )

  function getStartedByLabel(sync: (typeof googleSheetsSyncs)[number]): string {
    if (sync.email != null && sync.email !== '') return sync.email
    return 'N/A'
  }

  function handleRequestDeleteSync(syncId: string): void {
    setSyncPendingDelete(syncId)
  }

  function handleCloseDeleteDialog(): void {
    setSyncPendingDelete(null)
  }
  useEffect(() => {
    void loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentUserId = currentUser?.id

  const integrationOwner = data?.integrations.find(
    (integration) => integration.id === integrationId
  )
  const integrationOwnerId =
    integrationOwner?.__typename === 'IntegrationGoogle'
      ? integrationOwner.user?.id
      : undefined

  const isIntegrationOwner =
    integrationOwnerId != null &&
    currentUserId != null &&
    integrationOwnerId === currentUserId

  const isTeamManager =
    currentUserId != null &&
    (teamData?.userTeams?.some(
      (userTeam) =>
        userTeam.user.id === currentUserId &&
        userTeam.role === UserTeamRole.manager
    ) ??
      false)

  const canManageSyncs = isIntegrationOwner || isTeamManager

  return (
    <Stack gap={4}>
      <Stack>
        {data?.integrations
          .filter((i) => i.id === integrationId)
          .map((i) => (
            <Stack key={i.id} direction="row" justifyContent="space-between">
              <Typography variant="body1" component="span">
                {t('Connected Google Account')}
              </Typography>
              {
                // @ts-expect-error union narrowing not applied
                i.accountEmail ?? t('Unknown')
              }
            </Stack>
          ))}
      </Stack>
      <Stack direction="row" justifyContent="flex-end">
        <Button
          onClick={() => setConfirmOpen(true)}
          disabled={integrationLoading || !canManageSyncs}
        >
          {t('Remove')}
        </Button>
      </Stack>
      <Stack gap={4}>
        <Typography variant="h6">{t('Google Sheets Syncs')}</Typography>
        {syncsLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4
            }}
          >
            <CircularProgress size={24} aria-label={t('Loading')} />
          </Box>
        ) : (
          <>
            <Stack gap={2}>
              <Typography variant="subtitle1">{t('Active')}</Typography>
              {activeSyncs.length === 0 ? (
                <Typography variant="body2">
                  {historySyncs.length > 0
                    ? t(
                        'There are no active Google Sheets syncs. Removed syncs are listed in history below.'
                      )
                    : t(
                        'There are no Google Sheets syncs for this integration yet.'
                      )}
                </Typography>
              ) : (
                <TableContainer>
                  <Table
                    size="small"
                    stickyHeader
                    aria-label={t('Active syncs')}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Sheet ID')}</TableCell>
                        <TableCell>{t('Tab Name')}</TableCell>
                        <TableCell>{t('Journey')}</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          {t('Sync Start')}
                        </TableCell>
                        <TableCell>{t('Started By')}</TableCell>
                        <TableCell sx={{ width: 120 }}>{t('Status')}</TableCell>
                        {canManageSyncs && (
                          <TableCell sx={{ width: 80 }} align="right">
                            {t('Actions')}
                          </TableCell>
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeSyncs.map((sync) => {
                        const createdAtDate = new Date(sync.createdAt)
                        const formattedDate = !Number.isNaN(
                          createdAtDate.getTime()
                        )
                          ? format(createdAtDate, 'yyyy-MM-dd')
                          : 'N/A'
                        const journeySlug = sync.journey?.slug ?? 'N/A'
                        const journeyTitle = sync.journey?.title ?? ''
                        const startedBy = getStartedByLabel(sync)

                        return (
                          <TableRow key={sync.id} hover>
                            <TableCell width="40%">
                              <Tooltip
                                title={sync.spreadsheetId ?? ''}
                                arrow
                                placement="top"
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 240,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {sync.spreadsheetId ?? 'N/A'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={sync.sheetName ?? ''}
                                arrow
                                placement="top"
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {sync.sheetName ?? 'N/A'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={journeyTitle}
                                arrow
                                placement="top"
                              >
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {journeySlug}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ width: 120 }}>
                              {formattedDate}
                            </TableCell>
                            <TableCell>{startedBy}</TableCell>
                            <TableCell sx={{ width: 120 }}>
                              <Chip
                                label={t('Active')}
                                color="success"
                                size="small"
                              />
                            </TableCell>
                            {canManageSyncs && (
                              <TableCell sx={{ width: 80 }} align="right">
                                <IconButton
                                  aria-label={t('Delete sync')}
                                  color="error"
                                  size="small"
                                  onClick={() =>
                                    handleRequestDeleteSync(sync.id)
                                  }
                                >
                                  <Trash2Icon width={18} height={18} />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>

            <Stack gap={2}>
              <Typography variant="subtitle1">{t('History')}</Typography>
              {historySyncs.length === 0 ? (
                <Typography variant="body2">
                  {t('No removed syncs yet.')}
                </Typography>
              ) : (
                <TableContainer>
                  <Table
                    size="small"
                    stickyHeader
                    aria-label={t('Removed syncs')}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Sheet ID')}</TableCell>
                        <TableCell>{t('Tab Name')}</TableCell>
                        <TableCell>{t('Journey')}</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          {t('Removed At')}
                        </TableCell>
                        <TableCell>{t('Started By')}</TableCell>
                        <TableCell sx={{ width: 120 }}>{t('Status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historySyncs.map((sync) => {
                        const removedAtDate = sync.deletedAt
                          ? new Date(sync.deletedAt)
                          : null
                        const removedAt =
                          removedAtDate != null &&
                          !Number.isNaN(removedAtDate.getTime())
                            ? format(removedAtDate, 'yyyy-MM-dd')
                            : 'N/A'
                        const journeySlug = sync.journey?.slug ?? 'N/A'
                        const journeyTitle = sync.journey?.title ?? ''
                        const startedBy = getStartedByLabel(sync)

                        return (
                          <TableRow key={sync.id} hover>
                            <TableCell width="40%">
                              <Tooltip
                                title={sync.spreadsheetId ?? ''}
                                arrow
                                placement="top"
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 240,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {sync.spreadsheetId ?? 'N/A'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={sync.sheetName ?? ''}
                                arrow
                                placement="top"
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {sync.sheetName ?? 'N/A'}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Tooltip
                                title={journeyTitle}
                                arrow
                                placement="top"
                              >
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {journeySlug}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ width: 120 }}>
                              {removedAt}
                            </TableCell>
                            <TableCell>{startedBy}</TableCell>
                            <TableCell sx={{ width: 120 }}>
                              <Chip label={t('Removed')} size="small" />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </>
        )}
      </Stack>

      <GoogleIntegrationRemoveDialog
        open={confirmOpen}
        integrationId={
          typeof integrationId === 'string' ? integrationId : undefined
        }
        teamId={
          typeof router.query.teamId === 'string'
            ? router.query.teamId
            : undefined
        }
        handleClose={() => setConfirmOpen(false)}
      />

      {typeof integrationId === 'string' && (
        <GoogleIntegrationDeleteSyncDialog
          open={syncPendingDelete != null}
          syncId={syncPendingDelete}
          integrationId={integrationId}
          syncsQueryDocument={GET_GOOGLE_SHEETS_SYNCS_BY_INTEGRATION}
          handleClose={handleCloseDeleteDialog}
        />
      )}
    </Stack>
  )
}
