import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { campaignImageSource } from '@core/journeys/ui/Campaign'
import X2Icon from '@core/shared/ui/icons/X2'

import { GetCampaign_campaign_blocks_CampaignHeaderBlock as CampaignHeaderBlock } from '../../../../__generated__/GetCampaign'
import { CampaignImageSlot } from '../../../../__generated__/globalTypes'
import { useCampaignHeaderLogoMutation } from '../../../libs/useCampaignHeaderLogoMutation'
import { blockLabel } from '../blockLabel'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { ImagePicker } from '../Pickers/ImagePicker'
import { useCampaignOwnedImageCommand } from '../utils/useCampaignOwnedImageCommand'

interface ChromeEditProps {
  block: CampaignHeaderBlock
  onClose?: () => void
}

/**
 * The header's Edit: the Brand Mark's logo. Shows the current logo (or that
 * the campaign title stands in), offers the image picker (upload or paste)
 * to set one, and Clear logo to go back to the title. Each is one Command
 * through `campaignImageBlockCreate` and `campaignHeaderBlockUpdate`.
 */
export function ChromeEdit({ block, onClose }: ChromeEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addOwnedImage, addStyle, error } = useCampaignOwnedImageCommand()
  const writeLogo = useCampaignHeaderLogoMutation()
  const [replacing, setReplacing] = useState(false)
  const logoBlock = campaign.blocks.find(
    (candidate) => candidate.id === block.logoBlockId
  )
  const logo = campaignImageSource(
    logoBlock?.__typename === 'CampaignImageBlock' ? logoBlock : null
  )

  function handlePick(src: string): void {
    setReplacing(false)
    addOwnedImage({
      owner: block,
      slot: CampaignImageSlot.logo,
      src,
      input: (imageId) => ({ logoBlockId: imageId }),
      previous: { logoBlockId: block.logoBlockId },
      write: writeLogo
    })
  }

  function handleClear(): void {
    addStyle({
      block,
      input: { logoBlockId: null },
      previous: { logoBlockId: block.logoBlockId },
      run: writeLogo
    })
  }

  return (
    <Stack
      spacing={4}
      sx={{ p: 6, width: 360 }}
      data-testid="CampaignChromeEdit"
      data-block-id={block.id}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">{t('Edit')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {blockLabel(t, block.__typename)}
          </Typography>
        </Box>
        {onClose != null && (
          <IconButton aria-label={t('Close')} onClick={onClose}>
            <X2Icon />
          </IconButton>
        )}
      </Stack>
      {error != null && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}
      <Stack spacing={2}>
        <Typography variant="subtitle2">{t('Logo')}</Typography>
        {logo != null ? (
          <Box
            component="img"
            src={logo.src}
            alt={logo.alt ?? ''}
            data-testid="CampaignChromeEditLogo"
            sx={{
              height: 48,
              maxWidth: '100%',
              objectFit: 'contain',
              alignSelf: 'flex-start'
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('No logo: the campaign title shows as the brand mark.')}
          </Typography>
        )}
        {logo != null && (
          <Stack direction="row" spacing={2}>
            {!replacing && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReplacing(true)}
              >
                {t('Replace logo')}
              </Button>
            )}
            <Button variant="text" size="small" onClick={handleClear}>
              {t('Clear logo')}
            </Button>
          </Stack>
        )}
        {(logo == null || replacing) && (
          <ImagePicker
            teamId={campaign.teamId}
            onPick={handlePick}
            pickLabel={t('Use as logo')}
            testId="CampaignLogoPicker"
          />
        )}
      </Stack>
    </Stack>
  )
}
