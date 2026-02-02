import { ReactElement } from "react";
import { CustomizationScreen } from "../../../utils/getCustomizeFlowConfig";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";

interface MediaScreenProps {
    handleNext: () => void
    handleScreenNavigation: (screen: CustomizationScreen) => void
}
export function MediaScreen({
    handleNext,
    handleScreenNavigation
}: MediaScreenProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  
  return (
    <Stack alignItems="center" sx={{ pb: 4, px: { xs: 4, sm: 18 } }}>
      <Typography variant="h4" gutterBottom display={{ xs: 'none', sm: 'block' }}>
        {t('Media')}
      </Typography>
    </Stack>
  )
}