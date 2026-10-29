import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { campaignImageSource } from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_blocks_CampaignHeaderBlock as CampaignHeaderBlock } from '../../../../__generated__/GetCampaign'
import { CampaignImageSlot } from '../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { CommandError } from '../CommandError'
import { ImagePicker } from '../Pickers/ImagePicker'
import { ReplaceableMedia } from '../ReplaceableMedia'
import { useCampaignOwnedImageCommand } from '../utils/useCampaignOwnedImageCommand'

interface ChromeSettingsProps {
  block: CampaignHeaderBlock
}

/**
 * The header's Settings: the Brand Mark's logo. Shows the current logo (or that
 * the campaign title stands in), offers the image picker (upload or paste)
 * to set one, and Clear logo to go back to the title. Each is one Command
 * through `campaignImageBlockCreate` and `campaignHeaderBlockUpdate`.
 */
export function ChromeSettings({ block }: ChromeSettingsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign } = useCampaignEditor()
  const { addOwnedImage, addFields, error } = useCampaignOwnedImageCommand()
  const logoBlock = campaign.blocks.find(
    (candidate) => candidate.id === block.logoBlockId
  )
  const logo = campaignImageSource(
    logoBlock?.__typename === 'CampaignImageBlock' ? logoBlock : null
  )

  function handlePick(src: string): void {
    addOwnedImage({
      owner: block,
      slot: CampaignImageSlot.logo,
      src,
      input: (imageId) => ({ logoBlockId: imageId }),
      imageIdOf: (fields) => fields.logoBlockId
    })
  }

  function handleClear(): void {
    addFields(block, { logoBlockId: null })
  }

  return (
    <Stack
      spacing={4}
      data-testid="CampaignChromeEdit"
      data-block-id={block.id}
    >
      <CommandError error={error} />
      <ReplaceableMedia
        label={t('Logo')}
        preview={
          logo == null ? undefined : (
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
          )
        }
        emptyNote={t('No logo: the campaign title shows as the brand mark.')}
        replaceLabel={t('Replace logo')}
        removeLabel={t('Clear logo')}
        onRemove={handleClear}
        onPick={handlePick}
        renderPicker={(onPick) => (
          <ImagePicker
            teamId={campaign.teamId}
            onPick={onPick}
            pickLabel={t('Use as logo')}
            testId="CampaignLogoPicker"
          />
        )}
      />
    </Stack>
  )
}
