export async function fetchLoanPriorityData () {
  try {
    const response = await fetch(
      '/api/loan-priority?nationality=cambodia&visa_type=E9'
    )
    if (!response.ok) {
      throw new Error('네트워크 응답이 올바르지 않습니다.')
    }
    console.log('Response status:', response.status)
    return await response.json()
  } catch (error) {
    console.error('Error fetching loan priority records:', error)
    throw error
  }
}
