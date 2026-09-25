import { router } from 'expo-router';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { peopleStore } from '@/store/peopleStore';

// Reuses the onboarding steps to build a profile for another person, then
// switches to them so their (empty) day is what the user sees next.
export default function AddPersonScreen() {
  return <OnboardingFlow onCancel={() => router.back()} onComplete={profile => {
    const id = peopleStore.addMember(profile);
    peopleStore.setActive(id);
    router.back();
  }} />;
}
