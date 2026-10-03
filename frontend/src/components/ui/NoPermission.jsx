import ShieldX from 'lucide-react/dist/esm/icons/shield-x.mjs'
import Button from './Button.jsx'

function NoPermission() {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center px-5 py-16 text-center">
      <ShieldX aria-hidden="true" className="size-12 text-brand" />
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">
        You don't have permission to view this page
      </h1>
      <Button className="mt-6" to="/">
        Go to the home page
      </Button>
    </section>
  )
}

export default NoPermission
