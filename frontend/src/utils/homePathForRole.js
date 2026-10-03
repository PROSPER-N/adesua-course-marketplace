const HOME_PATHS = {
  student: '/my-learning',
  instructor: '/instructor',
  admin: '/admin',
}

export function homePathForRole(role) {
  return HOME_PATHS[role] ?? '/'
}
