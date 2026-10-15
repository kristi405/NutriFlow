import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodBackgroundDecor } from '@/components/food-background-decor';
import { AuthEntryScreen } from './auth-entry-screen';

export function AuthFlow() {
  const theme = useTheme();

  return <LinearGradient colors={[theme.background, theme.primarySoft, theme.accentSoft]} style={styles.flex1}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <FoodBackgroundDecor />
      </View>
      <SafeAreaView style={styles.flex1}>
        <View style={styles.content}>
          <AuthEntryScreen />
        </View>
      </SafeAreaView>
    </LinearGradient>;
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: Spacing.six * 2,
    paddingHorizontal: Spacing.four,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%'
  }
});
