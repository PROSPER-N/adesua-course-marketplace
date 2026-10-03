import FormField from './FormField.jsx'

function Select({ children, ...props }) {
  return (
    <FormField as="select" {...props}>
      {children}
    </FormField>
  )
}

export default Select
