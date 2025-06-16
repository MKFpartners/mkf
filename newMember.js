import React, { useState } from 'react'
import * as XLSX from 'xlsx'

function NewMember () {
  const [password, setPassword] = useState('')
  const [isAuth, setIsAuth] = useState(false)
  const [file, setFile] = useState(null)

  const handlePassword = e => setPassword(e.target.value)

  const checkPassword = () => {
    // 실제 환경에서는 서버에서 검증해야 함
    if (password === '2233') setIsAuth(true)
    else alert('암호가 일치하지 않습니다.')
  }

  const handleFile = e => setFile(e.target.files[0])

  const handleUpload = async () => {
    if (!file) return alert('파일을 선택하세요.')

    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

    let total = 0,
      success = 0,
      fail = 0

    for (let i = 1; i < rows.length; i++) {
      // 1행은 헤더
      const [id, passport_name, gender, birth_date] = rows[i]
      total++
      try {
        const res = await fetch('/api/new_members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, passport_name, gender, birth_date })
        })
        if (res.ok) success++
        else fail++
      } catch {
        fail++
      }
    }
    alert(`총건수: ${total}, 정상건수: ${success}, 오류건수: ${fail}`)
  }

  return (
    <div>
      {!isAuth ? (
        <div>
          <input
            type='password'
            value={password}
            onChange={handlePassword}
            placeholder='암호 입력'
          />
          <button onClick={checkPassword}>확인</button>
        </div>
      ) : (
        <div>
          <input type='file' accept='.xlsx,.xls' onChange={handleFile} />
          <button onClick={handleUpload}>업로드</button>
        </div>
      )}
    </div>
  )
}

export default NewMember
