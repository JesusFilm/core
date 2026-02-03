import { ReactElement } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { CustomizeFlowNextButton } from "../../CustomizeFlowNextButton";

interface MediaScreenProps {
    handleNext: () => void
}
export function MediaScreen({
    handleNext,
}: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  
  return (
    <Stack alignItems="center" sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom display={{ xs: 'none', sm: 'block' }}>
        {t('Media')}
      </Typography>
      <CustomizeFlowNextButton
        label={t('Next')}
        onClick={handleNext}
        ariaLabel={t('Next')}
      />
    </Stack>
  )
}