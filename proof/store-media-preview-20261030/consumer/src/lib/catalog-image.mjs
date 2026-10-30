// Host-owned mapping of Commerce public media references through pinned EmDash APIs.
// The demo deliberately accepts only same-origin public-file URLs, not admin URLs,
// arbitrary image transforms, external CDNs or signed credential/query URLs.
export async function resolveCatalogImage(image, { readMedia, publicMediaUrl, siteUrl }) {
  if (!image || typeof image.id !== 'string' || !image.id || typeof image.alt !== 'string') return null;
  try {
    const result = await readMedia(image.id);
    const item = result?.success === true ? result.data?.item : null;
    if (!item || item.id !== image.id || item.status !== 'ready' || typeof item.mimeType !== 'string' || !item.mimeType.startsWith('image/') || typeof item.storageKey !== 'string' || !item.storageKey) return null;
    const raw = await publicMediaUrl(item.storageKey);
    if (typeof raw !== 'string' || !raw) return null;
    const site = new URL(siteUrl), url = new URL(raw, site);
    if (!['http:', 'https:'].includes(site.protocol) || url.origin !== site.origin || url.username || url.password || url.search || url.hash || !url.pathname.startsWith('/_emdash/api/media/file/')) return null;
    const dimension = n => Number.isSafeInteger(n) && n > 0 ? n : undefined;
    return { src: url.pathname, alt: image.alt, width: dimension(image.width), height: dimension(image.height) };
  } catch { return null; }
}
