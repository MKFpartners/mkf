document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const nationalitySelect = document.getElementById('nationality')
  const visaTypeSelect = document.getElementById('visaType')
  const commitStatusSelect = document.getElementById('commitStatus')
  // 단일 날짜 입력 필드를 시작일과 종료일로 변경
  const commitDateFromInput = document.getElementById('commitDateFrom')
  const commitDateToInput = document.getElementById('commitDateTo')
  const clearDateButton = document.getElementById('clearDate')
  const totalRecordsElement = document.getElementById('totalRecords')
  const listView = document.getElementById('list-view')
  const detailView = document.getElementById('detail-view')
  const detailContent = document.getElementById('detail-content')
  const searchButton = document.getElementById('searchButton')
  // const excelInputButton = document.getElementById('excelInputButton')
  // const depositCheckButton = document.getElementById('depositCheckButton')
  const nameFilter = document.getElementById('nameFilter')
  const passportFilter = document.getElementById('passportFilter')
  const phoneFilter = document.getElementById('phoneFilter')
  const loanPrePrioritySelect = document.getElementById('loanPrePriority')
  const phoneTypeSelect = document.getElementById('phoneType')
  const containerDiv = document.querySelector('.container') // 상단 컨테이너
  //const depositDateElement = document.getElementById("depositDate");
  const resetButton = document.getElementById('resetButton') // reset 버튼
  const checkboxes = document.querySelectorAll('input[type="checkbox"]') // 모든 체크박스
  const recordsList = document.getElementById('records-list') // 리스트의 목록

  // const jobGubunRadios = document.querySelectorAll(
  //         'input[name="jobGubun"]'
  //       )
  //       jobGubunRadios.forEach(radio => {
  //         radio.addEventListener('change', function () {
  //           window.tableGubun_sw = this.value
  //         })
  //       }

  // Nationality의 기본값을 'Cambodia'로 설정
  if (nationalitySelect) {
    nationalitySelect.value = 'Cambodia'
  }

  let currentRecord = null // 전역 변수로 선언
  // 오늘 날짜를 YYMMDD 형식으로 변환
  const today = new Date()
  const formattedDate = today
    .toISOString()
    .slice(2, 10) // YYYY-MM-DD에서 YY-MM-DD 추출
    .replace(/-/g, '') // 하이픈 제거

  // commitDateFrom과 commitDateTo에 기본값 설정
  // document.getElementById("commitDateFrom").value = formattedDate;
  document.getElementById('commitDateTo').value = formattedDate

  // 목록 데이터 로드
  async function loadRecords (search_type) {
    try {
      const params = new URLSearchParams()
      const idFilter = document.getElementById('idFilter') // ID 입력 필드
      const idValue = idFilter ? idFilter.value.trim() : ''
      const passportFilter = document.getElementById('passportFilter') // 여권번호 입력 필드
      const passportValue = passportFilter ? passportFilter.value.trim() : ''

      console.log('loadRecords 시작')
      console.log('search_type = ', search_type)
      let response = ''

      if (idValue || passportValue) {
        const jobGubun = document.querySelector(
          'input[name="jobGubun"]:checked'
        ).value
        params.append('jobGubun', jobGubun)

        if (idValue && /^\d+$/.test(idValue)) {
          params.append('id', Number(idValue))
          console.log('id= ', idValue)
          response = await fetch(`/api/records/${idValue}?jobGubun=${jobGubun}`)
        } else {
          params.append('passport_number', passportValue)
          console.log('passport_number= ', passportValue)
          response = await fetch(
            `/api/records/passport/${passportValue}?jobGubun=${jobGubun}`
          )
        }
        const data = await response.json()
        // 단일 객체가 오면 배열로 변환
        let normalizedData = Array.isArray(data) ? data : [data]
        let listData = normalizedData

        if (search_type === 1) {
          listData = normalizedData.slice(1) // 첫 데이터(합계) 제외
        } else {
          listData = normalizedData
        }
        console.log('listData=', listData)
        if (listData.length > 0) {
          recordsList.innerHTML = listData
            .map(
              record => `
          <tr onclick="showDetail(${record.id ? `'${record.id}'` : 'null'}, '${
                record.passport_number || ''
              }')">
            <td>${record.id}</td>
            <td>${record.nationality}</td>
            <td>${record.passport_name}</td>
            <td>${record.visa_type}</td>
            <td>${record.passport_number}</td>
            <td>${
              Number(record.phone_type) == 1
                ? 'iPhone'
                : Number(record.phone_type) == 2
                ? 'galaxy'
                : Number(record.phone_type) == 3
                ? 'etc'
                : '-'
            }</td>
            <td>${record.sim_price}</td>
            <td>${record.deposit_amount}</td>
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
        } else {
          recordsList.innerHTML =
            '<tr><td colspan="7">데이터가 없습니다.</td></tr>'
        }
        if (search_type === 1) {
          totalRecordsElement.textContent = listData.length - 1
        } else {
          totalRecordsElement.textContent = listData.length
        }
        return // 여기서 함수 종료
      } else {
        // 2: 미입금조회, 3: 대출희망
        if (search_type === 2 || search_type === 3) {
          // 입금액 초기화
          const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 필드
          console.log('depositSumElement:', depositSumElement) // 디버깅용 출력
          if (depositSumElement) {
            depositSumElement.textContent = '0' // 입금액 초기화
          } else {
            console.error('depositSumElement is not found in the DOM.')
          }
        }

        if (nationalitySelect && nationalitySelect.value !== '전체') {
          params.append('nationality', nationalitySelect.value)
        }
        if (nameFilter && nameFilter.value !== '') {
          params.append('passport_name', nameFilter.value)
        }
        // if (passportFilter && passportFilter.value !== '') {
        //   params.append('passport_number', passportFilter.value)
        // }
        if (search_type !== undefined && search_type !== null) {
          params.append('search_type', search_type)
        }
        if (commitDateFromInput.value.trim()) {
          params.append('commitDateFrom', commitDateFromInput.value.trim())
        }
        if (commitDateToInput.value.trim()) {
          params.append('commitDateTo', commitDateToInput.value.trim())
        }
      }

      jobGubun = document.querySelector('input[name="jobGubun"]:checked').value
      params.append('jobGubun', jobGubun)

      console.log('params:', params.toString())
      response = await fetch(`/api/records?${params.toString()}`)
      const data = await response.json()

      console.log('API 응답 데이터:', data)

      if (Array.isArray(data) && data.length > 0) {
        console.log('Original data:', data) // 디버깅용 로그 추가
        console.log('Search type:', window.search_type) // 디버깅용 로그 추가

        let displayData = data
        if (window.search_type === 1) {
          // 첫 번째 데이터의 구조 확인
          console.log('First data structure:', data[0]) // 첫 번째 데이터의 구조 로깅

          // deposit_sum이 있는지 확인
          const isFirstDataNull = data[0] && data[0].deposit_sum !== undefined
          console.log('Is first data deposit_sum:', isFirstDataNull) // 디버깅용 로그 추가

          if (isFirstDataNull) {
            displayData = data.slice(1)
            console.log('Filtered data:', displayData) // 디버깅용 로그 추가
          }
        }

        recordsList.innerHTML = displayData
          .map(
            record => `
                      <tr onclick="showDetail(${
                        record.id ? `'${record.id}'` : 'null'
                      }, '${record.passport_number || ''}')">
                          <td>${record.id}</td>
                          <td>${record.nationality}</td>
                          <td>${record.passport_name}</td>
                          <td>${record.visa_type}</td>
                          <td>${record.passport_number}</td>
                          <td>${
                            Number(record.phone_type) == 1
                              ? 'iPhone'
                              : Number(record.phone_type) == 2
                              ? 'galaxy'
                              : Number(record.phone_type) == 3
                              ? 'etc'
                              : '-'
                          }</td>
                          <td>${record.sim_price}</td>
                          <td>${record.deposit_amount}</td>
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
      } else {
        recordsList.innerHTML =
          '<tr><td colspan="7">데이터가 없습니다.</td></tr>'
      }
      if (window.search_type === 1) {
        totalRecordsElement.textContent = data.length - 1
      } else {
        totalRecordsElement.textContent = data.length
      }
    } catch (error) {
      console.error('데이터 로드 중 오류:', error)
      alert('데이터를 불러오는데 실패했습니다.')
      totalRecordsElement.textContent = '0'
    }
  }
  const jobGubunRadios = document.querySelectorAll('input[name="jobGubun"]')
  jobGubunRadios.forEach(radio => {
    radio.addEventListener('change', function () {
      window.tableGubun_sw = this.value
    })
  })
  // 날짜 필드 초기화 기능 추가
  if (clearDateButton) {
    clearDateButton.addEventListener('click', () => {
      commitDateFromInput.value = ''
      commitDateToInput.value = ''
    })
  }

  // 상세 정보 표시 함수
  window.showDetail = async (id, passport_number) => {
    window.isCompareMode = false // 상세 정보 표시 시 compare 모드 초기화
    const jobGubun = document.querySelector(
      'input[name="jobGubun"]:checked'
    ).value
    let url
    // 상세조회 폼에서 passport_number, passport_name 필드의 색상을 blue로 지정
    const detailForm = document.getElementById('detailForm')
    if (detailForm) {
      const passportNumberInput = detailForm.querySelector(
        '[name="passport_number"]'
      )
      if (passportNumberInput) {
        passportNumberInput.style.color = 'blue'
      }
      const passportNameInput = detailForm.querySelector(
        '[name="passport_name"]'
      )
      if (passportNameInput) {
        passportNameInput.style.color = 'blue'
      }
    }
    if (id && id !== 'null') {
      // id가 있으면 항상 id로 조회
      console.log('id로 검색. id=', id)
      url = `/api/records/${id}?jobGubun=${jobGubun}`
    } else if (passport_number) {
      // error_table 조회 시 passport_number만 사용, 다른 param 무시
      if (jobGubun === 'E') {
        url = `/api/records/passport/${encodeURIComponent(
          passport_number
        )}?jobGubun=E`
      } else {
        url = `/api/records/passport/${encodeURIComponent(
          passport_number
        )}?jobGubun=${jobGubun}`
      }
    } else {
      alert('ID와 여권번호가 모두 없습니다.')
      return
    }

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.')

      // 기존 화면 초기화
      detailContent.innerHTML = '' // 상세화면 컨텐츠 초기화
      listView.classList.add('hidden') // 리스트 화면 숨기기
      detailView.classList.add('hidden') // 상세화면 숨기기
      containerDiv.style.display = 'none' // 상단 컨테이너 숨기기

      currentRecord = await response.json()
      console.log('currentRecord=', currentRecord)

      const fieldMappings = {
        id: 'ID',
        nationality: 'Nationality (국적)',
        passport_name: 'Name (이름)',
        visa_type: 'Visa Type (비자유형)',
        passport_number: 'Passport Number (여권번호)',
        phone_type: 'Phone Type (폰종류)',
        sim_price: 'SIM Price ($) (유심비($))',
        deposit_amount: 'Deposit Amount ($) (입금액($))',
        balance: 'Balance ($) (입금할 금액($))',
        opening_date: 'Opening Date (개통일자)',
        loan_pre_priority: 'Loan Preference (대출구분)',
        entry_date: 'Entry Date (한국입국날짜)',
        tel_number_cam: 'Phone Number (Cambodia) (전화번호(캄보디아))',
        tel_number_kor: 'Phone Number (Korea) (전화번호(대한민국))',
        commit_date: 'Commit Date (확약일자)',
        format_name: 'Format Name (서식명)',
        commit_id: 'Commit ID (확약Id)',
        commit_status: 'Commit Status (확약상태)',
        signature: 'Signature (서명)',
        sender_name: 'Sender Name (발송자명)',
        sender_email: 'Sender Email (발송자 이메일)',
        sent_date: 'Sent Date (발송일)',
        participant_email: 'Participant Email (참여자 이메일)',
        additional_information: 'Additional Information (추가정보)',
        mkf_status: 'mkf_status (업무진도상태)'
      }

      const nationalityOptions = [
        'Cambodia',
        'Nepal',
        'Vietnam',
        'Philippine',
        'Thailand',
        'Mongolia',
        'Indonesia',
        'Sri Lanka',
        'Uzbekistan',
        'Pakistan',
        'Myanmar',
        'Kyrgyzstan',
        'Bangladesh',
        'Timor-Leste',
        'Laos',
        'China'
      ]

      const visaTypeOptions = ['E9', 'E8']
      const readonlyFields = [
        'id',
        'format_name',
        'commit_id',
        'format_name',
        'commit_status',
        'passport_number',
        'signature',
        'sim_price',
        'sender_name',
        'sender_email',
        'sent_date',
        'participant_email'
      ]

      // 상단 요소들 숨기기
      //containerDiv.style.display = "none";

      // 검색 필드 숨기기
      // const searchFields = document.getElementById("search-fields");
      // if (searchFields) {
      //   searchFields.style.display = "none";
      // }

      // 날짜 필드 정리 함수
      const cleanDateField = dateValue => {
        if (!dateValue) return null
        // 숫자, -, :, space, .만 남기고 초 뒤의 소수점 이하 값 제거
        const cleanedValue = dateValue.replace(/[^0-9-: .]/g, '').split('.')[0]
        // 날짜와 시간 사이에 공백 추가
        if (cleanedValue.includes(':') && !cleanedValue.includes(' ')) {
          return cleanedValue.replace(
            /(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/,
            '$1 $2'
          )
        }
        // 초 뒤의 소수점 이하 값 유지
        return (
          cleanedValue.split('.')[0] + (dateValue.includes('.') ? '.99' : '')
        )
      }

      // 날짜 필드 정리
      ;['sent_date', 'commit_date', 'entry_date', 'opening_date'].forEach(
        key => {
          if (currentRecord[key]) {
            currentRecord[key] = cleanDateField(currentRecord[key])
          }
        }
      )
      detailView.classList.remove('hidden')
      listView.classList.add('hidden')

      // 상세 조회 화면의 타이틀을 제거합니다.
      detailContent.innerHTML = ''

      detailContent.innerHTML = `
                  <div class="detail-header" style="display: flex; justify-content: space-between; align-items: center;">
   <button id="backToListButton" class="secondary-button">Return</button>                    
                  <h2 style="text-align: center; flex-grow: 1;">${
                    jobGubun === 'E'
                      ? 'ErrorData Detailed Informations'
                      : 'Detailed Informations'
                  }</h2>
                  </div>
                  <div class="detail-body">
                      <form id="detailForm">
                          <table class="detail-table">
                              <tbody>
                                  ${Object.entries(currentRecord)
                                    .map(([key, value]) => {
                                      const isReadonly =
                                        readonlyFields.includes(key)

                                      if (key === 'id') {
                                        return `
                                              <tr>
                                                   <td style="width: 30%; text-align: left; padding-right: 10px;">
                      <strong>${fieldMappings[key] || key}</strong>
                    </td>
                    <td style="width: 70%;">
                                                      <input 
                                                          type="text" 
                                                          name="${key}" 
                                                          value="${value}" 
                                                          style="width: 100%;" 
                                                          readonly
                                                      />
                                                  </td>
                                              </tr>
                                          `
                                      }
                                      if (key === 'nationality') {
                                        return `
                  <tr>
                    <td><strong>${fieldMappings[key] || key}</strong></td>
                    <td>
                      <select name="nationality" style="width: 100%;" ${
                        isReadonly ? 'disabled' : ''
                      }>
                        ${nationalityOptions
                          .map(option => {
                            const optionValue = option.split('(')[0]
                            return `<option value="${optionValue}" ${
                              value === 'optionValue' ? 'selected' : ''
                            }>${option}</option>`
                          })
                          .join('')}
                      </select>
                    </td>
                  </tr>
                                        `
                                      }
                                      if (key === 'visa_type') {
                                        return `
                                          <tr>
                                            <td><strong>${
                                              fieldMappings[key] || key
                                            }</strong></td>
                                            <td>
                                              <select name="visa_type" style="width: 100%;"
                                              ${isReadonly ? 'disabled' : ''}>
                                                ${visaTypeOptions
                                                  .map(
                                                    option =>
                                                      `<option value="${option}" ${
                                                        value === option
                                                          ? 'selected'
                                                          : ''
                                                      }>${option}</option>`
                                                  )
                                                  .join('')}
                                              </select>
                                            </td>
                                          </tr>
                                        `
                                      }
                                      if (key === 'passport_number') {
                                        return `
    <tr>
      <td style="width: 30%; text-align: left; padding-right: 10px;">
        <strong>${fieldMappings[key] || key}</strong>
      </td>
      <td style="width: 70%;">
        <input 
          type="text" 
          name="passport_number" 
          value="${value !== null && value !== undefined ? value : ''}" 
          maxlength="9"
          style="width: 100%;" 
          ${isReadonly ? 'disabled' : ''}
        />
      </td>
    </tr>
  `
                                      }
                                      if (key === 'loan_pre_priority') {
                                        return `
                                          <tr>
                                            <td style="width: 30%; text-align: left; padding-right: 10px;">
        <strong>${fieldMappings[key] || key}</strong>
      </td>
      <td style="width: 70%;">
                                              <select name="loan_pre_priority" style="width: 100%;"
                                              ${isReadonly ? 'disabled' : ''}>
                                                <option value="1" ${
                                                  value == 1 ? 'selected' : ''
                                                }>High Priority(우선희망)</option>
                                                <option value="2" ${
                                                  value == 2 ? 'selected' : ''
                                                }>Preferred(희망)</option>
                                                <option value="3" ${
                                                  value == 3 ? 'selected' : ''
                                                }>Not Interested(안함)</option>
                                              </select>
                                            </td>
                                          </tr>
                                        `
                                      }
                                      if (key === 'phone_type') {
                                        return `
                                          <tr>
                                            <td style="width: 30%; text-align: left; padding-right: 10px;">
        <strong>${fieldMappings[key] || key}</strong>
      </td>
      <td style="width: 70%;">
                                              <select name="phone_type" style="width: 100%;"
                                              ${isReadonly ? 'disabled' : ''}>
                                                <option value="1" ${
                                                  value == 1 ? 'selected' : ''
                                                }>iPhone(아이폰)</option>
                                                <option value="2" ${
                                                  value == 2 ? 'selected' : ''
                                                }>galaxy(갤럭시)</option>
                                                <option value="3" ${
                                                  value == 3 ? 'selected' : ''
                                                }>etc(기타)</option>
                                              </select>
                                            </td>
                                          </tr>
                                        `
                                      }
                                      if (key === 'mkf_status') {
                                        return `
                                          <tr>
                                            <td style="width: 30%; text-align: left; padding-right: 10px;">
        <strong>${fieldMappings[key] || key}</strong>
      </td>
      <td style="width: 70%;">
                                              <select name="mkf_status" style="width: 100%;"
                                              ${isReadonly ? 'disabled' : ''}>
                                                <option value="1" ${
                                                  value == 1 ? 'selected' : ''
                                                }>glosign excel 1 추가</option>
                                                <option value="2" ${
                                                  value == 2 ? 'selected' : ''
                                                }>glosign excel 2 추가</option>
                                              <option value="3" ${
                                                value == 3 ? 'selected' : ''
                                              }>미입금 0</option>
                                              <option value="4" ${
                                                value == 4 ? 'selected' : ''
                                              }>미입금</option>
                                              <option value="5" ${
                                                value == 5 ? 'selected' : ''
                                              }>입금완료</option>
                                              <option value="6" ${
                                                value == 6 ? 'selected' : ''
                                              }>처리완료</option>
                                              </select>
                                            </td>
                                          </tr>
                                        `
                                      }
                                      const isDateField = [
                                        'commit_date',
                                        'sent_date',
                                        'completion_date',
                                        'entry_date',
                                        'deposit_date',
                                        'opening_date'
                                      ].includes(key)
                                      return `
                                          <tr>
                                              <td><strong>${
                                                fieldMappings[key] || key
                                              }</strong></td>
                                              <td>
                                                  <input 
                                                      type="text" 
                                                      name="${key}" 
                                                      value="${
                                                        value !== null &&
                                                        value !== undefined
                                                          ? value
                                                          : ''
                                                      }" 
                                                      style="width: 100%;"
                                                      ${
                                                        isReadonly
                                                          ? 'disabled'
                                                          : ''
                                                      }
                                                      ${
                                                        isDateField
                                                          ? 'oninput="this.value = this.value.replace(/[^0-9-: ]/g, \'\')"'
                                                          : ''
                                                      }
                                                  />
                                              </td>
                                          </tr>
                                      `
                                    })
                                    .join('')}
                              </tbody>
                          </table>
                          <div class="button-group" style="margin-top: 20px;">
                              <button type="button" id="saveButton" class="primary-button">Save(저장)</button>                            
                              <button id="backToListButton2" class="secondary-button">Reset</button>                    
                          </div>
                      </form>
                  </div>
              `

      if (jobGubun === 'E') {
        const detailForm = document.getElementById('detailForm')
        if (detailForm) {
          const inputs = detailForm.querySelectorAll('input, select, textarea')
          inputs.forEach(el => {
            el.setAttribute('readonly', true)
            el.setAttribute('disabled', true)
          })
        }
      }
      // 디버깅: detailForm 확인
      const detailForm = document.getElementById('detailForm')

      // "목록" 버튼 이벤트 리스너
      document
        .getElementById('backToListButton')
        .addEventListener('click', backToList)

      // 목록으로 돌아가는 함수
      function backToList () {
        detailView.classList.add('hidden')
        listView.classList.remove('hidden')
        const searchButtonOnList = document.getElementById('searchButton')
        if (searchButtonOnList) {
          searchButtonOnList.disabled = false
          searchButtonOnList.classList.remove('inactive')
        }
        containerDiv.style.display = 'block'
        const searchFields = document.getElementById('search-fields')
        if (searchFields) {
          searchFields.style.display = 'block'
        }
      }

      // 저장 버튼 이벤트 리스너 (기존 이벤트 리스너는 그대로 유지)
      const saveButton = document.getElementById('saveButton')
      if (saveButton) {
        saveButton.addEventListener('click', async () => {
          try {
            const password = prompt('암호를 입력하십시오:')
            if (password === null) {
              alert('작업이 취소되었습니다.')
              return
            }
            if (password !== '2233') {
              alert('잘못된 암호입니다. 저장이 취소되었습니다.')
              return
            }
            const formData = new FormData(document.getElementById('detailForm'))
            const updatedData = {}
            formData.forEach((value, key) => {
              if (
                [
                  'commit_date',
                  'sent_date',
                  'entry_date',
                  'opening_date'
                ].includes(key)
              ) {
                updatedData[key] = cleanDateField(value)
              } else if (
                key === 'loan_pre_priority' ||
                key === 'phone_type' ||
                key === 'mkf_status'
              ) {
                updatedData[key] = value === '' ? null : Number(value)
              } else {
                updatedData[key] = value.trim() === '' ? null : value
              }
            })
            if (
              updatedData.visa_type === 'E8' &&
              updatedData.loan_pre_priority != 3 // 3이 Not Interested
            ) {
              alert(
                "visa_type = 'E8'이면 loan preference = Not interested가 되어야 합니다."
              )
              return
            }
            if (
              updatedData.visa_type === 'E9' &&
              updatedData.loan_pre_priority == 3 // 3이 Not Interested
            ) {
              alert(
                "visa_type = 'E9'이면 loan preference = High Priority 또는 Preferred가 되어야 합니다."
              )
              return
            }
            console.log('main.js: 수정 데이터1:', updatedData)
            const jobGubun = document.querySelector(
              'input[name="jobGubun"]:checked'
            ).value
            const simPrice = Number(updatedData.sim_price)
            const depositAmount = Number(updatedData.deposit_amount)
            const balance = Number(updatedData.balance)
            if (!isNaN(simPrice) && !isNaN(depositAmount) && !isNaN(balance)) {
              if (simPrice !== depositAmount + balance) {
                alert('sim_price는 deposit_amount + balance와 같아야 합니다.')
                return
              }
            }
            // id가 없거나 'null'이면 POST(신규), 있으면 PUT(수정)
            let response
            if (!currentRecord.id || currentRecord.id === 'null') {
              // 신규 등록(POST)
              response = await fetch(`/api/records?jobGubun=${jobGubun}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
              })
            } else {
              // compare 버튼을 통해 수정하는 경우 passport_number로 업데이트
              if (window.isCompareMode) {
                response = await fetch(
                  `/api/records/passport${currentRecord.passport_number}?jobGubun=${jobGubun}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                  }
                )
              } else {
                // 일반 수정의 경우 ID로 업데이트
                response = await fetch(
                  `/api/records/id/${currentRecord.id}?jobGubun=${jobGubun}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedData)
                  }
                )
              }
            }

            if (!response.ok) throw new Error('저장 실패')

            alert('저장이 완료되었습니다.')
          } catch (error) {
            console.error('저장 중 오류:', error)
            alert('저장에 실패했습니다.')
          }
        })
      }
      // 숨길 행에 CSS 클래스 추가
      const rows = detailContent.querySelectorAll('tr')
      // rows.forEach((row, index) => {
      //   if (index < 3) {
      //     row.classList.add('hidden-row') // 1행, 2행, 3행에 hidden-row 클래스 추가
      //   }
      // })
      // 상세 조회 화면이 로드될 때 "Search (조회)" 버튼을 비활성화합니다.
      const searchButton = document.getElementById('searchButton')
      if (searchButton) {
        searchButton.disabled = true
        searchButton.classList.add('inactive') // CSS로 스타일링할 클래스 추가 (선택 사항)
      }
    } catch (error) {
      console.error('상세 정보 로드 중 오류:', error)
      alert('상세 정보를 불러오는데 실패했습니다.')
    }
  }

  // 초기화 버튼 클릭 이벤트
  resetButton.addEventListener('click', () => {
    idFilter.value = ''
    nationalitySelect.value = '전체'
    //visaTypeSelect.value = '전체'
    commitDateFromInput.value = ''
    //commitDateToInput.value = ''
    nameFilter.value = ''
    passportFilter.value = ''
    // phoneFilter.value = ''
    // loanPrePrioritySelect.value = '전체'
    // phoneTypeSelect.value = '전체'

    checkboxes.forEach(checkbox => {
      checkbox.checked = false
    })

    // jobGubun 라디오 버튼을 N으로 초기화
    const jobGubunN = document.getElementById('jobGubunN')
    if (jobGubunN) {
      jobGubunN.checked = true
      window.tableGubun_sw = 'N'
    }
    // 리스트 초기화
    if (recordsList) {
      recordsList.innerHTML = ''
    }

    // 입금액 초기화
    const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 필드
    console.log('depositSumElement:', depositSumElement) // 디버깅용 출력
    if (depositSumElement) {
      depositSumElement.textContent = '0' // 입금액 초기화
    } else {
      console.error('depositSumElement is not found in the DOM.')
    }

    // 검색 결과 초기화
    const searchResultElement = document.getElementById('totalRecords') // 검색 결과 표시 필드
    if (searchResultElement) {
      searchResultElement.innerHTML = '' // 검색 결과 초기화
    } else {
      console.error('searchResultElement is not found in the DOM.')
    }
  })
  window.search_type = 0 // 초기값 설정
  // 조회 버튼 클릭 이벤트
  searchButton.addEventListener('click', async () => {
    // 체크박스 상태 확인
    const depositCheck = document.getElementById('depositCheck') // 입금조회
    const loanPreferenceCheck = document.getElementById('loanPreferenceCheck') // 대출요청
    const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 필드
    const nodepositCheck = document.getElementById('nodepositCheck')
    console.log('depositSumElement:', depositSumElement)

    if (
      (depositCheck.checked && loanPreferenceCheck.checked) ||
      (depositCheck.checked && nodepositCheck.checked) ||
      (loanPreferenceCheck.checked && nodepositCheck.checked)
    ) {
      alert('하나만 선택하세요')
      return // 조회 로직 실행 중단
    }

    if (depositCheck.checked) {
      if (!passwordCheck()) {
        return // 암호 확인 실패 시 작업 중단
      }
      window.search_type = 1 // 입금조회 체크 시
    } else if (loanPreferenceCheck.checked) {
      if (!passwordCheck()) {
        return // 암호 확인 실패 시 작업 중단
      }
      window.search_type = 3 // 대출요청 체크 시
    } else if (nodepositCheck.checked) {
      if (!passwordCheck()) {
        return // 암호 확인 실패 시 작업 중단
      }
      window.search_type = 2 // 미입금조회
    } else {
      window.search_type = 0 // 전체 조회
    }
    console.log(`search_type: ${window.search_type}`) // 디버깅용 출력

    if (window.search_type === 1 || window.search_type === 2) {
      try {
        const jobGubun = document.querySelector(
          'input[name="jobGubun"]:checked'
        ).value
        const params = new URLSearchParams()
        params.append('search_type', window.search_type)
        params.append('jobGubun', jobGubun)

        const response = await fetch(`/api/records?${params.toString()}`)
        const data = await response.json()

        // 모든 값이 null(합계만 있고 실제 데이터가 없는 경우) 또는 빈 배열일 때
        if (
          !data ||
          (Array.isArray(data) &&
            (data.length === 0 ||
              (data.length === 1 &&
                data[0] &&
                Object.values(data[0]).every(v => v === null))))
        ) {
          if (recordsList) {
            recordsList.innerHTML = ''
          }
          totalRecordsElement.textContent = '0'
          alert('조회 결과가 없습니다.')
          return
        }

        console.log('Response data:', data.length, ' 건') // 서버에서 반환된 데이터 확인

        // deposit_sum 값 추출
        const depositSum = data[0]?.deposit_sum || 0 // 첫 번째 레코드에서 deposit_sum 추출
        let listData = data
        if (
          Array.isArray(data) &&
          data.length > 1 &&
          data[0]?.deposit_sum !== undefined
        ) {
          listData = data.slice(1) // 첫 데이터(합계) 제외
          console.log('listData length=', listData.length) // 디버깅용 출력
          if (listData.length === 0) {
            return
          }
        }
        // DOM 요소에 업데이트
        const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 필드
        if (depositSumElement) {
          depositSumElement.textContent = depositSum // 합계를 표시
          loadRecords(window.search_type)
        } else {
          console.error('depositSumElement is not found in the DOM.')
        }
      } catch (error) {
        console.error('Error fetching deposit sum:', error)
        alert('입금액을 가져오는 중 오류가 발생했습니다.')
      }
    } else {
      // 일반 조회 로직 실행
      loadRecords(window.search_type)
    }
  })

  // OpeningCheck 버튼 이벤트 리스너 추가
  const openingCheckButton = document.getElementById('openingCheckButton')
  if (openingCheckButton) {
    openingCheckButton.addEventListener('click', () => {
      // 팝업 창 생성
      const popup = document.createElement('div')
      popup.className = 'memo-popup'
      popup.innerHTML = `
        <div class="memo-popup-content">
          <h3>메모 입력</h3>
          <textarea id="memoInput" rows="10" cols="50" placeholder="메모를 입력하세요..."></textarea>
          <div class="memo-buttons">
            <button id="saveMemo" class="primary-button">적용</button>
            <button id="cancelMemo" class="secondary-button">취소</button>
          </div>
        </div>
      `

      // 팝업 스타일 설정
      const style = document.createElement('style')
      style.textContent = `
        .memo-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .memo-popup-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 80%;
          max-width: 500px;
        }
        .memo-popup h3 {
          margin-top: 0;
          margin-bottom: 15px;
        }
        .memo-popup textarea {
          width: 100%;
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        }
        .memo-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .memo-buttons button {
          padding: 8px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .memo-buttons .primary-button {
          background-color: #4CAF50;
          color: white;
        }
        .memo-buttons .secondary-button {
          background-color: #f44336;
          color: white;
        }
      `
      document.head.appendChild(style)

      // 팝업을 body에 추가
      document.body.appendChild(popup)

      // 저장 버튼 이벤트 리스너
      document
        .getElementById('saveMemo')
        .addEventListener('click', async () => {
          const password = prompt('암호를 입력하십시오:')
          if (password === null) {
            alert('작업이 취소되었습니다.')
            return
          }
          if (password !== '2233') {
            alert('잘못된 암호입니다. 저장이 취소되었습니다.')
            return
          }

          const memoText = document.getElementById('memoInput').value
          const lines = memoText.split('\n').filter(line => line.trim() !== '') // 빈 줄 제거

          let totalSuccessCount = 0
          let totalErrorTableCount = 0
          let totalOtherErrorCount = 0

          for (let i = 0; i + 3 < lines.length; i += 4) {
            const passport_name = lines[i].trim()
            const passport_number = lines[i + 1].trim()
            const tel_number_kor = lines[i + 2].trim()
            const status = lines[i + 3].trim()

            // '개통완료'가 아닌 경우는 건너뜀
            if (status !== '개통완료') continue

            try {
              const response = await fetch('/api/records/update-opening', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  passport_name,
                  passport_number,
                  tel_number_kor
                })
              })

              if (!response.ok) {
                throw new Error('업데이트 실패')
              }

              const result = await response.json()
              console.log('업데이트 결과:', result)

              if (result.statistics) {
                totalSuccessCount += result.statistics.successCount
                totalErrorTableCount += result.statistics.errorTableCount
                totalOtherErrorCount += result.statistics.otherErrorCount
              }
            } catch (error) {
              console.error('업데이트 중 오류:', error)
              alert(`데이터 업데이트 중 오류가 발생했습니다: ${passport_name}`)
            }
          }

          alert(
            `전체 처리 결과:\n정상 업데이트: ${totalSuccessCount}건\n에러테이블 입력: ${totalErrorTableCount}건\n기타 오류: ${totalOtherErrorCount}건`
          )
          document.body.removeChild(popup)
        })

      // 취소 버튼 이벤트 리스너
      document.getElementById('cancelMemo').addEventListener('click', () => {
        document.body.removeChild(popup)
      })

      // 팝업 외부 클릭 시 닫기
      popup.addEventListener('click', e => {
        if (e.target === popup) {
          document.body.removeChild(popup)
        }
      })
    })
  }

  // compare 버튼 클릭 이벤트
  const compareButton = document.getElementById('compareButton')
  if (compareButton) {
    compareButton.addEventListener('click', () => {
      window.isCompareMode = true
      // 기존 compare 버튼 로직...
    })
  }
})
function passwordCheck () {
  const password = prompt('암호를 입력하십시오:')
  if (password === null) {
    // 사용자가 Cancel을 눌렀을 경우
    alert('작업이 취소되었습니다.')
    return false
  }
  if (password !== '2233') {
    alert('잘못된 암호입니다. 작업이 취소되었습니다.')
    return false
  }
  return true
}
