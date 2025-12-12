document
  .getElementById('viewMembersButton')
  .addEventListener('click', function () {
    // 요청에 따라 document.body.innerHTML을 초기화합니다.
    // 이 작업은 현재 페이지의 모든 콘텐츠를 지우고 새로운 콘텐츠로 대체합니다.
    document.body.innerHTML = ''

    const nationalityOptions = `
      <option value="All">All</option>
      <option value="Cambodia">Cambodia</option>
      <option value="Nepal">Nepal</option>
      <option value="Vietnam">Vietnam</option>
      <option value="Philippines">Philippines</option>
      <option value="Thailand">Thailand</option>
      <option value="Mongolia">Mongolia</option>
      <option value="Indonesia">Indonesia</option>
      <option value="Sri Lanka">Sri Lanka</option>
      <option value="Uzbekistan">Uzbekistan</option>
      <option value="Pakistan">Pakistan</option>
      <option value="Myanmar">Myanmar</option>
      <option value="Kyrgyzstan">Kyrgyzstan</option>
      <option value="Bangladesh">Bangladesh</option>
      <option value="East Timor">East Timor</option>
      <option value="Laos">Laos</option>
      <option value="China">China</option>
    `
    const nationalityList = [
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
      'China',
    ]

    const membersDiv = document.createElement('div')
    membersDiv.id = 'members-content'
    membersDiv.style.width = '100vw'
    membersDiv.style.minHeight = '100vh'

    membersDiv.innerHTML = `
      <div style="display:flex; flex-direction:row; height:100vh;">
        <div style="flex:1; border-right:2px solid #eee; padding:32px 24px 24px 24px; overflow:auto; display:flex; flex-direction:column;">
          <h2 style="text-align:center; margin-bottom:24px; font-size:2rem;">DETAILED DATA</h2>
          <div id="membersLeftContent" style="flex:1; min-height:60vh;"></div>
        </div>
        <div style="flex:1; padding:32px 24px 24px 24px; overflow:auto; display:flex; flex-direction:column;">
          <h2 style="text-align:center; margin-bottom:24px; font-size:2rem;">NEW MEMBERS DATA</h2>
          <div style="margin-bottom:16px;">
            <div style="margin-bottom:8px;">
              <select id="search_nationality" style="width:120px; margin-right:8px;">
                ${nationalityOptions}
              </select>
              <input type="text" id="search_passport_name" placeholder="passport_name" style="width:120px; margin-right:4px;">
              <input type="text" id="search_passport_number" placeholder="passport_number" style="width:120px; margin-right:4px;">
              <span style="color:#666; font-size:0.9rem; margin-left:4px;">(mkf_status=1)</span>
              </div>
          </div>
          <div style="margin-bottom:8px; display:flex; align-items:center;">
            <button id="membersSearchBtn" style="margin-left:8px;">검색</button>
            <span id="membersResultCount" style="margin-left:16px; color:#333;">Search Results: <strong>0</strong></span>
          </div>
          <div id="membersRightContent" style="flex:1; min-height:60vh; overflow:auto;"></div>
        </div>
      </div>
      <button id="membersBackButton"
        style="position:fixed; top:24px; right:32px; z-index:10001; font-size:1.2rem;">Return</button>
    `

    document.body.appendChild(membersDiv)

    // membersBackButton은 새로 생성된 DOM 요소에 다시 이벤트 리스너를 붙여야 합니다.
    document
      .getElementById('membersBackButton')
      .addEventListener('click', function () {
        // 이 부분은 'main-content'와 'members-content'를 토글하는 로직으로 변경될 수 있습니다.
        // 현재는 페이지 전체를 새로고침하는 효과를 냅니다.
        window.location.reload()
      })

    //document.getElementById('search_commit_date').value = todayStr
    document.getElementById('search_nationality').value = 'Cambodia'

    async function SelectNewMembers(Nationality = '', passport_name = '', passport_number = '') {
      let url = '/api/select-new-members'
      const params = []
      
      if (Nationality && Nationality !== 'All') {
        params.push(`nationality=${encodeURIComponent(Nationality)}`)
      }
      if (passport_name) {
        params.push(`passport_name=${encodeURIComponent(passport_name)}`)
      }
      if (passport_number) {
        params.push(`passport_number=${encodeURIComponent(passport_number)}`)
      }
      if (params.length > 0) url += '?' + params.join('&')

      let data = []
      const container = document.getElementById('membersRightContent')
      container.innerHTML = ''
      try {
        const res = await fetch(url)
        if (res.ok) {
          data = await res.json()
        }
      } catch (e) {
        data = []
      }

      const resultCountElem = document.getElementById('membersResultCount')
      if (resultCountElem) {
        resultCountElem.querySelector('strong').textContent = data.length
      }

      if (!data || data.length === 0) {
        container.innerHTML =
          '<div style="color:#888; text-align:center; margin-top:40px;">검색 결과가 없습니다.</div>'
        return
      }
      const pageSize = 10
      let currentPage = 1
      const totalPages = Math.ceil(data.length / pageSize)

      function renderTable(page) {
        const start = (page - 1) * pageSize
        const end = start + pageSize
        const pageData = data.slice(start, end)
        const columns = Object.keys(data[0])

        container.innerHTML = `
          <div style="width:100%; overflow-x:auto;">
              <table style="min-width:900px; width:max-content; border-collapse:collapse;">
                <thead>
                  <tr style="background:#f5f5f5;">
                    ${columns
                      .map(
                        (col) =>
                          `<th style="border:1px solid #ddd; padding:4px;">${col}</th>`
                      )
                      .join('')}
                  </tr>
                </thead>
                <tbody>
                  ${pageData
                    .map(
                      (row, rowIdx) => `
                    <tr data-row-idx="${rowIdx}">
                      ${columns
                        .map(
                          (col) =>
                            `<td style="border:1px solid #ddd; padding:4px;">${
                              row[col] ?? ''
                            }</td>`
                        )
                        .join('')}
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
            <div id="membersPagination" style="display:flex; justify-content:center; align-items:center; margin-top:8px;">
              <button ${
                page === 1 ? 'disabled' : ''
              } style="margin:0 4px;" id="membersPrevBtn">&lt;</button>
              <span style="margin:0 8px;">${page} / ${totalPages}</span>
              <button ${
                page === totalPages ? 'disabled' : ''
              } style="margin:0 4px;" id="membersNextBtn">&gt;</button>
            </div>
            <div id="membersRowDetail" style="margin-top:16px; color:#333; font-size:1rem; min-height:1.5em;"></div>
          `

        const tbody = container.querySelector('tbody')
        const detailDiv = container.querySelector('#membersRowDetail')
        if (tbody && detailDiv) {
          tbody.querySelectorAll('tr').forEach((tr) => {
            tr.addEventListener('mouseenter', function () {
              const idx = parseInt(tr.getAttribute('data-row-idx'))
              const row = pageData[idx]
              detailDiv.innerHTML = Object.entries(row)
                .filter(([k, v]) => v !== null && v !== undefined)
                .map(
                  ([k, v]) =>
                    `<span style="margin-right:16px;"><b>${k}</b>=${v}</span>`
                )
                .join(' ')
            })
            tr.addEventListener('mouseleave', function () {
              detailDiv.innerHTML = ''
            })

            tr.addEventListener('click', async function () {
              const idx = parseInt(tr.getAttribute('data-row-idx'))
              const row = pageData[idx]

              // 좌측 테이블에 데이터 전달 (field_update만 readonly)

              document.getElementById('membersLeftContent').innerHTML = `
                <div style="font-size:1.1rem; margin-bottom:8px;"><b>상세 정보</b></div>
                <form id="membersEditForm">
                  <table style="border-collapse:collapse; background:#fff; border:1px solid #eee; font-size:1rem; width:100%;">
                    <tbody>
                      ${Object.entries(row)
                        .map(([key, value]) => {
                          if (key === 'gender') {
                            return `
                              <tr>
                                <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">
                                  <label for="input_${key}">${key}</label>
                                </th>
                                <td style="padding:4px 8px;">
                                  <select id="input_${key}" name="${key}" style="width:100%;">
                                    <option value="F" ${
                                      value === 'F' ? 'selected' : ''
                                    }>F</option>
                                    <option value="M" ${
                                      value === 'M' ? 'selected' : ''
                                    }>M</option>
                                  </select>
                                </td>
                              </tr>
                            `
                          } else if (key === 'signyn') {
                            return `
                              <tr>
                                <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">
                                  <label for="input_${key}">${key}</label>
                                </th>
                                <td style="padding:4px 8px;">
                                  <select id="input_${key}" name="${key}" style="width:100%;">
                                    <option value="Y" ${
                                      value === 'Y' ? 'selected' : ''
                                    }>Y</option>
                                    <option value="N" ${
                                      value === 'N' ? 'selected' : ''
                                    }>N</option>
                                  </select>
                                </td>
                              </tr>
                            `
                          } else if (key === 'nationality') {
                            return `
                              <tr>
                                <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">
                                  <label for="input_${key}">${key}</label>
                                </th>
                                <td style="padding:4px 8px;">
                                  <select id="input_${key}" name="${key}" style="width:100%;">
                                    ${nationalityList
                                      .map(
                                        (opt) =>
                                          `<option value="${opt}" ${
                                            value === opt ? 'selected' : ''
                                          }>${opt}</option>`
                                      )
                                      .join('')}
                                  </select>
                                </td>
                              </tr>
                            `
                          } else {
                            return `
                              <tr>
                                <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">
                                  <label for="input_${key}">${key}</label>
                                </th>
                                <td style="padding:4px 8px;">
                                  <input type="text" id="input_${key}" name="${key}" value="${
                                    value ?? ''
                                  }" ${
                              key === 'field_update'
                                ? 'readonly style="width:100%; background:#f5f5f5; border:none; color:#888;"'
                                : 'style="width:100%;"'
                            }>
                                </td>
                              </tr>
                            `
                          }
                        })
                        .join('')}
                    </tbody>
                  </table>
                  <div style="margin-top:16px; text-align:right;">
                    <button type="button" id="membersMstBtn" style="margin-right:8px;">MST</button>
                    <button type="button" id="membersSaveBtn" style="margin-right:8px;">저장</button>
                    <button type="button" id="membersCancelBtn">취소</button>
                  </div>
                </form>
              `
              // MST 버튼 클릭 이벤트 핸들러
              document
                .getElementById('membersMstBtn')
                .addEventListener('click', async () => {
                  // mkf_status 값 확인
                  const mkfStatusValue = document.getElementById('input_mkf_status')?.value;
                  
                  if (mkfStatusValue === '1') {
                    alert('mkf_status를 2로 수정하세요');
                    return;
                  }
                  
                  // passport_number 유효성 검사
                  const passportNumber = document.getElementById('input_passport_number').value;
                  
                  if (!passportNumber || passportNumber.trim() === '') {
                    alert('passport_number는 필수 항목입니다.');
                    return;
                  }
                  
                  if (passportNumber.trim().length > 9) {
                    alert('passport_number는 9자리를 초과할 수 없습니다.');
                    return;
                  }
                  
                  // New to MKF 처리를 위한 데이터 수집
                  console.log('New to MKF processing started...')
                  
                  const data = {
                    p_passport_name: document.getElementById('input_passport_name').value,
                    p_gender: document.getElementById('input_gender').value,
                    p_date_of_birth: document.getElementById('input_date_of_birth').value,
                    p_tel_number: document.getElementById('input_tel_number').value,
                    p_signyn: document.getElementById('input_signyn').value,
                    p_passport_number: document.getElementById('input_passport_number').value,
                    p_nationality: document.getElementById('input_nationality').value,
                    p_entry_date: document.getElementById('input_entry_date').value
                  }
                  
                  // 서버에 New to MKF 처리 요청
                  try {
                    const response = await fetch('/api/new-to-mkf', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    })
                    
                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.error || 'New to MKF 처리 중 서버 오류가 발생했습니다.')
                    }
                    
                    const result = await response.json()
                    if (result && result.result) {
                      alert(`New to MKF 처리가 완료되었습니다: ${result.result}`)
                      return result.result; // 정상인 경우 ID 반환
                    } else if (result && result.id) {
                      alert(`New to MKF 처리가 완료되었습니다. ID: ${result.id}`)
                      return result.id; // 정상인 경우 ID 반환
                    } else {
                      alert('New to MKF 처리가 완료되었습니다.')
                      return null;
                    }
                  } catch (error) {
                    console.error('New to MKF 처리 중 오류 발생:', error)
                    alert(`New to MKF 처리 실패: ${error.message}`)
                    return null; // 오류인 경우 null 반환
                  }
                })

              // 저장 버튼 클릭 이벤트 핸들러
              document
                .getElementById('membersSaveBtn')
                .addEventListener('click', async () => {
                  // left panel에서 입력값 수집
                  console.log('Saving member data...')
                  
                  // 오늘 날짜를 YYYY-MM-DD 형식으로 생성
                  const today = new Date()
                  const yyyy = today.getFullYear()
                  const mm = String(today.getMonth() + 1).padStart(2, '0')
                  const dd = String(today.getDate()).padStart(2, '0')
                  const todayStr = `${yyyy}-${mm}-${dd}`
                  
                  const data = {
                    p_id: document.getElementById('input_id').value,
                    p_commit_date: todayStr, // 항상 오늘 날짜로 설정
                    p_field_update:
                      document.getElementById('input_field_update').value,
                    p_passport_name:
                      document.getElementById('input_passport_name').value,
                    p_gender: document.getElementById('input_gender').value,
                    p_date_of_birth:
                      document.getElementById('input_date_of_birth').value,
                    p_tel_number:
                      document.getElementById('input_tel_number').value,
                    p_signyn: document.getElementById('input_signyn').value,
                    p_passport_number:
                      document.getElementById('input_passport_number').value,
                    p_nationality:
                      document.getElementById('input_nationality').value,
                    p_error_code:
                      document.getElementById('input_error_code').value,
                    p_error_message:
                      document.getElementById('input_error_message').value,
                    p_entry_date:
                      document.getElementById('input_entry_date').value,
                    p_mkf_status:
                      document.getElementById('input_mkf_status')?.value || 1,
                  }

                  // 데이터 확인용 메시지
                  const formattedData = Object.entries(data)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n')
                  if (confirm('저장할 데이터:\n\n' + formattedData)) {
                  } else {
                    alert('저장 취소됨.')
                    return;
                  }

                  // 서버에 요청
                  try {
                    const response = await fetch('/api/update-new-members', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    })
                    
                    if (!response.ok) {
                      const errorData = await response.json()
                      throw new Error(errorData.error || '서버 오류가 발생했습니다.')
                    }
                    
                    const result = await response.json()
                    if (result && result.id) {
                      alert(`정상적으로 저장되었습니다. id: ${result.id}`)
                    } else {
                      throw new Error('저장 실패: 서버 응답이 올바르지 않습니다.')
                    }
                  } catch (error) {
                    console.error('저장 중 오류 발생:', error)
                    alert(`저장 실패: ${error.message}`)
                  }
                })

              // 취소 버튼 이벤트 핸들러
              document.getElementById('membersCancelBtn').onclick = function () {
                document.getElementById('membersLeftContent').innerHTML = ''
              }
            })
          })
        }

        if (document.getElementById('membersPrevBtn')) {
          document.getElementById('membersPrevBtn').onclick = () => {
            if (currentPage > 1) {
              currentPage--
              renderTable(currentPage)
            }
          }
        }
        if (document.getElementById('membersNextBtn')) {
          document.getElementById('membersNextBtn').onclick = () => {
            if (currentPage < totalPages) {
              currentPage++
              renderTable(currentPage)
            }
          }
        }
      }

      renderTable(currentPage)
    }

    document
      .getElementById('membersSearchBtn')
      .addEventListener('click', function () {
        const nationality = document.getElementById('search_nationality').value
        const passport_name = document.getElementById('search_passport_name').value
        const passport_number = document.getElementById('search_passport_number').value
        
        SelectNewMembers(nationality, passport_name, passport_number)
      })

    SelectNewMembers('Cambodia', '', '')
  })