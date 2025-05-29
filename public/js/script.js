// 비밀번호 확인 모달 관련 변수
const passwordModal = document.getElementById('password-modal')
const passwordInput = document.getElementById('password-input')
const confirmPasswordBtn = document.getElementById('confirm-password') // 주석 해제 및 오타 수정
const cancelPasswordBtn = document.getElementById('cancel-password')

// 저장 버튼 클릭 시 비밀번호 확인 모달 표시
document.getElementById('save-button').addEventListener('click', () => {
  passwordModal.classList.remove('hidden')
  passwordInput.value = ''
  passwordInput.focus()
})

try {
  const response = await fetch('/api/verify-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  })

  if (response.ok) {
    passwordModal.classList.add('hidden')
    // 비밀번호 확인 성공 후 저장 로직 실행
    saveChanges()
  } else {
    alert('비밀번호가 일치하지 않습니다.')
  }
} catch (error) {
  console.error('비밀번호 확인 중 오류 발생:', error)
  alert('비밀번호 확인 중 오류가 발생했습니다.')
}

// 취소 버튼 클릭 시
cancelPasswordBtn.addEventListener('click', () => {
  passwordModal.classList.add('hidden')
})

// 모달 외부 클릭 시 닫기
passwordModal.addEventListener('click', e => {
  if (e.target === passwordModal) {
    passwordModal.classList.add('hidden')
  }
})

// 저장 로직을 별도 함수로 분리
async function saveChanges () {
  console.log('script.js: 저장 로직이 비어있다')
  // ... existing save logic ...
}
