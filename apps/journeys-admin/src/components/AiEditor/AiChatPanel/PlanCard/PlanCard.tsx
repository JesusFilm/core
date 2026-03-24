import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { AiPlan, AiPlanOperation } from '../../AiEditor'

interface PlanCardProps {
  plan: AiPlan
  onConfirm?: (planId: string) => void
  onReject?: (planId: string) => void
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

export function PlanCard({
  plan,
  onConfirm,
  onReject
}: PlanCardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const badge = getStatusBadge(plan.status, plan.operations.length)
  const isFinished =
    plan.status === 'complete' ||
    plan.status === 'failed' ||
    plan.status === 'stopped'

  const [expanded, setExpanded] = useState(true)

  // Auto-collapse when plan finishes
  useEffect(() => {
    if (isFinished) setExpanded(false)
  }, [isFinished])

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
          py: 1,
          bgcolor: '#F5F5F5',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            size="small"
            sx={{
              p: 0,
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: 'text.primary', fontSize: 13 }}
          >
            {t('Execution Plan')}
          </Typography>
        </Stack>
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

      <Collapse in={expanded}>
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
                      : 'text.primary'
                }}
              >
                {operation.description}
              </Typography>
            </Stack>
          ))}
        </Box>

        {plan.status === 'pending' && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ px: 2, pb: 1.5 }}
          >
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => onConfirm?.(plan.id)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {t('Run Plan')}
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => onReject?.(plan.id)}
              sx={{ textTransform: 'none' }}
            >
              {t('Cancel')}
            </Button>
          </Stack>
        )}
      </Collapse>
    </Box>
  )
}
