import { useState } from 'react';

/**
 * Walks an ordered list of image uris — typically [thumbnail, original] — and
 * moves to the next one when the current fails to load (a missing preview
 * falls back to the original instead of leaving an empty box).
 *
 * Returns { uri, onError }: `uri` is undefined once every candidate failed (or
 * none was given), so the caller can render its own no-image state.
 * The position resets whenever the candidates change (e.g. a recycled list row).
 */
export function useImageFallback(...candidates) {
  const uris = candidates.filter((uri, index) => uri && candidates.indexOf(uri) === index);
  const key = uris.join('|');
  const [state, setState] = useState({ key, index: 0 });
  const index = state.key === key ? state.index : 0;
  return {
    uri: uris[index],
    onError: () => setState({ key, index: index + 1 })
  };
}
