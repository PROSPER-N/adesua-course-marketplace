import { Receipt } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getMyOrders } from '../../api/orders.js'
import { useCurrency } from '../../context/CurrencyContext.jsx'
import { formatDate } from '../../utils/formatDate.js'
import { getErrorMessage } from '../../utils/getErrorMessage.js'
import { paymentMethodLabel } from '../../utils/paymentMethods.js'
import Badge from '../ui/Badge.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import ErrorMessage from '../ui/ErrorMessage.jsx'
import SkeletonRow from '../ui/SkeletonRow.jsx'

const STATUS_BADGES = {
paid: { label: 'Paid', variant: 'green' },
pending: { label: 'Pending', variant: 'gold' },
failed: { label: 'Failed', variant: 'red' },
}

function StatusBadge({ status }) {
const badge = STATUS_BADGES[status] ?? { label: status, variant: 'neutral' }
return <Badge variant={badge.variant}>{badge.label}</Badge>
}

// The day it was paid, or the day checkout started for an order that wasn't paid.
function orderDate(order) {
return formatDate(order.paidAt ?? order.createdAt)
}

// A pending order's course can be deleted later, because it has no students yet.
function courseTitle(order) {
return order.course?.title ?? 'Course no longer available'
}

// A table from md up; below that the same orders as stacked cards.
function OrdersList({ orders }) {
// Orders are saved in US dollars, the amount checkout charged, so they show that amount
// whatever display currency is chosen.
const { formatBaseAmount } = useCurrency()

return (
<> <div className="hidden overflow-x-auto rounded-xl border border-line bg-card md:block"> <table className="w-full text-left text-sm"> <thead className="border-b border-line bg-surface text-xs tracking-wide text-muted uppercase"> <tr> <th className="px-4 py-3 font-semibold" scope="col">
Date </th> <th className="px-4 py-3 font-semibold" scope="col">
Course </th> <th className="px-4 py-3 font-semibold" scope="col">
Reference </th> <th className="px-4 py-3 font-semibold" scope="col">
Payment </th> <th className="px-4 py-3 text-right font-semibold" scope="col">
Amount </th> <th className="px-4 py-3 font-semibold" scope="col">
Status </th> </tr> </thead> <tbody className="divide-y divide-line">
{orders.map((order) => ( <tr key={order._id}> <td className="px-4 py-3 whitespace-nowrap text-muted">{orderDate(order)}</td> <td className="px-4 py-3 font-semibold text-ink">{courseTitle(order)}</td> <td className="px-4 py-3 font-mono whitespace-nowrap text-ink">
{order.reference} </td> <td className="px-4 py-3 whitespace-nowrap text-muted">
{paymentMethodLabel(order.paymentMethod)} </td> <td className="px-4 py-3 text-right whitespace-nowrap font-semibold text-ink">
{formatBaseAmount(order.amount)} </td> <td className="px-4 py-3"> <StatusBadge status={order.status} /> </td> </tr>
))} </tbody> </table> </div>

  <ul className="grid gap-3 md:hidden">
    {orders.map((order) => (
      <li className="rounded-xl border border-line bg-card p-4" key={order._id}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-ink">{courseTitle(order)}</p>
          <p className="font-semibold whitespace-nowrap text-ink">
            {formatBaseAmount(order.amount)}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">
          {orderDate(order)} Â· {paymentMethodLabel(order.paymentMethod)}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-sm text-ink">{order.reference}</span>
          <StatusBadge status={order.status} />
        </div>
      </li>
    ))}
  </ul>
</>

)
}

function PurchaseHistory() {
// A result remembers the attempt it answers, so the list loads until the latest attempt has one.
const [attempt, setAttempt] = useState(0)
const [result, setResult] = useState({ attempt: -1, orders: null, error: null })
const loading = result.attempt !== attempt

useEffect(() => {
let ignore = false

getMyOrders()
  .then((orders) => {
    if (!ignore) setResult({ attempt, orders, error: null })
  })
  .catch((error) => {
    if (!ignore) setResult({ attempt, orders: null, error })
  })

return () => {
  ignore = true
}

}, [attempt])

let content

if (loading) {
content = ( <div className="rounded-xl border border-line bg-card px-4">
{Array.from({ length: 3 }, (_, index) => ( <SkeletonRow columns={5} key={index} />
))} </div>
)
} else if (result.error) {
content = (
<ErrorMessage
message={getErrorMessage(result.error)}
onRetry={() => setAttempt((current) => current + 1)}
title="Couldn't load your purchases"
/>
)
} else if (result.orders.length === 0) {
content = ( <EmptyState
     icon={Receipt}
     message="Paid courses you buy show up here, with their order reference."
     title="No purchases yet"
   />
)
} else {
content = <OrdersList orders={result.orders} />
}

return ( <section aria-labelledby="purchase-history-heading"> <h2 className="font-display text-2xl font-bold text-ink" id="purchase-history-heading">
Purchase history </h2> <div className="mt-4">{content}</div> </section>
)
}

export default PurchaseHistory
