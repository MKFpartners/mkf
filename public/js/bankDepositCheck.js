// Import from Deposit Check Button Click Event
document.getElementById('bankDepositButton').addEventListener('click', () => {
  const password = prompt('암호를 입력하십시오:')
  if (password === null) {
    // 사용자가 Cancel을 눌렀을 경우
    alert('작업이 취소되었습니다.')
    return
  }
  if (password !== '2233') {
    alert('잘못된 암호입니다. 작업이 취소되었습니다.')
    return
  }
  const fileInput = document.getElementById('bankDepositInput')
  if (fileInput) {
    fileInput.click()
  } else {
    console.error('파일 입력 요소를 찾을 수 없습니다.')
  }
})

// File Selection Event
document
  .getElementById('bankDepositInput')
  .addEventListener('change', async event => {
    const file = event.target.files[0]

    if (!file) {
      alert('파일이 선택되지 않았습니다.')
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = async e => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

          // 26번째 행(0-based 25)이 헤더, 27번째 행부터 데이터
          const headerRow = rows[25]
          const dataRows = rows.slice(26)

          const filteredRows = []
          for (const rowArr of dataRows) {
            const rowObj = {}
            headerRow.forEach((col, idx) => {
              rowObj[col] = rowArr[idx]
            })
            // Transaction Date에 'Total'이 있으면 프로그램 종료
            if (
              rowObj['Transaction Date'] &&
              rowObj['Transaction Date'].toString().includes('Total')
            ) {
              console.log('Total 행을 만나 프로그램을 종료합니다.')
              break
            }
            filteredRows.push(rowObj)
          }

          const updates = filteredRows.map(row => {
            const senderOrReceiver = row['Sender']
            const depositAmount = row['Money In']
            const transactionDate = row['Transaction Date']
            const branch = 'ABA Bank'
            return `
            SELECT update_deposit_mkf (
                '${senderOrReceiver}',
                 ${depositAmount},
                '${transactionDate}',
                '${branch}'
            );
            `
          })
          console.log('Generated SQL Updates:', updates.join('\n'))
          await executeUpdates(updates)
        } catch (error) {
          console.error('엑셀 파일 처리 중 오류:', error)
          alert('엑셀 파일을 처리하는 중 오류가 발생했습니다.')
        }
      }

      reader.onerror = error => {
        console.error('FileReader 오류:', error)
        alert('파일을 읽는 중 오류가 발생했습니다.')
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('파일 처리 중 오류:', error)
      alert('파일 처리 중 오류가 발생했습니다.')
    }
  })

async function executeUpdates (updates) {
  try {
    const response = await fetch('http://localhost:3000/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queries: updates })
    })

    if (!response.ok) {
      console.error('서버 응답 오류:', response.status, response.statusText)
      alert(`서버 오류: ${response.statusText}`)
      return
    }
    const result = await response.json()
    showResultModal(result)

    // const message = await response.text()
    // alert(message)
  } catch (error) {
    console.error('Error executing updates:', error)
    alert('서버와의 통신 중 오류가 발생했습니다.')
  }
}
function showResultModal (result) {
  alert(
    `결과: ${result.result}\n` +
      `mkf_master 수정 건수: ${result.mkf_master_count}\n` +
      `error_table 입력 건수: ${result.error_table_count}\n` +
      (result.error_count > 0 ? `에러 건수: ${result.error_count}` : '')
  )
}
