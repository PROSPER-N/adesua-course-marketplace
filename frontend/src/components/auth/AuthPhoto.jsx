const PHOTOS = {
  learner: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
  instructor: 'https://images.pexels.com/photos/36731347/pexels-photo-36731347.jpeg',
}

function photoUrl(photo, width) {
  return `${PHOTOS[photo]}?auto=compress&cs=tinysrgb&w=${width}`
}

function AuthPhoto({ line, photo = 'learner' }) {
  return (
    <aside className="relative isolate flex min-h-28 items-center overflow-hidden bg-night px-6 py-5 md:min-h-full md:px-10 lg:px-14">
      <img
        alt=""
        className="absolute inset-0 -z-20 size-full object-cover"
        decoding="async"
        fetchPriority="high"
        sizes="(min-width: 768px) 50vw, 100vw"
        src={photoUrl(photo, 1600)}
        srcSet={`${photoUrl(photo, 800)} 800w, ${photoUrl(photo, 1600)} 1600w`}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-night/75" />
      <p className="relative max-w-xl font-serif text-title font-semibold text-white md:text-headline">
        {line}
      </p>
    </aside>
  )
}

export default AuthPhoto
