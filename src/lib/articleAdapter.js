/**
 * Maps a backend article (/app/articles) onto the shape the article card and
 * detail screen render. `content` is HTML produced by the admin panel's
 * rich-text editor; the screens show plain text, so it's flattened here
 * (paragraph/list structure kept, inline formatting dropped).
 */

const ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const EXCERPT_LENGTH = 140;

export function htmlToPlainText(html) {
  if (!html) return '';
  return html
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<\/\s*li\s*>/gi, '\n')
    .replace(/<\/\s*(p|div|h[1-6]|ul|ol|blockquote)\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(nbsp|amp|lt|gt|quot|#39);/g, match => ENTITIES[match])
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function excerptOf(text) {
  const firstParagraph = text.split('\n')[0];
  return firstParagraph.length > EXCERPT_LENGTH ? `${firstParagraph.slice(0, EXCERPT_LENGTH).trimEnd()}…` : firstParagraph;
}

export function adaptArticle(raw) {
  const body = htmlToPlainText(raw.content);
  return {
    id: raw.id,
    title: raw.title,
    excerpt: excerptOf(body),
    body,
    imageUrl: raw.image_url ?? null,
    publishedAt: raw.ctime ?? null,
    isFavorite: raw.isFavorite ?? false,
    tags: (raw.tags ?? []).map(({ id, name }) => ({ id, name }))
  };
}

// The API has no "article of the day" endpoint — the list is sorted by id
// (stable when the list grows) and one entry is picked deterministically from
// the date, so it stays the same all day and rotates daily.
export function pickArticleOfTheDay(articles, dateKey) {
  if (articles.length === 0) return null;
  const sorted = [...articles].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  let hash = 0;
  for (const char of dateKey) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return sorted[hash % sorted.length];
}
