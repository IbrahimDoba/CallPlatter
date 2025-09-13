export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return 'Unknown Number'
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Handle Nigerian numbers (+234)
  if (cleaned.startsWith('+234')) {
    const number = cleaned.slice(4) // Remove +234
    if (number.length === 10) {
      return `+234 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
    }
  }
  
  // Handle US/Canada numbers (+1)
  if (cleaned.startsWith('+1')) {
    const number = cleaned.slice(2) // Remove +1
    if (number.length === 10) {
      return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
    }
  }
  
  // Handle UK numbers (+44)
  if (cleaned.startsWith('+44')) {
    const number = cleaned.slice(3) // Remove +44
    if (number.length === 10) {
      return `+44 ${number.slice(0, 4)} ${number.slice(4, 7)} ${number.slice(7)}`
    }
  }
  
  // Default formatting for other numbers
  if (cleaned.length > 4) {
    return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4')
  }
  
  return phone // Return original if can't format
}
