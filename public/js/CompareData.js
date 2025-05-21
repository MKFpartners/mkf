document.getElementById('compareButton').addEventListener('click', function () {
  document.getElementById('compareModal').style.display = 'flex'
  // 아래에 데이터 로딩 로직을 추가할 수 있습니다.
  document.getElementById('compareLeftContent').innerHTML = ''
  document.getElementById('compareRightContent').innerHTML = ''
})
