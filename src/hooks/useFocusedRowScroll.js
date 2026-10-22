import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Rows are kept this far below the top edge of the scroll view when scrolled to.
const SCROLL_MARGIN = 120;

/**
 * Keeps a focused row (e.g. an ingredient's quantity input) visible above the
 * on-screen keyboard. Android doesn't resize or auto-scroll the screen for the
 * keyboard, so once it is up the focused row is scrolled to near the top.
 *
 * iOS-only: KeyboardAvoidingView's "padding" behavior already shifts the
 * screen so the focused input clears the keyboard, so this scroll is skipped
 * there — running both at once (on slightly different timing) was producing
 * a visible double-jump, worst on screens with their own scroll-driven
 * animation (e.g. recipes/[id].js's collapsing header).
 *
 * Spread `rowProps(index)` on the row's View and the `inputProps(index)` on its TextInput.
 */
export function useFocusedRowScroll(scrollRef, keyboardHeight) {
  const rowRefs = useRef({});
  const [focusedRow, setFocusedRow] = useState(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (focusedRow === null || keyboardHeight === 0) return;
    // Wait a beat so the extra bottom padding has been laid out before scrolling.
    const timer = setTimeout(() => {
      const row = rowRefs.current[focusedRow];
      const scroll = scrollRef.current;
      const inner = scroll?.getInnerViewRef?.();
      if (!row || !inner) return;
      row.measureLayout(inner, (_x, y) => scroll.scrollTo({ y: Math.max(0, y - SCROLL_MARGIN), animated: true }), () => {});
    }, 150);
    return () => clearTimeout(timer);
  }, [focusedRow, keyboardHeight, scrollRef]);

  return {
    rowProps: index => ({ ref: node => { rowRefs.current[index] = node; } }),
    inputProps: index => ({
      onFocus: () => setFocusedRow(index),
      onBlur: () => setFocusedRow(current => current === index ? null : current)
    })
  };
}
