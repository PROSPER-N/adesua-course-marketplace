import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.mjs'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.mjs'
import Button from './Button.jsx'

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const goToPage = (nextPage) => onPageChange(Math.min(totalPages, Math.max(1, nextPage)))

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      <Button
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        <span>Previous</span>
      </Button>
      <div className="hidden items-center gap-1 sm:flex">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <Button
            aria-current={pageNumber === page ? 'page' : undefined}
            aria-label={`Page ${pageNumber}`}
            className="min-w-9 px-2"
            key={pageNumber}
            onClick={() => goToPage(pageNumber)}
            size="sm"
            variant={pageNumber === page ? 'primary' : 'ghost'}
          >
            {pageNumber}
          </Button>
        ))}
      </div>
      <span aria-live="polite" className="text-sm text-muted sm:hidden">
        Page {page} of {totalPages}
      </span>
      <Button
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
        size="sm"
        variant="outline"
      >
        <span>Next</span>
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </nav>
  )
}

export default Pagination
