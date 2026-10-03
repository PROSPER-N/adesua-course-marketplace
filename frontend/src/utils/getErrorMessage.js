const NO_CONNECTION =
  'Unable to connect to the server. Check your internet connection and try again.'

const MESSAGES_BY_STATUS = {
  401: 'Please log in to continue.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
}

// Turns a failed request into a sentence a person can read.
export function getErrorMessage(error) {
  // No response means the server was never reached: offline, server stopped or timed out.
  if (!error?.response) return NO_CONNECTION

  const { status, data } = error.response

  // The backend's own message is the most specific one (this includes the 429 message).
  if (typeof data?.message === 'string' && data.message.trim()) return data.message

  if (MESSAGES_BY_STATUS[status]) return MESSAGES_BY_STATUS[status]
  if (status >= 500) return 'Something went wrong on our side. Try again in a moment.'

  return 'Something went wrong. Please try again.'
}

// Turns the errors array of a 400 response into { fieldName: message }.
export function getFieldErrors(error) {
  const list = error?.response?.data?.errors
  if (!Array.isArray(list)) return {}

  const fieldErrors = {}
  for (const { field, message } of list) {
    // Keep the first message for each field.
    if (field && message && !fieldErrors[field]) fieldErrors[field] = message
  }
  return fieldErrors
}
