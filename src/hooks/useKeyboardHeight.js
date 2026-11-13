import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';

/**
 * Current on-screen keyboard height (0 when hidden). Bottom sheets rendered
 * in a Modal aren't resized by the keyboard on their own, so a sheet with a
 * text input pads its bottom by this to stay above it.
 *
 * Callers also use this to swap in a smaller resting padding while the
 * keyboard is up (see modalSheetKeyboardOpen-style conditionals) — without
 * LayoutAnimation here, that swap applies instantly, a beat out of sync with
 * the keyboard's own animated show/hide, which reads as a flicker/snap.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, event => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
