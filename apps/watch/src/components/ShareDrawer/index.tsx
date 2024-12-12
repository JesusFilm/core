import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonIcon from '@mui/icons-material/Person'
import LinkIcon from '@mui/icons-material/Link'
import AddIcon from '@mui/icons-material/Add'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import StepContent from '@mui/material/StepContent'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'
import { useState } from 'react'

interface Persona {
  id: string
  name: string
  type: 'you' | 'chat' | 'email' | 'channel'
  avatarSrc: string
  unread: boolean
}

interface ShareDrawerProps {
  open: boolean
  onClose: () => void
  activePersona?: Persona
  initialMessage?: string
}

const shareCategories = [
  { id: 'anxiety', label: 'Anxiety', selected: true },
  { id: 'hope', label: 'Hope', selected: true },
  { id: 'agnostic', label: 'Agnostic', selected: true },
  { id: 'salvation', label: 'Salvation', selected: false },
  { id: 'finances', label: 'Finances', selected: false },
  { id: 'romance', label: 'Romance', selected: false },
  { id: 'anger', label: 'Anger', selected: false },
  { id: 'depression', label: 'Depression', selected: false },
  { id: 'success', label: 'Success', selected: false },
  { id: 'loss', label: 'Loss', selected: false }
]

export function ShareDrawer({
  open,
  onClose,
  activePersona,
  initialMessage
}: ShareDrawerProps) {
  const [categories, setCategories] = useState(shareCategories)
  const [linkCopied, setLinkCopied] = useState(false)
  const [messageCopied, setMessageCopied] = useState(false)
  const [activeStep, setActiveStep] = useState(activePersona ? 2 : 0)

  const handleCopyToClipboard = async (
    text: string,
    type: 'link' | 'message'
  ) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use clipboard API when available
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand('copy')
        } catch (err) {
          console.error('Failed to copy text: ', err)
        }

        document.body.removeChild(textArea)
      }

      // Update the copied state
      if (type === 'link') {
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
      } else {
        setMessageCopied(true)
        setTimeout(() => setMessageCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, selected: !cat.selected } : cat
      )
    )
  }

  const steps = [
    {
      label: 'Notifications',
      icon: <NotificationsIcon />,
      description: 'Get notified when someone engages with your shared content.'
    },
    {
      label: 'Personalization',
      icon: <PersonIcon />,
      description:
        'Content that matters to your audience is the only content that works.'
    },
    {
      label: 'Link & Message',
      icon: <LinkIcon />,
      description: 'Get your shareable link and customize your message.'
    }
  ]

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex)
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '440px',
          height: '95vh',
          //   maxHeight: '95vh',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          marginLeft: 'auto',
          marginRight: 'auto',
          bottom: 0,
          pt: 4,
          //   height: '100%',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
          boxShadow: '0px -2px 20px rgba(0,0,0,0.1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '36px',
            height: '4px',
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: '2px'
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onClose} sx={{ mr: 2 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6">Share</Typography>
      </Box>

      <Box sx={{ flex: 1, overflowX: 'auto', position: 'relative', pl: 6 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                onClick={() => handleStepClick(index)}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  },
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                StepIconComponent={() => (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor:
                        index === activeStep
                          ? 'primary.main'
                          : 'action.selected',
                      color: index === activeStep ? 'white' : 'text.secondary'
                    }}
                  >
                    {step.icon}
                  </Box>
                )}
              >
                {step.label}
              </StepLabel>
              <StepContent sx={{ px: 7 }}>
                <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                  {step.description}
                </Typography>

                {index === 0 && (
                  <Box>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Email Address"
                      type="email"
                      sx={{ my: 3 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton edge="end" onClick={() => handleNext()}>
                              <CheckIcon color="success" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Stack spacing={1}>
                        {[
                          'Get email when shared video played',
                          'Inspiration with the next video to share',
                          'No spam. No ads. Easy to unsubscribe'
                        ].map((text) => (
                          <Box
                            key={text}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CheckIcon color="success" sx={{ fontSize: 20 }} />
                            <Typography variant="body2">{text}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                )}

                {index === 1 && (
                  <Box>
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 4,
                          position: 'relative',
                          backgroundColor: 'rgba(0,0,0, 0.07)',
                          borderRadius: '16px',
                          padding: '16px',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-10px',
                            left: '20%',
                            ml: '-10px',
                            width: 0,
                            height: 0,
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderTop: '10px solid rgba(0,0,0,0.07)'
                          }
                        }}
                      >
                        <Typography
                          variant="h3"
                          color="text.primary"
                          sx={{ fontSize: '1.7rem', px: 1, mr: 2 }}
                        >
                          👍&nbsp;👎
                        </Typography>
                        <Stack direction="column" spacing={0.5}>
                          <Typography variant="body2" color="text.primary">
                            Customize recommended follow-up content
                          </Typography>
                        </Stack>
                      </Box>

                      <Box sx={{ flex: 1, overflow: 'auto', mb: 3 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ mt: 2, fontWeight: 600 }}
                          >
                            Recommendations
                          </Typography>
                          <Button
                            variant="text"
                            color="primary"
                            size="small"
                            sx={{
                              fontSize: '13px',
                              fontWeight: 400,
                              p: 2,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em'
                            }}
                          >
                            See All
                          </Button>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {categories.map((category) => (
                          <Chip
                            key={category.id}
                            label={category.label}
                            variant={category.selected ? 'filled' : 'outlined'}
                            onClick={() => handleCategoryToggle(category.id)}
                            icon={
                              category.selected ? <CheckIcon /> : <AddIcon />
                            }
                            sx={{
                              m: 0.5,
                              border: '2px solid',
                              borderColor: 'rgba(0,0,0,0.1)',
                              '&.MuiChip-filled': {
                                borderColor: 'transparent'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                )}

                {index === 2 && (
                  <Box sx={{ mb: 3, pr: 6 }}>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Name"
                        helperText="We use it when sending you notifications"
                        variant="outlined"
                        sx={{ my: 3 }}
                      />
                      <TextField
                        fullWidth
                        label="Link to Video"
                        value="https://watch-4534-jesusfilm.vercel.app/watch/new"
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  handleCopyToClipboard(
                                    'https://watch-4534-jesusfilm.vercel.app/watch/new',
                                    'link'
                                  )
                                }
                                edge="end"
                              >
                                {linkCopied ? (
                                  <CheckIcon sx={{ color: 'success.main' }} />
                                ) : (
                                  <ContentCopyIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        sx={{ mt: 3, mb: 6 }}
                      />

                      <TextField
                        fullWidth
                        label="Text Message"
                        multiline
                        rows={4}
                        defaultValue={
                          initialMessage || 'Check out this amazing video!'
                        }
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  handleCopyToClipboard(
                                    initialMessage ||
                                      'Check out this amazing video!',
                                    'message'
                                  )
                                }
                                edge="end"
                              >
                                {messageCopied ? (
                                  <CheckIcon sx={{ color: 'success.main' }} />
                                ) : (
                                  <ContentCopyIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Reset
            </Button>
          </Paper>
        )}
      </Box>
      <Box
        sx={{
          height: '60px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: 1,
          borderColor: 'divider',
          py: 3,
          px: 6,
          mt: 2
        }}
      >
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? onClose : handleNext}
          sx={{
            color: 'white'
          }}
        >
          {activeStep === steps.length - 1 ? 'Done' : 'Next'}
        </Button>
      </Box>
    </Drawer>
  )
}
