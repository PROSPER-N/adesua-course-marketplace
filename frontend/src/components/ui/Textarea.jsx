import FormField from './FormField.jsx'

function Textarea(props) {
  return <FormField as="textarea" rows={4} {...props} />
}

export default Textarea
