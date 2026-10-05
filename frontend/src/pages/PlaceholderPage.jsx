function PlaceholderPage({ title, member, children }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
      <p className="mt-2 text-muted">Coming soon (Member {member})</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

export default PlaceholderPage
