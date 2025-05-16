document.addEventListener('DOMContentLoaded', () => {
  const recordsList = document.getElementById('records-list')
  const totalRecordsElement = document.getElementById('totalRecords')

  if (!recordsList || !totalRecordsElement) {
    console.error('필요한 DOM 요소가 존재하지 않습니다.')
    return
  }

  document
    .getElementById('loanPreferenceCheck')
    .addEventListener('change', event => {
      const isChecked = event.target.checked // 체크박스 상태 확인
      const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 요소
      console.log('대출요청 체크됨: 입금액이 0으로 설정되었습니다.')
      if (isChecked) {
        depositSumElement.textContent = '0' // 입금액을 0으로 설정
        console.log('대출요청 체크됨: 입금액이 0으로 설정되었습니다.')
      } else {
        console.log('대출요청 체크 해제됨: 입금액 변경 없음.')
      }
    })

  fetchLoanPriorityData()
    .then(data => {
      console.log(data)

      if (data.length > 0) {
        recordsList.innerHTML = data
          .map(
            record => `
            <tr onclick="showDetail(${record.id})">
              <td>${record.id}</td>
              <td>${record.nationality}</td>
              <td>${record.passport_name}</td>
              <td>${record.visa_type}</td>
              <td>${record.passport_number}</td>
              <td>${
                record.phone_type == 1
                  ? 'iphone'
                  : record.phone_type == 2
                  ? 'galaxy'
                  : record.phone_type == 3
                  ? 'etc'
                  : '-'
              }</td>
              <td>${record.sim_price}</td>
              <td>${record.balance}</td>
              <td>${
                record.loan_pre_priority == 1
                  ? '우선희망'
                  : record.loan_pre_priority == 2
                  ? '희망'
                  : record.loan_pre_priority == 3
                  ? '안함'
                  : '-'
              }</td>
              <td>${record.entry_date}</td>
              <td>${record.tel_number_kor}</td>
            </tr>
          `
          )
          .join('')
        totalRecordsElement.textContent = data.length
      } else {
        recordsList.innerHTML =
          '<tr><td colspan="11">데이터가 없습니다.</td></tr>'
      }
    })
    .catch(error => {
      console.error('Error fetching loan priority records:', error)
    })
})
