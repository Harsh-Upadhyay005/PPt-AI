const IMAGEKIT_TRANSFORM = 'w-1280,h-720'

function buildFallbackImageUrl(prompt: string): string {
  const cleaned = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const keywords = cleaned
    .split(' ')
    .filter((word) => word.length > 2)
    .slice(0, 8)
    .join(',')

  const query = encodeURIComponent(keywords || 'business,presentation')
  const sig = encodeURIComponent(cleaned.slice(0, 64) || 'presentation')

  // Stable image endpoint that works reliably in <img> tags.
  return `https://picsum.photos/seed/${query}-${sig}/1600/900`
}

function getImageKitBaseUrl(): string {
  const raw = process.env.IMAGEKIT_BASE_URL ?? process.env.IMAGEKIT_URL
  if (!raw) return ''
  return raw.replace(/\/+$/, '')
}

export function buildImageKitUrl(prompt: string): string {
  // ImageKit AI URL format is not universally enabled; default to a stable
  // public fallback unless explicitly enabled.
  if (process.env.IMAGEKIT_USE_AI !== '1') {
    return buildFallbackImageUrl(prompt)
  }

  const baseUrl = getImageKitBaseUrl()
  if (!baseUrl) {
    console.warn('IMAGEKIT_BASE_URL or IMAGEKIT_URL is not set; using fallback image URL')
    return buildFallbackImageUrl(prompt)
  }

  const normalizedPrompt = prompt
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

  const encodedPrompt = encodeURIComponent(normalizedPrompt)
  return `${baseUrl}/ik-genimg-prompt-${encodedPrompt}?tr=${IMAGEKIT_TRANSFORM}`
}

export function normalizeImageKitGeneratedUrl(url: string | null): string | null {
  if (!url) return url
  if (!url.includes('/ik-genimg-prompt-')) return url

  if (process.env.IMAGEKIT_USE_AI !== '1') {
    return null
  }

  try {
    const parsed = new URL(url)
    const marker = '/ik-genimg-prompt-'
    const markerIndex = parsed.pathname.indexOf(marker)
    if (markerIndex === -1) return url

    const promptStart = markerIndex + marker.length
    const remainder = parsed.pathname.slice(promptStart)
    const firstSlash = remainder.indexOf('/')

    if (firstSlash === -1) {
      if (!parsed.searchParams.get('tr')) {
        parsed.searchParams.set('tr', IMAGEKIT_TRANSFORM)
      }
      return parsed.toString()
    }

    const encodedPrompt = remainder.slice(0, firstSlash)
    parsed.pathname = `${parsed.pathname.slice(0, promptStart)}${encodedPrompt}`
    if (!parsed.searchParams.get('tr')) {
      parsed.searchParams.set('tr', IMAGEKIT_TRANSFORM)
    }

    return parsed.toString()
  } catch {
    return url
  }
}
