// 예시: 공통 업데이트 함수
async function updateRecordByPassport (updateData, jobGubun = 'N') {
  const response = await fetch(
    `/api/records/passport/${updateData.passport_number}?jobGubun=${jobGubun}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    }
  )
  if (!response.ok) throw new Error('Passport_number: 업데이트 실패')
  return await response.json()
}

// 일반적인 경우 id로 업데이트
async function updateRecordById (updateData, jobGubun = 'N') {
  const response = await fetch(`/api/records/id/${updateData.id}?jobGubun=N`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  })
  if (!response.ok) throw new Error('ID: 업데이트 실패')
  return await response.json()
}
