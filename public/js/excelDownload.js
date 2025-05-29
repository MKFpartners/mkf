const downloadExcelButton = document.getElementById('downloadExcelButton')
downloadExcelButton.addEventListener('click', async () => {
  try {
    // 오늘 날짜로 YYMMDD 형식의 파일명 생성
    const today = new Date()
    const yy = String(today.getFullYear()).slice(-2)
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')

    // jobGubun 값에 따라 파일명 및 테이블 결정
    let jobGubun = 'M'
    const jobGubunInput = document.querySelector(
      'input[name="jobGubun"]:checked'
    )
    if (jobGubunInput) {
      jobGubun = jobGubunInput.value
    }
    const fileName =
      jobGubun === 'E'
        ? `error_table.${yy}${mm}${dd}`
        : `mkf_master.${yy}${mm}${dd}`

    // 1. 리스트에서 id 또는 passport_number만 추출
    const tbody = document.querySelector('#records-list')
    const trs = tbody.querySelectorAll('tr')
    let keyList = []
    if (jobGubun === 'E') {
      // error_table: passport_number가 첫 번째 td에 있다고 가정
      keyList = Array.from(trs)
        .map(tr => {
          const td = tr.querySelector('td')
          return td ? td.innerText.trim() : null
        })
        .filter(val => val)
    } else {
      // mkf_master: id가 첫 번째 td에 있다고 가정
      keyList = Array.from(trs)
        .map(tr => {
          const td = tr.querySelector('td')
          return td ? td.innerText.trim() : null
        })
        .filter(val => val)
    }

    if (!keyList.length) {
      alert('다운로드할 데이터가 없습니다.')
      return
    }

    // 상세조회 조건과 동일하게 검색조건 구성
    let searchParam = ''
    if (jobGubun === 'E') {
      // error_table은 passport_number로 검색
      const passportInput = document.getElementById('passportNumberInput')
      searchParam =
        passportInput && passportInput.value
          ? `passport_number=${encodeURIComponent(passportInput.value)}`
          : ''
    } else {
      // mkf_master는 id로 검색
      const idInput = document.getElementById('idInput')
      searchParam =
        idInput && idInput.value
          ? `id=${encodeURIComponent(idInput.value)}`
          : ''
    }

    // 2. 서버에 keyList를 전달하며 API 호출 (POST 방식)
    const response = await fetch('/api/download/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobGubun,
        keys: keyList // 서버에서 jobGubun에 따라 id 또는 passport_number로 처리
      })
    })
    const allRows = await response.json()
    if (!allRows.length) {
      alert('다운로드할 데이터가 없습니다.')
      return
    }

    // 엑셀 헤더(영문, 데이터와 일치)
    const excelHeaders = [
      'id',
      'nationality',
      'name',
      'visa_type',
      'passport_number',
      'phone_type',
      'sim_price',
      'deposit_amount',
      'balance',
      'loan_preference',
      'entry_date',
      'phone_number_cam',
      'phone_number_kor',
      'commit_date',
      'format_name',
      'commit_id',
      'commit_status',
      'signature',
      'sender_name',
      'sender_email',
      'sent_date',
      'participant_email',
      'additional_information',
      'mkf_status',
      'error_code',
      'error_message'
    ]

    // 각 행에서 필드명과 1:1로 값 추출
    const rows = allRows.map(record =>
      excelHeaders.map(key =>
        record && record[key] !== undefined && record[key] !== null
          ? record[key]
          : ''
      )
    )

    // SheetJS를 사용해 워크시트 생성
    const data = [excelHeaders, ...rows]
    const worksheet = XLSX.utils.aoa_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, fileName + '.xlsx')
  } catch (err) {
    alert('엑셀(xlsx) 다운로드 중 오류가 발생했습니다.')
    console.error(err)
  }
})
