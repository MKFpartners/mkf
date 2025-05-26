// Import from Excel Button Click Event
document.getElementById('excelInputButton').addEventListener('click', () => {
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
  const fileInput = document.getElementById('excelFileInput')
  if (fileInput) {
    fileInput.click() // 사용자 상호작용 내에서 파일 선택 대화 상자 열기
  } else {
    console.error('파일 입력 요소를 찾을 수 없습니다.')
  }
})

// File Selection Event
document
  .getElementById('excelFileInput')
  .addEventListener('change', async event => {
    const file = event.target.files[0]
    if (!file) {
      alert('파일이 선택되지 않았습니다.')
      return
    }
    alert('파일이 선택되었습니다. 처리 중입니다...')
    try {
      const reader = new FileReader()
      reader.onload = async e => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet)

          const queries = rows.map(row => {
            const phoneType =
              row['phone_type-iphone'] === 'true'
                ? 1
                : row['phone_type-galaxy'] === 'true'
                ? 2
                : row['phone_type-etc'] === 'true'
                ? 3
                : 0
            const loan_pre_priority =
              'loan_pre_priority-Yes' in row
                ? row['loan_pre_priority-Yes'] === 'true'
                  ? 1
                  : 2
                : 3
            const visaType =
              loan_pre_priority === 1 || loan_pre_priority === 2
                ? 'E9'
                : row['visa_type-E9'] === 'true'
                ? 'E9'
                : 'E8'

            const commit_date = new Date().toISOString()
            console.log('excelRegist.js commit_date=', commit_date)
            //return `
            // insert into mkf_master (
            //     format_name, commit_Id, commit_name, commit_type, commit_status,
            //     signature_order, sender_name, sender_email, sent_date, completion_date,
            //     additional_information, participant_name, participant_email, participant_mobile_phone,
            //     entry_date, loan_pre_priority, passport_name, passport_number, phone_type, tel_number, visa_type,commit_date
            // ) VALUES (
            return `
            select insert_into_mkf_master
     ( '${row['서식명']}', '${row['계약ID']}', '${row['계약명']}', '${row['계약종류']}', '${row['계약상태']}',
      '${row['서명순서']}', '${row['발송자명']}', '${row['발송자 이메일']}', '${row['발송일']}', '${row['완료일']}',
      '${row['추가정보']}', '${row['참여자명']}', '${row['참여자 이메일']}', '${row['참여자 핸드폰']}',
      '${row['entry_date']}', ${loan_pre_priority},'${row['passport_name']}', '${row['passport_number']}', 
      ${phoneType}, '${row['tel_number']}', '${visaType}', '${commit_date}',1
  );
          `
          })

          console.log('Generated SQL Queries:', queries.join('\n'))
          await executeQueries(queries)
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

// 서버로 쿼리 실행
async function executeQueries (queries) {
  try {
    const response = await fetch('http://localhost:3000/execute-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries })
    })
    const result = await response.json()
    showResultModal(result)
  } catch (error) {
    console.error('Error executing queries:', error)
    alert('서버와의 통신 중 오류가 발생했습니다.')
  }
}
function showResultModal (result) {
  alert(
    `결과: ${result.result}\n` +
      `mkf_master 입력 건수: ${result.mkf_master_count}\n` +
      `error_table 입력 건수: ${result.error_table_count}\n` +
      (result.error_count > 0 ? `에러 건수: ${result.error_count}` : '')
  )
}
/*await executeQueries(queries);
 /*   console.log('서버 응답 상태:', response.status) // 응답 상태 코드 확인

    if (!response.ok) {
      console.error('서버 응답 오류:', response.status, response.statusText)
      alert(`서버 오류: ${response.statusText}`)
      return
    }

    const message = await response.text()
    console.log('서버 응답 메시지:', message) // 응답 메시지 확인
    alert(message)
  } catch (error) {
    console.error('Error executing queries:', error)
    alert('서버와의 통신 중 오류가 발생했습니다.')
  }
} */
