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

  /* 날짜 포맷팅 함수
  function formatDate (dateString) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const year = date.getFullYear().toString().slice(2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}${month}${day}`
  }*/

  // 목록 데이터 로드
  async function loadRecords (search_type) {
    try {
      const params = new URLSearchParams()
      // ID 필드 값 가져오기
      const idFilter = document.getElementById('idFilter') // ID 입력 필드
      const idValue = idFilter ? idFilter.value.trim() : ''
      console.log('loadRecords 시작')
      console.log('search_type = ', search_type)
      if (idValue) {
        // ID 값이 있으면 ID로만 조회
        params.append('id', idValue)
      } else {
        if (search_type === 2) {
          // 대출희망 체크 시 visa_type을 'E9'로 고정
          params.append('visa_type', 'E9')
        }
        if (nationalitySelect && nationalitySelect.value !== '전체') {
          params.append('nationality', nationalitySelect.value)
        }
        if (nameFilter && nameFilter.value !== '') {
          params.append('passport_name', nameFilter.value)
        }
        if (passportFilter && passportFilter.value !== '') {
          params.append('passport_number', passportFilter.value)
        }
        if (commitDateFromInput.value.trim()) {
          params.append('commitDateFrom', commitDateFromInput.value.trim())
        }
        if (commitDateToInput.value.trim()) {
          params.append('commitDateTo', commitDateToInput.value.trim())
        }
      }
      console.log('params:', params.toString())

      const response = await fetch(`/api/records?${params.toString()}`)
      const data = await response.json()

      console.log('API 응답 데이터:', data)

      if (Array.isArray(data) && data.length > 0) {
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
                              ? '아이폰'
                              : record.phone_type == 2
                              ? '갤럭시'
                              : record.phone_type == 3
                              ? '기타'
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
      } else {
        recordsList.innerHTML =
          '<tr><td colspan="7">데이터가 없습니다.</td></tr>'
      }

      totalRecordsElement.textContent = data.length
    } catch (error) {
      console.error('데이터 로드 중 오류:', error)
      alert('데이터를 불러오는데 실패했습니다.')
      totalRecordsElement.textContent = '0'
    }
  }

  // 날짜 필드 초기화 기능 추가
  if (clearDateButton) {
    clearDateButton.addEventListener('click', () => {
      commitDateFromInput.value = ''
      commitDateToInput.value = ''
    })
  }

  // 상세 정보 표시 함수
  window.showDetail = async id => {
    try {
      const response = await fetch(`/api/records/${id}`)
      if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.')

      currentRecord = await response.json()

      const fieldMappings = {
        id: 'ID',
        nationality: 'Nationality (국적)',
        passport_name: 'Name (이름)',
        visa_type: 'Visa Type (비자유형)',
        passport_number: 'Passport Number (여권번호)',
        phone_type: 'Phone Type (폰종류)',
        sim_price: 'SIM Price ($) (유심비($))',
        balance: '입금할 금액($)',
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
        additional_information: 'Additional Information (추가정보)'
      }
      console.log('currentRecord:', currentRecord)
      console.log('fieldMappings:', fieldMappings)

      // Object.keys(currentRecord).forEach((key) => {
      //   if (!fieldMappings[key]) {
      //     console.warn(`fieldMappings에 누락된 키: ${key}`);
      //   }
      // });
      const nationalityOptions = [
        'All(전체)',
        'Cambodia(캄보디아)',
        'Nepal(네팔)',
        'Vietnam(베트남)',
        'Philippine(필리핀)',
        'Thailand(태국)',
        'Mongolia(몽골)',
        'Indonesia(인도네시아)',
        'Sri Lanka(스리랑카)',
        'Uzbekistan(우즈베키스탄)',
        'Pakistan(파키스탄)',
        'Myanmar(미얀마)',
        'Kyrgyzstan(키르기스스탄)',
        'Bangladesh(방글라데시)',
        'Timor-Leste(동티모르)',
        'Laos(라오스)',
        'China(중국)'
      ]

      const visaTypeOptions = ['E9', 'E8']
      const readonlyFields = [
        'id',
        'format_name',
        'commit_id',
        'format_name',
        'commit_status',
        'signature',
        'sender_name',
        'sender_email',
        'sent_date',
        'participant_email',
        'additional_information'
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
      ;['sent_date', 'commit_date', 'entry_date'].forEach(key => {
        if (currentRecord[key]) {
          currentRecord[key] = cleanDateField(currentRecord[key])
        }
      })
      // field_update 필드 제거
      //delete currentRecord.field_update;
      detailView.classList.remove('hidden')
      listView.classList.add('hidden')

      // 상세 조회 화면의 타이틀을 제거합니다.
      detailContent.innerHTML = ''
      // 상세 정보 화면 표시
      let detailFormHTML = `<form id="detailForm">`
      detailFormHTML += `</form>
 <div class="button-container">
  <button type="button" id="backToListButton" class="primary-button">목록</button>  
  <button type="button" id="saveButton" class="primary-button">저장</button>
 </div> 
`
      detailContent.innerHTML = detailFormHTML
      for (const key in fieldMappings) {
        const label = fieldMappings[key]
        const value =
          currentRecord[key] !== undefined && currentRecord[key] !== null
            ? currentRecord[key]
            : ''
        const isReadonly = readonlyFields.includes(key)
        let inputHTML = ''
        if (key === 'nationality') {
          inputHTML = `
     <select class="form-control input-field" id="${key}" name="${key}">
      ${nationalityOptions
        .map(
          option =>
            `<option value="${option.split('(')[0].toLowerCase()}" ${
              currentRecord[key] === option.split('(')[0].toLowerCase()
                ? 'selected'
                : ''
            }>${option}</option>`
        )
        .join('')}
     </select>
    `
        } else if (key === 'visa_type') {
          inputHTML = `
     <select class="form-control input-field" id="${key}" name="${key}">
      ${visaTypeOptions
        .map(
          option =>
            `<option value="${option}" ${
              currentRecord[key] === option ? 'selected' : ''
            }>${option}</option>`
        )
        .join('')}
     </select>
    `
        } else if (key === 'phone_type') {
          inputHTML = `
     <select class="form-control input-field" id="${key}" name="${key}">
      <option value="1" ${
        currentRecord[key] === 1 ? 'selected' : ''
      }>아이폰</option>
      <option value="2" ${
        currentRecord[key] === 2 ? 'selected' : ''
      }>갤럭시</option>
      <option value="3" ${
        currentRecord[key] === 3 ? 'selected' : ''
      }>기타</option>
      <option value="" ${
        currentRecord[key] === null ? 'selected' : ''
      }>-</option>
     </select>
    `
        } else if (key === 'loan_pre_priority') {
          inputHTML = `
     <select class="form-control input-field" id="${key}" name="${key}">
      <option value="1" ${
        currentRecord[key] === 1 ? 'selected' : ''
      }>우선희망</option>
      <option value="2" ${
        currentRecord[key] === 2 ? 'selected' : ''
      }>희망</option>
      <option value="3" ${
        currentRecord[key] === 3 ? 'selected' : ''
      }>안함</option>
      <option value="" ${
        currentRecord[key] === null ? 'selected' : ''
      }>-</option>
     </select>
    `
        } else {
          inputHTML = `<input type="text" class="form-control input-field" id="${key}" name="${key}" value="${value}" ${
            isReadonly ? 'readonly' : ''
          }>`
        }

        detailFormHTML += `
    <div class="form-row">
     <div class="form-label">${label}:</div>
     <div class="form-input">${inputHTML}</div>
    </div>
   `
      }
      detailFormHTML += `</form>`

      detailContent.innerHTML = detailFormHTML

      // "목록" 버튼 이벤트 리스너
      document
        .getElementById('backToListButton')
        .addEventListener('click', backToList)

      // 목록으로 돌아가는 함수
      function backToList () {
        detailView.classList.add('hidden')
        listView.classList.remove('hidden')
        // Ensure the search button is enabled and the inactive class is removed
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
              if (['commit_date', 'sent_date', 'entry_date'].includes(key)) {
                updatedData[key] = cleanDateField(value)
              } else if (key === 'loan_pre_priority' || key === 'phone_type') {
                updatedData[key] = value === '' ? null : Number(value)
              } else {
                updatedData[key] = value.trim() === '' ? null : value
              }
            })

            console.log('수정 데이터:', updatedData)

            const response = await fetch(`/api/records/${currentRecord.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updatedData)
            })

            if (!response.ok) throw new Error('수정 실패')

            alert('수정이 완료되었습니다.')
          } catch (error) {
            console.error('수정 중 오류:', error)
            alert('수정에 실패했습니다.')
          }
        })
      }

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
    nationalitySelect.value = '전체'
    //visaTypeSelect.value = '전체'
    commitDateFromInput.value = ''
    commitDateToInput.value = ''
    nameFilter.value = ''
    passportFilter.value = ''
    // phoneFilter.value = ''
    // loanPrePrioritySelect.value = '전체'
    // phoneTypeSelect.value = '전체'

    checkboxes.forEach(checkbox => {
      checkbox.checked = false
    })

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
    const depositCheck = document.getElementById('depositCheck')
    const loanPreferenceCheck = document.getElementById('loanPreferenceCheck')
    const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 필드
    console.log('depositSumElement:', depositSumElement)
    if (depositCheck.checked && loanPreferenceCheck.checked) {
      alert('하나만 체크하세요')
      return // 조회 로직 실행 중단
    }

    if (depositCheck.checked) {
      window.search_type = 1 // 입금조회 체크 시
    } else if (loanPreferenceCheck.checked) {
      window.search_type = 2 // 대출희망 체크 시
    } else {
      window.search_type = 0 // 둘 다 체크되지 않은 경우
    }
    console.log(`search_type: ${window.search_type}`) // 디버깅용 출력

    if (window.search_type === 1) {
      // 입금조회일 경우 합계를 가져옴
      try {
        console.log(`Fetching URL: /api/records?search_type=1`)
        const response = await fetch(`/api/records?search_type=1`)
        console.log('Response received:', response)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log('Response data:', data) // 서버에서 반환된 데이터 확인

        // deposit_sum 값 추출
        const depositSum = data[0]?.deposit_sum || 0 // 첫 번째 레코드에서 deposit_sum 추출

        // DOM 요소에 업데이트
        const depositSumElement = document.getElementById('deposit-sum') // 입금액 표시 필드
        if (depositSumElement) {
          depositSumElement.textContent = depositSum // 합계를 표시
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
})
