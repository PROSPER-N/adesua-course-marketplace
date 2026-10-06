import { Route, Routes } from 'react-router'
import CourseDetailPage from './pages/public/CourseDetailPage.jsx'
import CoursesPage from './pages/public/CoursesPage.jsx'
import AboutPage from './pages/public/AboutPage.jsx'
import HomePage from './pages/public/HomePage.jsx'
import CartPage from './pages/public/CartPage.jsx'
import LoginPage from './pages/public/LoginPage.jsx'
import RegisterPage from './pages/public/RegisterPage.jsx'
import CheckoutPage from './pages/student/CheckoutPage.jsx'
import LessonPlayerPage from './pages/student/LessonPlayerPage.jsx'
import MyLearningPage from './pages/student/MyLearningPage.jsx'
import InstructorDashboardPage from './pages/instructor/InstructorDashboardPage.jsx'
import CourseFormPage from './pages/instructor/CourseFormPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ComponentsPage from './pages/dev/ComponentsPage.jsx'
import GuestRoute from './routes/GuestRoute.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import RoleRoute from './routes/RoleRoute.jsx'
import MainLayout from './components/layout/MainLayout.jsx'
import LearnLayout from './components/layout/LearnLayout.jsx'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />} path="/">
        <Route element={<HomePage />} index />
        <Route element={<CoursesPage />} path="courses" />
        <Route element={<CourseDetailPage />} path="courses/:id" />
        <Route element={<CartPage />} path="cart" />
        <Route element={<AboutPage />} path="about" />

        <Route element={<GuestRoute />}>
          <Route element={<LoginPage />} path="login" />
          <Route element={<RegisterPage />} path="register" />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute roles={['student']} />}>
            <Route element={<CheckoutPage />} path="checkout/:courseId" />
            <Route element={<MyLearningPage />} path="my-learning" />
          </Route>

          <Route element={<RoleRoute roles={['instructor']} />}>
            <Route element={<InstructorDashboardPage />} path="instructor" />
            <Route element={<CourseFormPage />} path="instructor/courses/new" />
            <Route element={<CourseFormPage />} path="instructor/courses/:id/edit" />
          </Route>

          <Route element={<RoleRoute roles={['admin']} />}>
            <Route element={<AdminDashboardPage />} path="admin" />
          </Route>
        </Route>

        {import.meta.env.DEV && <Route element={<ComponentsPage />} path="dev/components" />}
        <Route element={<NotFoundPage />} path="*" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<LearnLayout />}>
          <Route element={<LessonPlayerPage />} path="/learn/:courseId/:lessonId" />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
