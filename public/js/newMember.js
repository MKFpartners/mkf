document.getElementById('newMember').addEventListener('click', async function() {
    const password = prompt('비밀번호를 입력하세요:');
    if (password !== '2233') {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
})
