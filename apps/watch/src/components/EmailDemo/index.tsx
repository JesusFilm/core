import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import EmailIcon from '@mui/icons-material/Email'
import ReplayIcon from '@mui/icons-material/Replay'
import DeleteIcon from '@mui/icons-material/Delete'
import ReportIcon from '@mui/icons-material/Report'
import { ScalarLeafsRule } from 'graphql'
import { fontSize } from '@mui/system'

const EmailContainer = styled(Box)(({ theme }) => ({
  maxWidth: '800px',
  margin: '0 auto',
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  color: '#202124',
  fontFamily: "'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif"
}))

const GmailHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: '#f6f8fc',
  borderBottom: '1px solid #eceff1'
}))

const GmailLogo = styled('img')({
  height: '40px',
  marginRight: '16px'
})

export function EmailDemo() {
  return (
    <Box sx={{ backgroundColor: '#f6f8fc', minHeight: '100vh', py: 2 }}>
      <GmailHeader>
        <GmailLogo
          src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png"
          alt="Gmail"
        />
      </GmailHeader>

      <EmailContainer>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            pb: 3,
            mb: 3,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Avatar
            src="https://www.jesusfilm.org/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fminimal-logo.e2160bae.png&w=384&q=75"
            sx={{ width: 42, height: 42, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5, fontSize: '16px' }}>
              Jesus Film Videos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              to Pearl
            </Typography>
          </Box>
          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              gap: 1
            }}
          >
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <EmailIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <ReplayIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <DeleteIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: 'grey.500' }}>
              <ReportIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography
          variant="subtitle1"
          sx={{
            mb: 6,
            mx: 12,
            fontWeight: 'bold'
          }}
        >
          Your video has been viewed: Why Does Daniel Dream About Monsters? - 13
          December 2024
        </Typography>

        <Box sx={{ my: 4 }}>
          <Box
            sx={{
              mb: 3,
              mx: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '14px',
              p: 8,
              maxWidth: '80%'
            }}
          >
            <Typography variant="h6">Great News!</Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
              Vlad watched the video you shared.
            </Typography>
            <img
              src="https://cdn-std.droplr.net/files/acc_760170/MKEjsL"
              alt="Jesus Film Project"
              style={{
                maxWidth: '100%',
                aspectRatio: '2/2',
                objectFit: 'cover',
                borderRadius: '14px'
              }}
            />

            <Typography
              variant="subtitle1"
              sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}
            >
              Why Does Daniel Dream About Monsters?
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 4 }}>
              Was watched for the first time!
            </Typography>
          </Box>
          <Box
            sx={{
              mb: 3,
              mx: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: '14px',
              p: 8,
              maxWidth: '80%'
            }}
          >
            <Typography variant="h6">Now it's your turn:</Typography>
            <Stack spacing={1} sx={{ my: 3 }}>
              <Typography sx={{ fontSize: '14px' }}>
                <span style={{ fontSize: '140%' }}>🙏️</span> Take time to pray
                for Vlad
              </Typography>
              <Typography sx={{ fontSize: '14px' }}>
                <span style={{ fontSize: '140%' }}>👇</span> Share the next
                relevant video
              </Typography>
            </Stack>

            <Button
              href="https://watch-4534-jesusfilm.vercel.app/watch/share"
              target="_blank"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#F13141',
                fontSize: '16px',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'black'
                }
              }}
            >
              Next video for Vlad
            </Button>
          </Box>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              mx: 'auto',
              p: 8,
              maxWidth: '80%',
              textAlign: 'center'
            }}
          >
            Happy gospel sharing!
            <br />
            The Jesus Film Team
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={1} sx={{ color: '#5f6368', fontSize: '12px' }}>
          <Link href="#" underline="hover" color="inherit">
            Change your notification settings
          </Link>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" underline="hover" color="inherit">
              Unsubscribe
            </Link>
            <Link href="#" underline="hover" color="inherit">
              Manage preferences
            </Link>
          </Box>
        </Stack>
      </EmailContainer>
    </Box>
  )
}
