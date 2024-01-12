import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MuiAccordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface AccordionProps {
  icon: ReactElement
  name?: string
  value: string
  description?: string
  expanded?: boolean
  onClick?: () => void
  testId?: string
  children: ReactNode
}

export function Accordion({
  icon,
  name,
  value,
  description,
  expanded,
  onClick,
  testId,
  children
}: AccordionProps): ReactElement {
  const handleClick = (): void => {
    onClick?.()
  }

  // need accordian details content
  // need accordianSummary content

  return (
    <Box
      // sx={{
      //   maxWidth: 150
      // }}
      onMouseDown={(e) => e.preventDefault()}
      data-testid={`JourneysAdminButton${testId ?? ''}`}
    >
      {/* <MuiCard
        variant="outlined"
        sx={{
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottom: 0
        }}
      >
        <CardActionArea onClick={handleClick} sx={{ minHeight: 60 }}>
          <CardContent sx={{ py: 2, px: 4 }}>
            <Stack spacing={3} alignItems="center" direction="row">
              {icon}
              <Box sx={{ maxWidth: 92, overflow: 'hidden' }}>
                {name != null && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {name}
                  </Typography>
                )}
                <Typography noWrap>{value !== '' ? value : 'None'}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </MuiCard>
      <Divider
        color="primary"
        sx={{
          transition: '0.2s border-color ease-out',
          borderBottomWidth: 2,
          borderColor: (theme) =>
            expanded === true
              ? theme.palette.primary.main
              : theme.palette.divider
        }}
      />
      <Box sx={{ height: 24 }}>
        {description != null && (
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            noWrap
            component="div"
            sx={{ pt: 1 }}
          >
            {description}
          </Typography>
        )}
      </Box> */}
      <MuiAccordion expanded={expanded} onChange={handleClick}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        >
          {/* <Typography>{name}</Typography> */}
          <Stack spacing={3} alignItems="center" direction="row">
            {icon}
            <Box sx={{ maxWidth: 92, overflow: 'hidden' }}>
              {name != null && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {name}
                </Typography>
              )}
              <Typography noWrap>{value !== '' ? value : 'None'}</Typography>
            </Box>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>{children}</AccordionDetails>
      </MuiAccordion>
    </Box>
  )
}
