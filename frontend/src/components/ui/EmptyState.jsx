function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <section className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card px-5 py-10 text-center">
      {Icon && <Icon aria-hidden="true" className="mb-3 size-9 text-muted" />}
      <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
      {message && <p className="mt-2 max-w-md text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}

export default EmptyState
