import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'
import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import Globe from '@core/shared/ui/icons/Globe'
import Lightning2 from '@core/shared/ui/icons/Lightning2'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import logoGray from '../../../../public/logo-grayscale.svg'
import { Avatar } from '../../Avatar'
import { AnalyticsItem } from '../../Editor/Toolbar/Items/AnalyticsItem'
import { ResponsesItem } from '../../Editor/Toolbar/Items/ResponsesItem'
import { JourneyCardMenu } from '../JourneyCard/JourneyCardMenu'
import { LastModifiedDate } from '../JourneyCard/JourneyCardText/LastModifiedDate'
import { JourneyCardVariant } from '../JourneyCard/journeyCardVariant'
import { TemplateAggregateAnalytics } from '../JourneyCard/TemplateAggregateAnalytics'

const TemplateBreakdownAnalyticsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TemplateBreakdownAnalyticsDialog" */
      '../../TemplateBreakdownAnalyticsDialog/TemplateBreakdownAnalyticsDialog'
    ).then((mod) => mod.TemplateBreakdownAnalyticsDialog),
  { ssr: false }
)

export interface JourneyListRowItem {
  journey: Journey
  variant?: JourneyCardVariant
}

interface JourneyListRowsProps {
  rows: JourneyListRowItem[]
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

interface JourneyListRowProps extends JourneyListRowItem {
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

export function JourneyListRows({
  rows,
  refetch
}: JourneyListRowsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#FAFAFB' }}>
            <TableCell sx={{ width: 78 }} />
            <TableCell>{t('Name')}</TableCell>
            <TableCell align="right">{t('Activity')}</TableCell>
            <TableCell>{t('Language')}</TableCell>
            <TableCell>{t('Owner')}</TableCell>
            <TableCell>{t('Last modified')}</TableCell>
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ journey, variant }) => (
            <JourneyListRow
              key={journey.id}
              journey={journey}
              variant={variant}
              refetch={refetch}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function JourneyListRow({
  journey,
  variant = JourneyCardVariant.default,
  refetch
}: JourneyListRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isNavigating = useNavigationState()
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
  const [, setHasOpenDialog] = useState(false)
  const languageName = journey.language.name.find(
    ({ primary }) =>
      primary || journey.language.name.some(({ primary }) => !primary)
  )?.value
  const isTemplateCard =
    journey.template === true && journey.team?.id !== 'jfp-team'

  return (
    <>
      <TableRow
        hover
        data-testid={`JourneyListRow-${journey.id}`}
        sx={{
          cursor: 'pointer',
          '& .MuiTableCell-root': {
            py: 1.25
          }
        }}
      >
        <TableCell>
          <Thumbnail
            journey={journey}
            isNavigating={isNavigating}
            isImageLoading={isImageLoading}
            setIsImageLoading={setIsImageLoading}
          />
        </TableCell>
        <TableCell>
          <Typography
            component={NextLink}
            prefetch={false}
            href={`/journeys/${journey.id}`}
            sx={{
              display: 'block',
              fontWeight: 500,
              color: 'text.primary',
              textDecoration: 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              opacity: isNavigating ? 0.5 : 1,
              pointerEvents: isNavigating ? 'none' : 'auto'
            }}
          >
            {journey.title}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            {variant !== JourneyCardVariant.default && (
              <TagChip
                label={
                  variant === JourneyCardVariant.new
                    ? t('New')
                    : t('Action Required')
                }
              />
            )}
            {journey.customizable === true && (
              <TagChip
                label={t('Quick Start')}
                icon={<Lightning2 sx={{ fontSize: 12 }} />}
              />
            )}
            {journey.website === true && (
              <TagChip
                label={t('Website')}
                icon={<Globe sx={{ fontSize: 12 }} />}
              />
            )}
          </Stack>
        </TableCell>
        <TableCell align="right">
          <ActivityCell
            journey={journey}
            isTemplateCard={isTemplateCard}
            onOpenBreakdown={() => setBreakdownDialogOpen(true)}
          />
        </TableCell>
        <TableCell sx={{ color: 'text.secondary' }}>{languageName}</TableCell>
        <TableCell>
          <OwnerCell journey={journey} />
        </TableCell>
        <TableCell sx={{ color: 'text.secondary' }} suppressHydrationWarning>
          <LastModifiedDate modifiedDate={journey.updatedAt} />
        </TableCell>
        <TableCell>
          <JourneyCardMenu
            id={journey.id}
            status={journey.status}
            slug={journey.slug}
            published={journey.publishedAt != null}
            refetch={refetch}
            journey={journey}
            hovered
            onMenuClose={() => {
              setHasOpenDialog(false)
            }}
            template={journey.template ?? false}
            setHasOpenDialog={setHasOpenDialog}
          />
        </TableCell>
      </TableRow>
      <TemplateBreakdownAnalyticsDialog
        journeyId={journey.id}
        open={breakdownDialogOpen}
        handleClose={() => setBreakdownDialogOpen(false)}
      />
    </>
  )
}

function Thumbnail({
  journey,
  isNavigating,
  isImageLoading,
  setIsImageLoading
}: {
  journey: Journey
  isNavigating: boolean
  isImageLoading: boolean
  setIsImageLoading: (loading: boolean) => void
}): ReactElement {
  return (
    <Box
      component={NextLink}
      prefetch={false}
      href={`/journeys/${journey.id}`}
      aria-label={journey.title}
      sx={{
        position: 'relative',
        display: 'block',
        width: 56,
        height: 36,
        borderRadius: 1,
        bgcolor: 'divider',
        overflow: 'hidden',
        opacity: isNavigating ? 0.5 : 1,
        pointerEvents: isNavigating ? 'none' : 'auto'
      }}
    >
      {journey.primaryImageBlock?.src != null ? (
        <>
          {isImageLoading && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{ position: 'absolute', inset: 0 }}
            />
          )}
          <Image
            data-testid="JourneyListRowImage"
            src={journey.primaryImageBlock.src}
            alt={journey.primaryImageBlock.alt ?? ''}
            fill
            style={{ objectFit: 'cover' }}
            sizes="56px"
            onLoadingComplete={() => setIsImageLoading(false)}
          />
        </>
      ) : (
        <Image
          data-testid="JourneyListRowNoImage"
          src={logoGray}
          alt=""
          width={26}
          height={26}
          style={{
            objectFit: 'contain',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
    </Box>
  )
}

function ActivityCell({
  journey,
  isTemplateCard,
  onOpenBreakdown
}: {
  journey: Journey
  isTemplateCard: boolean
  onOpenBreakdown: () => void
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  if (isTemplateCard) {
    return (
      <Stack direction="row" justifyContent="flex-end" alignItems="center">
        <TemplateAggregateAnalytics journeyId={journey.id} />
        <IconButton
          size="small"
          aria-label={t('journey breakdown analytics')}
          onClick={onOpenBreakdown}
        >
          <BarGroup3Icon fontSize="small" />
        </IconButton>
      </Stack>
    )
  }

  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      sx={{
        '& .MuiButtonBase-root': {
          minWidth: 30,
          width: 30,
          height: 30
        }
      }}
    >
      <ResponsesItem
        variant="icon-button"
        fromJourneyList={true}
        journeyId={journey.id}
      />
      <AnalyticsItem
        variant="icon-button"
        fromJourneyList={true}
        journeyId={journey.id}
      />
    </Stack>
  )
}

function OwnerCell({ journey }: { journey: Journey }): ReactElement {
  const owner = journey.userJourneys?.find(
    (userJourney) =>
      userJourney.role === UserJourneyRole.owner &&
      userJourney.user?.__typename === 'AuthenticatedUser'
  )

  if (owner?.user?.__typename !== 'AuthenticatedUser') {
    return <Box sx={{ height: 24 }} />
  }

  const ownerName = [owner.user.firstName, owner.user.lastName]
    .filter(Boolean)
    .join(' ')

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Avatar
        apiUser={owner.user}
        role={owner.role}
        sx={{ width: 24, height: 24, fontSize: 10 }}
      />
      <Typography variant="body2" color="text.secondary" noWrap>
        {ownerName}
      </Typography>
    </Stack>
  )
}

function TagChip({
  label,
  icon
}: {
  label: string
  icon?: ReactElement
}): ReactElement {
  return (
    <Chip
      size="small"
      label={label}
      icon={icon}
      sx={{
        height: 18,
        fontSize: 10.5,
        '& .MuiChip-icon': {
          ml: 0.5,
          color: 'inherit'
        }
      }}
    />
  )
}
