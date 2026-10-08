import { useState } from 'react'

const categoryStyles = {
  'web-development': { background: '#1E6B4A', accent: '#F4B63F', pattern: 'stripes' },
  programming: { background: '#23395B', accent: '#9CC3E6', pattern: 'dots' },
  business: { background: '#7A3B2E', accent: '#F3C79A', pattern: 'grid' },
  design: { background: '#5B3A7A', accent: '#E6BDF2', pattern: 'rings' },
  marketing: { background: '#0F6E7A', accent: '#A8E6DA', pattern: 'zigzag' },
  photography: { background: '#3F5129', accent: '#DCE89C', pattern: 'checks' },
  'personal-growth': { background: '#9A5E16', accent: '#FCE3B0', pattern: 'crosshatch' },
}

function CourseCover({ title = '', category, thumbnailUrl, className = '' }) {
  // The photo that failed to load, so a broken link shows the pattern and a new link is tried again.
  const [failedUrl, setFailedUrl] = useState('')

  if (thumbnailUrl && thumbnailUrl !== failedUrl) {
    // The title is always shown next to the cover, so the photo is decorative. width and height
    // reserve its 16:10 space before it loads.
    return (
      <img
        alt=""
        className={`aspect-[16/10] w-full rounded-xl object-cover ${className}`}
        decoding="async"
        height={500}
        loading="lazy"
        onError={() => setFailedUrl(thumbnailUrl)}
        src={thumbnailUrl}
        width={800}
      />
    )
  }

  const style = categoryStyles[category?.slug] ?? {
    background: '#123F2C',
    accent: '#F4B63F',
    pattern: 'stripes',
  }
  const firstWord = title.trim().split(/\s+/)[0] ?? ''
  // The word can use 48% of the cover, so long words get a smaller size to fit whole.
  // A letter is about 0.6em wide, and 1cqi is 1% of the cover's width.
  const wordFit = `${(48 / (0.6 * Math.max(firstWord.length, 1))).toFixed(2)}cqi`

  return (
    <div
      aria-label={title ? `${title} course cover` : 'Course cover'}
      className={`relative isolate aspect-[16/10] w-full overflow-hidden rounded-xl p-4 [container-type:inline-size] ${className}`}
      role="img"
      style={{
        '--cover-background': style.background,
        '--cover-accent': style.accent,
        '--cover-pattern-color': `color-mix(in srgb, ${style.accent} 42%, transparent)`,
        backgroundColor: 'var(--cover-background)',
      }}
    >
      <div
        aria-hidden="true"
        className={`course-cover-pattern course-cover-pattern--${style.pattern}`}
      />
      <span className="course-cover-category relative z-10 max-w-[45%] truncate text-xs font-semibold text-white">
        {category?.name ?? 'Course'}
      </span>
      <span
        className="absolute bottom-3 left-4 z-10 max-w-[48%] truncate font-display text-[length:clamp(0.75rem,var(--word-fit),1.875rem)] font-extrabold leading-none text-[var(--cover-accent)] sm:text-[length:clamp(0.75rem,var(--word-fit),2.25rem)]"
        style={{ '--word-fit': wordFit }}
      >
        {firstWord}
      </span>
    </div>
  )
}

export default CourseCover
