import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
export default function AppTabs() {
  const { t } = useTranslation();
  return <Tabs>
      <TabSlot style={{
      height: '100%'
    }} />
      <TabTrigger name="profile" href="/profile" />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>{t('tabs.home')}</TabButton>
          </TabTrigger>
          <TabTrigger name="recipes" href="/recipes" asChild>
            <TabButton>{t('tabs.recipes')}</TabButton>
          </TabTrigger>
          <TabTrigger name="meal-plan" href="/meal-plan" asChild>
            <TabButton>{t('tabs.mealPlan')}</TabButton>
          </TabTrigger>
          <TabTrigger name="ai-analysis" href="/ai-analysis" asChild>
            <TabButton>{t('tabs.aiAnalysis')}</TabButton>
          </TabTrigger>
          <TabTrigger name="progress" href="/progress" asChild>
            <TabButton>{t('tabs.progress')}</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>;
}
export function TabButton({
  children,
  isFocused,
  ...props
}) {
  return <Pressable {...props} style={({
    pressed
  }) => pressed && styles.pressed}>
      <ThemedView type={isFocused ? 'backgroundSelected' : 'backgroundElement'} style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>;
}
export function CustomTabList(props) {
  return <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        <ThemedText type="smallBold" themeColor="primary" style={styles.brandText}>
          NutriFlow
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>;
}
const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth
  },
  brandText: {
    marginRight: 'auto'
  },
  pressed: {
    opacity: 0.7
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three
  }
});
