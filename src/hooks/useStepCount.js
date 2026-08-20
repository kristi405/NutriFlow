import { useEffect, useState } from 'react';
import { Pedometer } from 'expo-sensors';

/** Today's step count from the device's native pedometer, kept live via watchStepCount. */
export function useStepCount() {
  const [steps, setSteps] = useState(0);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let subscription;
    let baseline = 0;
    let cancelled = false;

    async function start() {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (cancelled) return;
      setAvailable(isAvailable);
      if (!isAvailable) return;

      const { status } = await Pedometer.getPermissionsAsync();
      let granted = status === 'granted';
      if (!granted) {
        const request = await Pedometer.requestPermissionsAsync();
        granted = request.status === 'granted';
      }
      if (!granted || cancelled) return;

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        if (!cancelled) {
          baseline = result.steps;
          setSteps(baseline);
        }
      } catch {
        // No step history yet for today (e.g. fresh install) — start from 0.
      }

      if (cancelled) return;
      subscription = Pedometer.watchStepCount(result => {
        setSteps(baseline + result.steps);
      });
    }

    start();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  return { steps, available };
}
