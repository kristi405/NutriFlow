import { observer } from 'mobx-react-lite';
import { TermsContent } from '@/components/terms-content';
import { ScreenScrollView } from '@/components/ui/screen-scroll-view';
import { Spacing } from '@/constants/theme';

function PrivacyPolicyScreen() {
  return <ScreenScrollView gap={Spacing.three} horizontalPadding={20}>
      <TermsContent />
    </ScreenScrollView>;
}

export default observer(PrivacyPolicyScreen);
