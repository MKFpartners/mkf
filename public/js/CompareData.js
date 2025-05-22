document.getElementById('compareButton').addEventListener('click', function () {
  document.getElementById('main-content').style.display = 'none'
  document.getElementById('compare-content').style.display = 'block'
  // 데이터 로딩 로직 추가 가능
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
  // 전체 body의 내용을 clear
  document.body.innerHTML = ''
  // 오늘 날짜 YY-MM-DD 포맷
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`

  // 국적 옵션
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

  // Compare 화면을 동적으로 생성
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
            <input type="text" id="search_commit_date" placeholder="commit_date" style="width:110px; margin-right:8px;" value="${todayStr}">            
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

  // 뒤로가기 버튼 이벤트
  document
    .getElementById('compareBackButton')
    .addEventListener('click', function () {
      window.location.reload() // 전체 페이지 새로고침(초기화면 복구)
    })

  // Set default values for the search fields after they are appended to the DOM
  document.getElementById('search_commit_date').value = todayStr
  document.getElementById('search_nationality').value = 'Cambodia'
  document.getElementById('search_error_code').value = 'E'

  // 검색 및 리스트 표시 함수
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
    // 기존 검색 결과 먼저 clear
    container.innerHTML = ''
    try {
      const res = await fetch(url)
      if (res.ok) {
        data = await res.json()
      }
    } catch (e) {
      data = []
    }

    // 결과 개수 표시
    const resultCountElem = document.getElementById('errorResultCount')
    if (resultCountElem) {
      resultCountElem.querySelector('strong').textContent = data.length
    }

    // 리스트 렌더링
    if (!data || data.length === 0) {
      container.innerHTML =
        '<div style="color:#888; text-align:center; margin-top:40px;">검색 결과가 없습니다.</div>'
      return
    }
    // 페이징 처리
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
                  row => `
                <tr>
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
    `
      // 네비게이션 버튼 이벤트
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

  // 검색 버튼 이벤트
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

  // 최초 전체 리스트 로딩 (오늘 날짜로 기본 검색)
  loadErrorData({
    commit_date: todayStr,
    nationality: 'Cambodia',
    error_code: 'E'
  })
})
