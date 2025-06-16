require('dotenv').config()
const express = require('express')
const { Pool } = require('pg')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000
const host = '0.0.0.0' // 모든 네트워크 인터페이스에서 접속 허용

// CORS 미들웨어 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.DB_USER || 'mkfpartners',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mkf',
  password: process.env.DB_PASSWORD || 'mkfpartners',
  port: process.env.DB_PORT || 5432
})

// 데이터베이스 연결 테스트
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err)
  } else {
    console.log('데이터베이스 연결 성공:', res.rows[0])
  }
})

// 정적 파일 제공 설정
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

// 기본 경로 처리
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// 서버 상태 확인용 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ip: req.ip,
    headers: req.headers
  })
})

//상세 정보 조회
app.get('/api/records/:id', async (req, res) => {
  console.log(
    'Received request for app.get(/api/records/:id with query:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'check_view'
  try {
    const { id } = req.params
    const query = `SELECT * FROM ${table} WHERE id = $1`
    console.log('id 상세조회 query:', query, 'params:', [id]) // 쿼리문과 파라미터 출력
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
      res.status(404).json({ error: '데이터를 찾을 수 없습니다.' })
      return
    }

    const record = result.rows[0]

    res.json(record)
  } catch (err) {
    console.error('Error in /api/records/:id:', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})
// mkf_master 테이블에서 passport_number로 조회하는 API
// NEW: mkf_master 테이블에서 passport_number로만 조회하는 전용 API
app.get('/api/mkf-master-by-passport', async (req, res) => {
  console.log(
    'Received request for app.get(/api/records/:mkf-master-by-passport:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'check_view'
  try {
    const { passport_number } = req.query // Use req.query for query parameters

    if (!passport_number) {
      return res
        .status(400)
        .json({ error: 'passport_number는 필수 파라미터입니다.' })
    }

    const query = `
      SELECT * FROM ${table} 
      WHERE passport_number = $1      
    `
    console.log(
      '${table} 조회 (by passport_number only) query:',
      query,
      'params:',
      [passport_number]
    )
    const result = await pool.query(query, [passport_number])

    if (result.rows.length === 0) {
      res.status(404).json({ error: '데이터를 찾을 수 없습니다.' })
      return
    }

    res.json(result.rows[0]) // assuming only one record is expected for a unique passport number
  } catch (err) {
    console.error('Error in /api/mkf-master-by-passport:', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})
app.get('/api/records/passport/:passport_number', async (req, res) => {
  console.log(
    'Received request for app.get(/api/records/passport/:passport_number with query:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'check_view'
  try {
    const { passport_number } = req.params
    const query = `SELECT * FROM ${table} WHERE passport_number = $1`
    console.log('passport_number 조회 query:', query, 'params:', [
      passport_number
    ]) // 쿼리문과 파라미터 출력
    const result = await pool.query(query, [passport_number])

    if (result.rows.length === 0) {
      res.status(404).json({ error: '데이터를 찾을 수 없습니다.' })
      return
    }

    const record = result.rows[0]

    res.json(record)
  } catch (err) {
    console.error('Error in /api/records/:passport_number:', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})
// 전체 목록 또는 필터링된 목록 조회
app.get('/api/records', async (req, res) => {
  console.log(
    'Received request for app.get(/api/records with query:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'mkf_master'
  try {
    console.log('서버에서 수신한 request:', req.query) // 요청 로깅
    const {
      id = null,
      nationality = 'Cambodia',
      name = '',
      passport_number = '',
      visa_type = '전체',
      commitDateFrom = null,
      commitDateTo = null
    } = req.query

    let query = `SELECT * FROM ${table}`
    let conditions = []
    let values = []
    let paramCount = 1
    const search_type = req.query.search_type
    const mkf_status = req.query.mkf_status

    console.log('search_type:=', search_type) // search_type 로깅
    // // 미입금 조회 search_type =2, deposit_amount = 0
    // if (search_type == 2) {
    //   conditions.push(`deposit_amount = 0`)
    // } else if (search_type == 1) {
    //   conditions.push(`balance = 0`)
    // }
    function addCondition (field, value, operator = '=') {
      if (value && value !== '전체' && value !== 'All') {
        conditions.push(`${field} ${operator} $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    function parseAndValidateDate (dateString) {
      if (!/^\d{6}$/.test(dateString)) return null

      const year = parseInt('20' + dateString.substring(0, 2))
      const month = dateString.substring(2, 4)
      const day = dateString.substring(4, 6)

      if (isValidDate(year, month, day)) {
        return `${year}-${month}-${day}`
      }
      return null
    }

    function isValidDate (year, month, day) {
      const date = new Date(`${year}-${month}-${day}`)
      return (
        date.getFullYear() === parseInt(year) &&
        date.getMonth() + 1 === parseInt(month) &&
        date.getDate() === parseInt(day)
      )
    }

    function addCondition (field, value, operator = '=') {
      if (value && value !== '전체' && value !== 'All') {
        conditions.push(`${field} ${operator} $${paramCount}`)
        values.push(value)
        paramCount++
      }
    }

    if (id) {
      addCondition('id', id)
    } else if (passport_number) {
      addCondition('passport_number', passport_number)
    } else {
      addCondition('passport_name', name)
      //addCondition('passport_number', passport_number)
      addCondition('visa_type', visa_type)

      if (nationality && nationality !== 'All') {
        addCondition('nationality', nationality)
      }

      if (commitDateFrom) {
        const dateStr = parseAndValidateDate(commitDateFrom)
        if (dateStr) {
          conditions.push(`DATE(commit_date) >= $${paramCount}`)
          values.push(dateStr)
          paramCount++
        }
      }

      if (commitDateTo) {
        const dateStr = parseAndValidateDate(commitDateTo)
        if (dateStr) {
          conditions.push(`DATE(commit_date) <= $${paramCount}`)
          values.push(dateStr)
          paramCount++
        }
      }

      if (
        mkf_status !== undefined &&
        mkf_status !== null &&
        mkf_status !== '' &&
        !isNaN(Number(mkf_status))
      ) {
        conditions.push(`mkf_status = $${paramCount}`)
        values.push(Number(mkf_status))
        paramCount++
      }
    }
    console.log('search_type:', search_type) // search_type 로깅
    if (search_type == 1) {
      console.log('Executing deposit sum query select_type = 1...')
      // 입금조회일 경우 합계 데이터를 포함한 쿼리
      query = `
        SELECT 
        id, nationality, passport_name, visa_type, passport_number, sim_price, 
        deposit_amount, balance, loan_pre_priority, entry_date, tel_number_kor,
        NULL AS deposit_sum
        FROM ${table}
        ${
          conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ') + ' AND balance = 0'
            : 'WHERE balance = 0'
        }
        UNION ALL
        SELECT 
          NULL AS id,
          NULL AS nationality,
          NULL AS passport_name,
          NULL AS visa_type,
          NULL AS passport_number,
          NULL AS sim_price,
          NULL AS deposit_amount,
          NULL AS balance,
          NULL AS loan_pre_priority,
          NULL AS entry_date,
          NULL AS tel_number_kor,
          SUM(deposit_amount) AS deposit_sum
        FROM ${table}
        ${
          conditions.length > 0
            ? 'WHERE ' + conditions.join(' AND ') + ' AND balance = 0'
            : 'WHERE balance = 0'
        }
        ORDER BY id DESC
      `
    } else if (search_type == 2) {
      // 미입금만 조회 (balance != 0 조건 포함)
      query = `
    SELECT id, nationality, passport_name, visa_type, passport_number, phone_type, 
    sim_price, deposit_amount, balance, loan_pre_priority, entry_date, tel_number_kor
    FROM ${table}
    ${
      conditions.length > 0
        ? 'WHERE ' + conditions.join(' AND ') + ' AND balance != 0'
        : 'WHERE balance != 0'
    }
    ORDER BY id DESC
  `
    } else if (search_type == 3) {
      // 대출요청
      query = `
    SELECT id, nationality, passport_name, visa_type, passport_number, phone_type, 
    sim_price, deposit_amount, balance, loan_pre_priority, entry_date, tel_number_kor
    FROM ${table}
    ${
      conditions.length > 0
        ? 'WHERE ' + conditions.join(' AND ') + " AND visa_type = 'E9'"
        : "WHERE visa_type = 'E9'"
    }
    ORDER BY id DESC
  `
    } else if (search_type == 0) {
      // 전체 조회
      query = `
    SELECT id, nationality, passport_name, visa_type, passport_number, phone_type, 
    sim_price, deposit_amount, balance, loan_pre_priority, entry_date, tel_number_kor
    FROM ${table}
    ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
    ORDER BY id DESC
  `
    }
    // ★ 조건이 없으면 values도 비워야 함
    if (conditions.length === 0) {
      values = []
    }
    if (!query.includes('$1')) {
      values = []
    }

    console.log('서버의 query:', query, 'with values:', values) // 쿼리 로깅
    const result = await pool.query(query, values)
    console.log(`Found ${result.rows.length} records`) // 결과 로깅
    console.log('Generated query:', query)
    console.log('Query parameters1:', values)
    res.json(result.rows)
  } catch (err) {
    console.error('Error in /api/records:', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})

// ID로 업데이트하는 라우트를 먼저 정의
app.put('/api/records/id/:id', async (req, res) => {
  console.log(
    'Received request for app.put(/api/records/id:id with query:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'mkf_master'
  try {
    const { id } = req.params
    const updateData = req.body
    console.log('server.js Received updateData:', updateData)
    // 날짜 필드 정리 및 검증
    ;[
      'commit_date',
      'sent_date',
      'completion_date',
      'entry_date',
      'deposit_date',
      'opening_date'
    ].forEach(key => {
      if (updateData[key]) {
        // 밀리초(. 이후) 먼저 제거
        updateData[key] = updateData[key].split('.')[0]
        // 숫자, -, :, space만 남기고 초 뒤의 잘못된 값을 제거
        updateData[key] = updateData[key]
          .replace(/[^0-9-: ]/g, '')
          .split('.')[0]
        // 날짜와 시간 사이에 공백 추가
        if (updateData[key].includes(':') && !updateData[key].includes(' ')) {
          updateData[key] = updateData[key].replace(
            /(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/,
            '$1 $2'
          )
        }
        // PostgreSQL의 ISO, YMD 형식에 맞게 값 검증
        const isValidDate = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(
          updateData[key]
        )
        if (!isValidDate) {
          console.error(
            `Invalid date format for field ${key}: ${updateData[key]}`
          )
          updateData[key] = null // 잘못된 값은 null로 설정
        }
      }
    })

    // ID는 수정 불가
    delete updateData.id

    // visa_type 기본값 설정
    if (!updateData.visa_type) {
      updateData.visa_type = 'E8' // 기본값
    }

    // phone_type 기본값 설정
    if (updateData.phone_type === undefined || updateData.phone_type === null) {
      updateData.phone_type = 0 // 기본값
    } else {
      updateData.phone_type = Number(updateData.phone_type) // 숫자로 변환
    }

    // loan_pre_priority 기본값 설정
    if (
      updateData.loan_pre_priority === undefined ||
      updateData.loan_pre_priority === null
    ) {
      updateData.loan_pre_priority = 0 // 기본값
    }

    // loan_pre_priority 값을 숫자로 변환
    if (updateData.loan_pre_priority !== undefined) {
      updateData.loan_pre_priority = Number(updateData.loan_pre_priority)
      console.log('loan_pre_priority = ' + updateData.loan_pre_priority)
    }

    // tel_number_cam 및 tel_number_kor 처리
    if (!updateData.tel_number_cam) {
      updateData.tel_number_cam = null // 값이 없으면 null로 설정
    }
    if (!updateData.tel_number_kor) {
      updateData.tel_number_kor = null // 값이 없으면 null로 설정
    }

    // mkf_status 기본값 설정
    if (updateData.mkf_status === undefined || updateData.mkf_status === null) {
      updateData.mkf_status = 0 // 기본값
    } else {
      updateData.mkf_status = Number(updateData.mkf_status) // 숫자로 변환
    }
    // 업데이트할 필드와 값 생성
    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')
    const values = Object.values(updateData)
    console.log('values = ', values)
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `
    console.log('query = ', query)
    const result = await pool.query(query, [id, ...values])

    if (result.rows.length === 0) {
      console.log('CANNOT FIND ID =', id)
      return res.status(404).json({ error: '데이터를 찾을 수 없습니다.' })
    }

    console.log('Record updated for ID:', id)
    res.json(result.rows[0])
  } catch (err) {
    console.error('Error in updating record:', err)
    res.status(500).json({ error: err.message || '서버 오류가 발생했습니다.' })
  }
})

// passport_number로 업데이트하는 라우트는 나중에 정의
app.put('/api/records/passport/:passport_number', async (req, res) => {
  console.log(
    'Received request for app.put(/api/records/passport:passport_number with query:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'mkf_master'
  try {
    const { passport_number } = req.params
    const updateData = req.body
    console.log('server.js Received updateData:', updateData)
    ;[
      // 날짜/시간 필드 목록
      'commit_date',
      'sent_date',
      'completion_date',
      'entry_date',
      'deposit_date',
      'opening_date'
    ].forEach(key => {
      if (updateData[key] === '' || updateData[key] === undefined) {
        updateData[key] = null
      }
    })
    // passport_number 수정 불가
    delete updateData.passport_number

    // 업데이트할 필드와 값 생성

    const setClause = Object.keys(updateData)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ')
    const values = Object.values(updateData)
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE passport_number = $1
      RETURNING *
    `
    console.log('update query by passport => ', query)
    console.log('values = ', values)

    const result = await pool.query(query, [passport_number, ...values])

    if (result.rows.length === 0) {
      console.log('CANNOT FIND PASSPORT_NUMBER =', passport_number)
      return res
        .status(404)
        .json({ error: '업데이트할 데이터를 찾을 수 없습니다.' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error('Error in updating record by passport_number:', err)
    res.status(500).json({ error: err.message || '서버 오류가 발생했습니다.' })
  }
})

// server.js
app.post('/api/download/all', async (req, res) => {
  console.log(
    'Received request for app.post(/api/download/all with body:',
    req.body
  )
  const jobGubun = req.body.jobGubun || 'M'
  const keys = req.body.keys || []
  if (!Array.isArray(keys) || keys.length === 0) return res.json([])
  let sql, result
  if (jobGubun === 'E') {
    sql = `SELECT * FROM error_table WHERE passport_number = ANY($1)`
    result = await pool.query(sql, [keys])
  } else {
    sql = `SELECT * FROM mkf_master WHERE id = ANY($1::int[])`
    result = await pool.query(sql, [keys.map(Number)])
  }
  res.json(result.rows)
})

// 예시: server.js 또는 app.js
app.get('/api/error-data', async (req, res) => {
  console.log(
    'Received request for app.get(/api/error-data with query:',
    req.query
  )
  // 쿼리 파라미터 추출
  const {
    commit_date,
    nationality,
    error_code,
    passport_number,
    passport_name
  } = req.query
  // SQL 쿼리 작성 (필요에 따라 동적 where절 생성)
  let sql = 'SELECT * FROM error_table WHERE 1=1'
  const params = []
  if (commit_date && commit_date.trim() !== '') {
    sql += ' AND commit_date::date = $' + (params.length + 1)
    params.push(commit_date)
  }
  if (nationality && nationality !== 'All') {
    sql += ' AND nationality = $' + (params.length + 1)
    params.push(nationality)
  }
  if (error_code) {
    sql += ' AND error_code = $' + (params.length + 1)
    params.push(error_code)
  }
  if (passport_number) {
    sql += ' AND passport_number = $' + (params.length + 1)
    params.push(passport_number)
  }
  if (passport_name) {
    sql += ' AND passport_name = $' + (params.length + 1)
    params.push(passport_name)
  }
  sql += ' ORDER BY commit_date DESC'

  console.log('Generated SQL:', sql)
  console.log('Query parameters2:', params)

  // DB에서 데이터 조회 (pg 예시)
  try {
    const result = await pool.query(sql, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
// SQL 쿼리 실행 API
app.post('/api/records', async (req, res) => {
  console.log(
    'Received request for app.post(/api/records with query:',
    req.query
  )
  const { jobGubun } = req.query
  const table = jobGubun === 'E' ? 'error_table' : 'mkf_master'

  try {
    const data = req.body

    // null, undefined, ''가 아닌 값만 추출
    const keys = Object.keys(data).filter(
      k => data[k] !== null && data[k] !== undefined && data[k] !== ''
    )
    if (keys.length === 0) {
      return res.status(400).json({ error: '입력 데이터가 없습니다.' })
    }

    const columns = keys.map(k => `"${k}"`).join(', ')
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ')
    const values = keys.map(k => data[k])

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING id`
    console.log('Generated SQL:', sql)
    // pool로 변경 (pg Pool 사용)
    const { rows } = await pool.query(sql, values)

    res.status(200).json({ success: true, insertId: rows[0]?.id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'DB 저장 중 오류 발생' })
  }
})
app.post('/execute-query', async (req, res) => {
  console.log(
    'Received request for app.post(/execute-query with body:',
    req.body
  )
  const { queries } = req.body // 여러 쿼리를 배열로 받음
  let errorCount = 0
  let errorList = []
  const results = []
  //const client = await pool.connect() // 트랜잭션을 위해 클라이언트 연결
  //---------------------------------

  for (const query of queries) {
    try {
      await pool.query(query)
      results.push({ status: 'success' })
    } catch (err) {
      results.push({ status: 'fail', error: err.message })
      errorCount++
      // errorList.push({
      //   error_code: err.code || 'UNKNOWN',
      //   message: err.message
      // })
    }
  }
  // 쿼리 실행 후 각 테이블의 건수 조회
  const [mkfResult, errorResult] = await Promise.all([
    pool.query(
      'SELECT COUNT(*) FROM mkf_master WHERE commit_date::date = CURRENT_DATE'
    ),
    pool.query(
      'SELECT COUNT(*) FROM error_table WHERE commit_date::date = CURRENT_DATE'
    )
  ])
  const mkfCount = mkfResult.rows[0].count
  const errorTableCount = errorResult.rows[0].count
  if (errorCount > 0) {
    res.status(207).json({
      result: 'partial_fail',
      error_count: errorCount,
      errors: errorList,
      mkf_master_count: mkfCount,
      error_table_count: errorTableCount,
      results // ← 추가!
    })
  } else {
    res.json({
      result: 'success',
      error_count: 0,
      mkf_master_count: mkfCount,
      error_table_count: errorTableCount,
      results // ← 추가!
    })
  }
})

// 개통 정보 업데이트 API
app.post('/api/records/update-opening', async (req, res) => {
  let successCount = 0
  let errorTableCount = 0

  try {
    const { passport_name, passport_number, tel_number_kor } = req.body

    let query = `
      SELECT update_master_opening_enhanced ($1, $2, $3);      
    `
    let result = await pool.query(query, [
      passport_name,
      passport_number,
      tel_number_kor
    ])
    console.log('opening passport_number = ', passport_number)
    if (result.rows.length > 0) {
      console.log('SUCCESSFULLY UPDATED - PASSPORT_NUMBER =', passport_number)
      successCount++
    } else {
      console.log(
        'FAILED TO update_master_opening PASSPORT_NUMBER =',
        passport_number
      )
      errorTableCount++
    }

    res.json({
      success: true,
      message: '처리가 완료되었습니다.',
      statistics: {
        successCount,
        errorTableCount
      }
    })
  } catch (err) {
    console.error('Error in /api/records/update-opening:', err)
    res.status(500).json({ error: '서버 오류가 발생했습니다.' })
  }
})

// new_members API 엔드포인트
app.post('/api/name-list', async (req, res) => {
  const { id, passport_name, gender, date_of_birth } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO new_members (id, passport_name, gender, date_of_birth) VALUES ($1, $2, $3, $4, $5)',
      [id, passport_name, gender, date_of_birth]
    )
    res.json({ success: true })
  } catch (error) {
    console.error('Error inserting new_Members:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/new-members', async (req, res) => {
  const { date } = req.query

  try {
    const result = await pool.query(
      'SELECT * FROM new_members WHERE name_list_date = $1 ORDER BY id',
      [date]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching name list:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.patch('/api/name-list/:id', async (req, res) => {
  const { id } = req.params
  const { signyn } = req.body

  try {
    const result = await pool.query(
      'UPDATE new_members SET signyn = $1 WHERE id = $2',
      [signyn, id]
    )
    res.json({ success: true })
  } catch (error) {
    console.error('Error updating sign YN:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 에러 핸들링 미들웨어 추가
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: '서버 오류가 발생했습니다.' })
})

app.listen(port, host, () => {
  console.log(`서버가 http://${host}:${port} 에서 실행 중입니다.`)
  console.log('환경 설정:', {
    nodeEnv: process.env.NODE_ENV,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT
  })
})
