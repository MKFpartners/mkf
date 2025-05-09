// Import from Deposit Check Button Click Event
document.getElementById("depositCheckButton").addEventListener("click", () => {
  const password = prompt("암호를 입력하십시오:");
  if (password === null) {
    // 사용자가 Cancel을 눌렀을 경우
    alert("작업이 취소되었습니다.");
    return;
  }
  if (password !== "2233") {
    alert("잘못된 암호입니다. 작업이 취소되었습니다.");
    return;
  }
  const fileInput = document.getElementById("depositCheckInput");
  if (fileInput) {
    fileInput.click();
  } else {
    console.error("파일 입력 요소를 찾을 수 없습니다.");
  }
});

// File Selection Event
document
  .getElementById("depositCheckInput")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("파일이 선택되지 않았습니다.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet);

          // 누락된 데이터가 있는 행을 필터링
          const filteredRows = rows.filter((row) => {
            const depositAmount = row["입금액(원)"];
            if (!depositAmount) {
              console.log("누락된 데이터가 있는 행을 건너뜁니다:", row);
              return false; // 누락된 데이터가 있는 행은 제외
            }
            return true;
          });
          // SQL 업데이트 쿼리 생성
          const updates = filteredRows.map((row) => {
            const senderOrReceiver = row["보낸분/받는분"];
            const depositAmount = row["입금액(원)"];
            const transactionDate = row["거래일시"];
            const branch = row["처리점"];
            return `
UPDATE mkf_master
SET 
    deposit_amount = ${depositAmount},
    deposit_date = '${transactionDate}',
    branch = '${branch}',
    balance = sim_price - ${depositAmount}
WHERE 
    passport_name = '${senderOrReceiver}' 
    AND id = (
        SELECT MAX(id) 
        FROM mkf_master 
        WHERE passport_name = '${senderOrReceiver}'
        AND field_update IS NOT NULL
    );    
`;
          });

          console.log("Generated SQL Updates:", updates.join("\n"));
          await executeUpdates(updates);
        } catch (error) {
          console.error("엑셀 파일 처리 중 오류:", error);
          alert("엑셀 파일을 처리하는 중 오류가 발생했습니다.");
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader 오류:", error);
        alert("파일을 읽는 중 오류가 발생했습니다.");
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("파일 처리 중 오류:", error);
      alert("파일 처리 중 오류가 발생했습니다.");
    }
  });

async function executeUpdates(updates) {
  try {
    const response = await fetch("http://localhost:3000/execute-query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queries: updates }),
    });

    console.log("서버 응답 상태:", response.status); // 응답 상태 코드 확인

    if (!response.ok) {
      console.error("서버 응답 오류:", response.status, response.statusText);
      alert(`서버 오류: ${response.statusText}`);
      return;
    }

    const message = await response.text();
    alert(message);
  } catch (error) {
    console.error("Error executing updates:", error);
    alert("서버와의 통신 중 오류가 발생했습니다.");
  }
}
