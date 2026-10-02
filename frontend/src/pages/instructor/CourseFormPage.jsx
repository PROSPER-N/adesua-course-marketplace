import { useParams } from 'react-router'
import PlaceholderPage from '../PlaceholderPage.jsx'

function CourseFormPage() {
  const { id } = useParams()
  return <PlaceholderPage member="B" title={id ? 'Edit course' : 'Create a course'} />
}

export default CourseFormPage
