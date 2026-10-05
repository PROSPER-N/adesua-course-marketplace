// YouTube video IDs are 11 letters, numbers, dashes or underscores.
const VIDEO_ID = /^[\w-]{11}$/

// Turns a YouTube watch, youtu.be or embed link into the address an iframe can play:
// "https://youtu.be/jNQXAC9IVRw" -> "https://www.youtube.com/embed/jNQXAC9IVRw".
// Returns null for anything else, so the page can link to it instead.
export function youtubeEmbedUrl(link) {
  let url
  try {
    url = new URL(link)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^(www|m)\./, '')
  let id = null
  if (host === 'youtu.be') {
    id = url.pathname.slice(1)
  } else if (host === 'youtube.com' && url.pathname === '/watch') {
    id = url.searchParams.get('v')
  } else if (host === 'youtube.com' && url.pathname.startsWith('/embed/')) {
    id = url.pathname.slice('/embed/'.length)
  }

  return id && VIDEO_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null
}
