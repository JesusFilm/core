import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'

export function TemplateInfoPanel(): ReactElement {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}
        >
          What templates are about:
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          You can share projects created on our platform with others. This
          allows you to track the performance of every project generated from
          your template.
        </Typography>
      </Box>

      <Divider />

      {/* Accordion sections */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Accordion
          disableGutters
          elevation={0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            sx={{ px: 2.5, minHeight: 56 }}
            aria-label="toggle template types"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Template Types
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Templates can be journeys, websites, or quick-start projects.
              Each type has different configuration options and sharing
              capabilities.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Divider />

        <Accordion
          disableGutters
          elevation={0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            sx={{ px: 2.5, minHeight: 56 }}
            aria-label="toggle how to create"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              How to create
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Create a new template from scratch or duplicate an existing
              journey. Customize the content, add images, and configure settings
              before publishing.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Divider />

        <Accordion
          disableGutters
          elevation={0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            sx={{ px: 2.5, minHeight: 56 }}
            aria-label="toggle tracking and analytics"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Tracking and Analytics
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Monitor how your templates perform with detailed analytics. Track
              views, completions, and engagement across all projects created
              from your templates.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Divider />

        <Accordion
          disableGutters
          elevation={0}
          sx={{ '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ChevronDownIcon />}
            sx={{ px: 2.5, minHeight: 56 }}
            aria-label="toggle sharing and publishing"
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Sharing and Publishing
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Publish templates to the library for others to discover. Share
              directly via link or make them available to specific teams.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Divider />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          px: 2,
          py: 1,
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <IconButton size="small" aria-label="open help in new window">
          <OpenInNewIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  )
}
