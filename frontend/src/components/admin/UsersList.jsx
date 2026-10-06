import { formatDate } from '../../utils/formatDate.js'
import { getInitials } from '../../utils/getInitials.js'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'

const ROLE_BADGES = {
  student: { label: 'Student', variant: 'neutral' },
  instructor: { label: 'Instructor', variant: 'green' },
  admin: { label: 'Admin', variant: 'gold' },
}

function Avatar({ name }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-dark"
    >
      {getInitials(name)}
    </span>
  )
}

function RoleBadge({ role }) {
  const badge = ROLE_BADGES[role] ?? { label: role, variant: 'neutral' }
  return <Badge variant={badge.variant}>{badge.label}</Badge>
}

function StatusBadge({ isActive }) {
  return isActive ? <Badge variant="green">Active</Badge> : <Badge variant="red">Deactivated</Badge>
}

function StatusAction({ user, currentUserId, pendingId, onToggleStatus }) {
  if (user._id === currentUserId) {
    return <span className="text-sm font-semibold text-muted">You</span>
  }

  const action = user.isActive ? 'Deactivate' : 'Activate'
  return (
    <Button
      loading={pendingId === user._id}
      loadingText={user.isActive ? 'Deactivating…' : 'Activating…'}
      onClick={() => onToggleStatus(user)}
      size="sm"
      variant={user.isActive ? 'danger' : 'outline'}
    >
      {action}
      <span className="sr-only"> {user.name}</span>
    </Button>
  )
}

// A table from md up; below that the same users as stacked cards.
function UsersList({ users, currentUserId, pendingId, onToggleStatus }) {
  const actionProps = { currentUserId, pendingId, onToggleStatus }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-semibold" scope="col">
                Name
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Email
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Role
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Status
              </th>
              <th className="px-4 py-3 font-semibold" scope="col">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-semibold" scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <span className="font-semibold text-ink">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge isActive={user.isActive} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <StatusAction user={user} {...actionProps} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-3 md:hidden">
        {users.map((user) => (
          <li className="rounded-xl border border-line bg-white p-4" key={user._id}>
            <div className="flex items-center gap-3">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{user.name}</p>
                <p className="truncate text-sm text-muted">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <StatusBadge isActive={user.isActive} />
              <span className="text-sm text-muted">Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="mt-4">
              <StatusAction user={user} {...actionProps} />
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

export default UsersList
