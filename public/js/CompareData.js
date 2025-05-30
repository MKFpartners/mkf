document.getElementById('compareButton').addEventListener('click', function () {
  document.getElementById('main-content').style.display = 'none'
  document.getElementById('compare-content').style.display = 'block'
  document.getElementById('compareLeftContent').innerHTML = ''
  document.getElementById('compareRightContent').innerHTML = ''
})

document
  .getElementById('compareBackButton')
  .addEventListener('click', function () {
    document.getElementById('compare-content').style.display = 'none'
    document.getElementById('main-content').style.display = 'block'
  })

document.getElementById('compareButton').addEventListener('click', function () {
  document.body.innerHTML = ''
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`

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
    'China'
  ]
  const readonlyFields = ['id', 'commit_id', 'signature']
  const visaTypeOptions = ['E9', 'E8']
  const loanPrePriorityOptions = [
    { value: 1, label: 'High Priority(우선희망)' },
    { value: 2, label: 'Preferred(희망)' },
    { value: 3, label: 'Not Interested(안함)' }
  ]
  const phoneTypeOptions = [
    { value: 1, label: 'iPhone(아이폰)' },
    { value: 2, label: 'galaxy(갤럭시)' },
    { value: 3, label: 'etc(기타)' }
  ]
  const commitStatusOptions = [
    { value: '진행중', label: '진행중' },
    { value: '완료', label: '완료' },
    { value: '오류', label: '오류' },
    { value: '오류정정', label: '오류정정' },
    { value: '보류', label: '보류' }
  ]
  const compareDiv = document.createElement('div')
  compareDiv.id = 'compare-content'
  compareDiv.style.width = '100vw'
  compareDiv.style.minHeight = '100vh'

  compareDiv.innerHTML = `
    <div style="display:flex; flex-direction:row; height:100vh;">
      <div style="flex:1; border-right:2px solid #eee; padding:32px 24px 24px 24px; overflow:auto; display:flex; flex-direction:column;">
        <h2 style="text-align:center; margin-bottom:24px; font-size:2rem;">MKF MASTER</h2>
        <div id="compareLeftContent" style="flex:1; min-height:60vh;"></div>
      </div>
      <div style="flex:1; padding:32px 24px 24px 24px; overflow:auto; display:flex; flex-direction:column;">
        <h2 style="text-align:center; margin-bottom:24px; font-size:2rem;">ERROR DATA</h2>
        <div style="margin-bottom:16px;">
          <div style="margin-bottom:8px;">
            <input type="date" id="search_commit_date" placeholder="commit_date" style="width:140px; margin-right:8px;" value="${todayStr}">
            <select id="search_nationality" style="width:120px; margin-right:8px;">
              ${nationalityOptions}
            </select>
            <input type="text" id="search_passport_name" placeholder="passport_name" style="width:120px; margin-right:4px;">          
            <input type="text" id="search_passport_number" placeholder="passport_number" style="width:120px; margin-right:4px;">
            <label>error_code: </label>
            <select id="search_error_code" style="width:100px; margin-right:8px;">
              <option value="E" selected>E</option>
              <option value="N">N</option>
            </select>
            </div>
        </div>
        <div style="margin-bottom:8px; display:flex; align-items:center;">
          <button id="errorSearchBtn" style="margin-left:8px;">검색</button>
          <span id="errorResultCount" style="margin-left:16px; color:#333;">Search Results: <strong>0</strong></span>
        </div>
        <div id="compareRightContent" style="flex:1; min-height:60vh; overflow:auto;"></div>
      </div>
    </div>
    <button id="compareBackButton"
      style="position:fixed; top:24px; right:32px; z-index:10001; font-size:1.2rem;">Return</button>
  `

  document.body.appendChild(compareDiv)

  document
    .getElementById('compareBackButton')
    .addEventListener('click', function () {
      window.location.reload()
    })

  document.getElementById('search_commit_date').value = todayStr
  document.getElementById('search_nationality').value = 'Cambodia'
  document.getElementById('search_error_code').value = 'E'

  async function loadErrorData (filters = {}) {
    let url = '/api/error-data'
    const params = []
    for (const key in filters) {
      if (filters[key] && filters[key] !== 'All')
        params.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`
        )
    }
    if (params.length > 0) url += '?' + params.join('&')

    let data = []
    const container = document.getElementById('compareRightContent')
    container.innerHTML = ''
    try {
      const res = await fetch(url)
      if (res.ok) {
        data = await res.json()
      }
    } catch (e) {
      data = []
    }

    const resultCountElem = document.getElementById('errorResultCount')
    if (resultCountElem) {
      resultCountElem.querySelector('strong').textContent = data.length
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<div style="color:#888; text-align:center; margin-top:40px;">검색 결과가 없습니다.</div>'
      return
    }
    const pageSize = 5
    let currentPage = 1
    const totalPages = Math.ceil(data.length / pageSize)

    function renderTable (page) {
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
                    col =>
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
                      col =>
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
        <div id="errorPagination" style="display:flex; justify-content:center; align-items:center; margin-top:8px;">
          <button ${
            page === 1 ? 'disabled' : ''
          } style="margin:0 4px;" id="errorPrevBtn">&lt;</button>
          <span style="margin:0 8px;">${page} / ${totalPages}</span>
          <button ${
            page === totalPages ? 'disabled' : ''
          } style="margin:0 4px;" id="errorNextBtn">&gt;</button>
        </div>
        <div id="errorRowDetail" style="margin-top:16px; color:#333; font-size:1rem; min-height:1.5em;"></div>
      `

      const tbody = container.querySelector('tbody')
      const detailDiv = container.querySelector('#errorRowDetail')
      if (tbody && detailDiv) {
        tbody.querySelectorAll('tr').forEach(tr => {
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
            const passportNumber = row['passport_number']
            if (!passportNumber) {
              document.getElementById('compareLeftContent').innerHTML =
                '<div style="color:#888; margin-top:24px;">passport_number가 없습니다.</div>'
              return
            }
            try {
              const res = await fetch(
                `/api/mkf-master-by-passport?passport_number=${encodeURIComponent(
                  passportNumber
                )}`
              )
              let masterData = null
              if (res.ok) {
                masterData = await res.json()
              }
              const fields = [
                'id',
                'nationality',
                'passport_name',
                'visa_type',
                'passport_number',
                'phone_type',
                'sim_price',
                'deposit_amount',
                'balance',
                'loan_pre_priority',
                'entry_date',
                'tel_number_cam',
                'tel_number_kor',
                'commit_date',
                'format_name',
                'commit_id',
                'commit_status',
                'signature',
                'sender_name',
                'sender_email',
                'sent_date',
                'participant_email',
                'additional_information'
              ]
              let tableData = {}
              if (!masterData || Object.keys(masterData).length === 0) {
                fields.forEach(f => {
                  if (
                    [
                      'sim_price',
                      'deposit_amount',
                      'balance',
                      'loan_pre_priority'
                    ].includes(f)
                  ) {
                    tableData[f] = row[f] ?? 0
                    if (
                      tableData[f] === null ||
                      tableData[f] === undefined ||
                      tableData[f] === ''
                    )
                      tableData[f] = 0
                  } else if (f === 'format_name') {
                    // format_name이 null 또는 undefined면 '오류 추가됨'으로
                    let value =
                      masterData && masterData[f] !== undefined
                        ? masterData[f]
                        : row[f]
                    if (value === null || value === undefined || value === '') {
                      tableData[f] = '오류 정정됨'
                    } else {
                      tableData[f] = value
                    }
                  } else {
                    tableData[f] =
                      masterData && masterData[f] !== undefined
                        ? masterData[f]
                        : row[f] ?? ''
                    if (tableData[f] === null || tableData[f] === undefined)
                      tableData[f] = ''
                  }
                })
              } else {
                fields.forEach(f => {
                  if (
                    [
                      'sim_price',
                      'deposit_amount',
                      'balance',
                      'loan_pre_priority'
                    ].includes(f)
                  ) {
                    tableData[f] = masterData[f] ?? 0
                    if (
                      tableData[f] === null ||
                      tableData[f] === undefined ||
                      tableData[f] === ''
                    )
                      tableData[f] = 0
                  } else {
                    tableData[f] = masterData[f] ?? ''
                    if (tableData[f] === null || tableData[f] === undefined)
                      tableData[f] = ''
                  }
                })
              }
              const rows = fields
                .map(k => {
                  const v = tableData[k]
                  if (readonlyFields.includes(k)) {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <input type="text" name="${k}" value="${v}" readonly style="width:100%; background:#f5f5f5; border:none; color:#888;">
                    </td>
                  </tr>`
                  } else if (k === 'nationality') {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <select name="nationality" style="width:100%;">
                        ${nationalityList
                          .map(
                            opt =>
                              `<option value="${opt}"${
                                v === opt ? ' selected' : ''
                              }>${opt}</option>`
                          )
                          .join('')}
                      </select>
                    </td>
                  </tr>`
                  } else if (k === 'visa_type') {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <select name="visa_type" style="width:100%;">
                        ${visaTypeOptions
                          .map(
                            opt =>
                              `<option value="${opt}"${
                                v === opt ? ' selected' : ''
                              }>${opt}</option>`
                          )
                          .join('')}
                      </select>
                    </td>
                  </tr>`
                  } else if (k === 'commit_status') {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <select name="commit_status" style="width:100%;">
                        ${commitStatusOptions
                          .map(
                            opt =>
                              `<option value="${opt.value}"${
                                v === opt.value ? ' selected' : ''
                              }>${opt.label}</option>`
                          )
                          .join('')}
                      </select>
                    </td>
                  </tr>`
                  } else if (k === 'loan_pre_priority') {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <select name="loan_pre_priority" style="width:100%;">
                        ${loanPrePriorityOptions
                          .map(
                            opt =>
                              `<option value="${opt.value}"${
                                String(v) === String(opt.value)
                                  ? ' selected'
                                  : ''
                              }>${opt.label}</option>`
                          )
                          .join('')}
                      </select>
                    </td>
                  </tr>`
                  } else if (k === 'phone_type') {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <select name="phone_type" style="width:100%;">
                        ${phoneTypeOptions
                          .map(
                            opt =>
                              `<option value="${opt.value}"${
                                String(v) === String(opt.value)
                                  ? ' selected'
                                  : ''
                              }>${opt.label}</option>`
                          )
                          .join('')}
                      </select>
                    </td>
                  </tr>`
                  } else if (k === 'passport_number') {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <input type="text" name="passport_number" maxlength="9" value="${
                        v ?? ''
                      }" style="width:100%;">
                    </td>
                  </tr>`
                  } else if (
                    ['sim_price', 'deposit_amount', 'balance'].includes(k)
                  ) {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <input type="number" name="${k}" value="${
                      v ?? 0
                    }" style="width:100%;">
                    </td>
                  </tr>`
                  } else {
                    return `<tr>
                    <th style="text-align:right; padding:4px 8px; background:#f5f5f5;">${k}</th>
                    <td style="padding:4px 8px;">
                      <input type="text" name="${k}" value="${
                      v ?? ''
                    }" style="width:100%;">
                    </td>
                  </tr>`
                  }
                })
                .join('')

              document.getElementById('compareLeftContent').innerHTML = `
                <div style="font-size:1.1rem; margin-bottom:8px;"><b>MKF MASTER</b></div>
                <form id="mkfMasterEditForm">
                  <table style="border-collapse:collapse; background:#fff; border:1px solid #eee; font-size:1rem; width:100%;">
                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                  <div style="margin-top:16px; text-align:right;">
                    <button type="submit" id="mkfMasterSaveBtn" style="margin-right:8px;">저장</button>
                    <button type="button" id="mkfMasterCancelBtn">취소</button>
                  </div>
                </form>
              `

              document.getElementById('mkfMasterEditForm').onsubmit =
                async function (e) {
                  e.preventDefault()
                  const password = prompt('저장하려면 암호를 입력하세요.')
                  if (password !== '2233') {
                    alert('암호가 올바르지 않습니다.')
                    return
                  }
                  const formData = new FormData(e.target)
                  const updateData = {}
                  for (const [k, v] of formData.entries()) {
                    if (!readonlyFields.includes(k)) updateData[k] = v
                  }
                  if (updateData.passport_number) {
                    if (updateData.passport_number.length > 9) {
                      alert('passport_number의 길이는 최대 9자리여야 합니다.')
                      return
                    }
                  }
                  if (
                    updateData.passport_name == null ||
                    updateData.passport_name == undefined ||
                    updateData.passport_name.trim() === ''
                  ) {
                    alert('passport_name을 입력하세요.')
                    return
                  }
                  const simPrice = Number(updateData.sim_price)
                  const depositAmount = Number(updateData.deposit_amount)
                  const balance = Number(updateData.balance)
                  if (
                    !isNaN(simPrice) &&
                    !isNaN(depositAmount) &&
                    !isNaN(balance)
                  ) {
                    if (simPrice !== depositAmount + balance) {
                      alert(
                        'sim_price는 deposit_amount + balance와 같아야 합니다.'
                      )
                      return
                    }
                  }
                  // id가 없으면 insert, 있으면 update
                  try {
                    let res
                    if (updateData.id && updateData.id !== '') {
                      // update
                      res = await fetch(`/api/records/${updateData.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                      })
                    } else {
                      // insert (id 필드 제거)
                      delete updateData.id
                      res = await fetch('/api/records', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updateData)
                      })
                    }
                    if (res.ok) {
                      alert('저장되었습니다.')
                    } else {
                      alert('저장 실패')
                    }
                  } catch (err) {
                    alert('저장 중 오류 발생')
                  }
                }

              document.getElementById('mkfMasterCancelBtn').onclick =
                function () {
                  document.getElementById('compareLeftContent').innerHTML = ''
                }
              return
            } catch (err) {
              document.getElementById('compareLeftContent').innerHTML =
                '<div style="color:#888; margin-top:24px;">MKF MASTER 조회 중 오류 발생</div>'
            }
          })
        })
      }

      if (document.getElementById('errorPrevBtn')) {
        document.getElementById('errorPrevBtn').onclick = () => {
          if (currentPage > 1) {
            currentPage--
            renderTable(currentPage)
          }
        }
      }
      if (document.getElementById('errorNextBtn')) {
        document.getElementById('errorNextBtn').onclick = () => {
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
    .getElementById('errorSearchBtn')
    .addEventListener('click', function () {
      const filters = {
        commit_date: document.getElementById('search_commit_date').value,
        passport_number: document.getElementById('search_passport_number')
          .value,
        nationality: document.getElementById('search_nationality').value,
        passport_name: document.getElementById('search_passport_name').value,
        error_code: document.getElementById('search_error_code').value
      }
      loadErrorData(filters)
    })

  loadErrorData({
    commit_date: todayStr,
    nationality: 'Cambodia',
    error_code: 'E'
  })
})
