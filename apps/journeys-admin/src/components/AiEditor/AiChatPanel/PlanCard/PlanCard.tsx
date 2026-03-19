import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { AiPlan, AiPlanOperation } from '../../AiEditor'

interface PlanCardProps {
  plan: AiPlan
}

type PlanStatus = AiPlan['status']

function getStatusBadge(
  status: PlanStatus,
  operationCount: number
): { label: string; color: string; bgcolor: string } {
  switch (status) {
    case 'pending':
      return {
        label: `${operationCount} ops`,
        color: '#F0720C',
        bgcolor: '#FFF3E6'
      }
    case 'running':
      return { label: 'Running', color: '#C52D3A', bgcolor: '#FDECEE' }
    case 'complete':
      return { label: 'Complete', color: '#3AA74A', bgcolor: '#EAF7EC' }
    case 'failed':
      return { label: 'Failed', color: '#B62D1C', bgcolor: '#FDECEE' }
    case 'stopped':
      return { label: 'Stopped', color: '#F0720C', bgcolor: '#FFF3E6' }
  }
}

function OperationStatusIcon({
  status
}: {
  status: AiPlanOperation['status']
}): ReactElement {
  switch (status) {
    case 'pending':
      return (
        <RadioButtonUncheckedIcon
          sx={{ fontSize: 16, color: 'text.secondary' }}
        />
      )
    case 'running':
      return <CircularProgress size={16} sx={{ color: 'primary.main' }} />
    case 'done':
      return (
        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
      )
    case 'failed':
      return <CancelIcon sx={{ fontSize: 16, color: 'error.main' }} />
  }
}

export function PlanCard({ plan }: PlanCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const badge = getStatusBadge(plan.status, plan.operations.length)

  return (
    <Box
      data-testid="PlanCard"
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: '#F5F5F5'
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          {t('Execution Plan')}
        </Typography>
        <Chip
          label={badge.label}
          size="small"
          sx={{
            height: 22,
            fontSize: 12,
            fontWeight: 600,
            color: badge.color,
            bgcolor: badge.bgcolor,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Stack>

      <Box sx={{ px: 2, py: 1.5 }}>
        {plan.operations.map((operation) => (
          <Stack
            key={operation.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ py: 0.75 }}
          >
            <OperationStatusIcon status={operation.status} />
            <Typography
              variant="body2"
              sx={{
                color:
                  operation.status === 'done'
                    ? 'text.secondary'
                    : 'text.primary',
                textDecoration:
                  operation.status === 'done' ? 'none' : 'none'
              }}
            >
              {operation.description}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  )
}
