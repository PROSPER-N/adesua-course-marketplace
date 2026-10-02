import { Outlet } from 'react-router'

function LearnLayout() {
  return (
    <main className="min-h-screen" id="lesson-content">
      <Outlet />
    </main>
  )
}

export default LearnLayout
