document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 참조
  const nationalitySelect = document.getElementById("nationality");
  const visaTypeSelect = document.getElementById("visaType");
  const commitTypeSelect = document.getElementById("commitType");
  const commitStatusSelect = document.getElementById("commitStatus");
  // 단일 날짜 입력 필드를 시작일과 종료일로 변경
  const commitDateFromInput = document.getElementById("commitDateFrom");
  const commitDateToInput = document.getElementById("commitDateTo");
  const clearDateButton = document.getElementById("clearDate");
  const recordsList = document.getElementById("records-list");
  const totalRecordsElement = document.getElementById("totalRecords");
  const listView = document.getElementById("list-view");
  const detailView = document.getElementById("detail-view");
  const detailContent = document.getElementById("detail-content");
  const searchButton = document.getElementById("searchButton");
  const excelInputButton = document.getElementById("excelInputButton");
  const depositCheckButton = document.getElementById("depositCheckButton");
  const resetButton = document.getElementById("resetButton");
  const nameFilter = document.getElementById("nameFilter");
  const passportFilter = document.getElementById("passportFilter");
  const phoneFilter = document.getElementById("phoneFilter");
  const loanPrePrioritySelect = document.getElementById("loanPrePriority");
  const phoneTypeSelect = document.getElementById("phoneType");
  const containerDiv = document.querySelector(".container"); // 상단 컨테이너
  //const depositDateElement = document.getElementById("depositDate");

  let currentRecord = null; // 전역 변수로 선언
  // 오늘 날짜를 YYMMDD 형식으로 변환
  const today = new Date();
  const formattedDate = today
    .toISOString()
    .slice(2, 10) // YYYY-MM-DD에서 YY-MM-DD 추출
    .replace(/-/g, ""); // 하이픈 제거

  // commitDateFrom과 commitDateTo에 기본값 설정
  // document.getElementById("commitDateFrom").value = formattedDate;
  document.getElementById("commitDateTo").value = formattedDate;

  // 초기화 함수
  function resetToDefault() {
    nationalitySelect.value = "전체";
    visaTypeSelect.value = "전체";
    commitStatusSelect.value = "전체";
    commitDateFromInput.value = "";
    commitDateToInput.value = "";
    nameFilter.value = "";
    passportFilter.value = "";
    phoneFilter.value = "";
    loanPrePrioritySelect.value = "전체";
    phoneTypeSelect.value = "전체";
    //depositDateElement.value = "";
    //loadRecords();
  }

  // 날짜 포맷팅 함수
  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}${month}${day}`;
  }

  // 목록 데이터 로드
  async function loadRecords() {
    try {
      const params = new URLSearchParams();
      // ID 필드 값 가져오기
      const idFilter = document.getElementById("idFilter"); // ID 입력 필드
      const idValue = idFilter ? idFilter.value.trim() : "";

      if (idValue) {
        // ID 값이 있으면 ID로만 조회
        params.append("id", idValue);
      } else {
        if (nationalitySelect && nationalitySelect.value !== "전체") {
          params.append("nationality", nationalitySelect.value);
        }
        if (nameFilter && nameFilter.value !== "") {
          params.append("passport_name", nameFilter.value);
        }
        if (passportFilter && passportFilter.value !== "") {
          params.append("passport_number", passportFilter.value);
        }
        if (commitDateFromInput.value.trim()) {
          params.append("commitDateFrom", commitDateFromInput.value.trim());
        }
        if (commitDateToInput.value.trim()) {
          params.append("commitDateTo", commitDateToInput.value.trim());
        }
        //if (depositDateElement.value.trim()) {
        //params.append("depositDate", depositDateElement.value.trim());
        //}
      }
      console.log("params:", params.toString());

      const response = await fetch(`/api/records?${params.toString()}`);
      const data = await response.json();

      console.log("API 응답 데이터:", data);

      if (Array.isArray(data) && data.length > 0) {
        recordsList.innerHTML = data
          .map(
            (record) => `
                      <tr onclick="showDetail(${record.id})">
                          <td>${record.id}</td>
                          <td>${record.nationality}</td>
                          <td>${record.passport_name}</td>
                          <td>${record.visa_type}</td>
                          <td>${record.passport_number}</td>
                          <td>${
                            record.phone_type == 1
                              ? "아이폰"
                              : record.phone_type == 2
                              ? "갤럭시"
                              : record.phone_type == 3
                              ? "기타"
                              : "-"
                          }</td>
                          <td>${record.sim_price}</td>
                          <td>${record.balance}</td>                          
                          <td>${
                            record.loan_pre_priority == 1
                              ? "우선희망"
                              : record.loan_pre_priority == 2
                              ? "희망"
                              : record.loan_pre_priority == 3
                              ? "안함"
                              : "-"
                          }</td>
                          <td>${record.entry_date}</td>
                          <td>${record.tel_number_kor}</td>
                      </tr>
                  `
          )
          .join("");
      } else {
        recordsList.innerHTML =
          '<tr><td colspan="7">데이터가 없습니다.</td></tr>';
      }

      totalRecordsElement.textContent = data.length;
    } catch (error) {
      console.error("데이터 로드 중 오류:", error);
      alert("데이터를 불러오는데 실패했습니다.");
      totalRecordsElement.textContent = "0";
    }
  }

  // 날짜 필드 초기화 기능 추가
  if (clearDateButton) {
    clearDateButton.addEventListener("click", () => {
      commitDateFromInput.value = "";
      commitDateToInput.value = "";
    });
  }

  // 상세 정보 표시 함수
  window.showDetail = async (id) => {
    try {
      const response = await fetch(`/api/records/${id}`);
      if (!response.ok) throw new Error("데이터를 불러오는데 실패했습니다.");

      currentRecord = await response.json();

      const fieldMappings = {
        id: "ID",
        nationality: "Nationality (국적)",
        passport_name: "Name (이름)",
        visa_type: "Visa Type (비자유형)",
        passport_number: "Passport Number (여권번호)",
        phone_type: "Phone Type (폰종류)",
        sim_price: "SIM Price ($) (유심비($))",
        deposit_amount: "입금할 금액($)",
        loan_pre_priority: "Loan Preference (대출구분)",
        entry_date: "Entry Date (한국입국날짜)",
        tel_number_cam: "Phone Number (Cambodia) (전화번호(캄보디아))",
        tel_number_kor: "Phone Number (Korea) (전화번호(대한민국))",
        commit_date: "Commit Date (확약일자)",
        format_name: "Format Name (서식명)",
        commit_id: "Commit ID (확약Id)",
        commit_status: "Commit Status (확약상태)",
        signature: "Signature (서명)",
        sender_name: "Sender Name (발송자명)",
        sender_email: "Sender Email (발송자 이메일)",
        sent_date: "Sent Date (발송일)",
        participant_email: "Participant Email (참여자 이메일)",
        additional_information: "Additional Information (추가정보)",

        // commit_name: "Commit Name (확약명)",
        // commit_type: "Commit Type (확약종류)",
        // signature_order: "Signature Order (서명순서)",
        // completion_date: "Completion Date (완료일)",
        // participant_name: "Participant Name (참여자명)",
        // participant_mobile_phone: "Participant Mobile Phone (참여자 핸드폰)",
        // tel_number: "Phone Number (전화번호)",
        // visa_number: "Visa Number (비자 번호)",
        // committer_name: "Committer Name (성명)",
      };
      console.log("currentRecord:", currentRecord);

      console.log("fieldMappings:", fieldMappings);

      // Object.keys(currentRecord).forEach((key) => {
      //   if (!fieldMappings[key]) {
      //     console.warn(`fieldMappings에 누락된 키: ${key}`);
      //   }
      // });
      const nationalityOptions = [
        "All(전체)",
        "Cambodia(캄보디아)",
        "Nephal(네팔)",
        "Vietnam(베트남)",
        "Phillippine(필리핀)",
        "Thailand(태국)",
        "Mongolia(몽골)",
        "Indonesia(인도네시아)",
        "Sri Lanka(스리랑카)",
        "Uzbekistan(우즈베키스탄)",
        "Pakistan(파키스탄)",
        "Myanmar(미얀마)",
        "Kyrgyzstan(키르기스스탄)",
        "Bangladesh(방글라데시)",
        "East Timor(동티모르)",
        "Laos(라오스)",
        "China(중국)",
      ];

      const visaTypeOptions = ["E9", "E8"];

      const readonlyFields = [
        "id",
        "format_name",
        "commit_id",
        "format_name",
        //"commit_type",
        "commit_status",
        //"signature_order",
        "sender_name",
        "sender_email",
        "sent_date",
        //"completion_date",
      ];

      // 상단 요소들 숨기기
      //containerDiv.style.display = "none";

      // 검색 필드 숨기기
      // const searchFields = document.getElementById("search-fields");
      // if (searchFields) {
      //   searchFields.style.display = "none";
      // }
      // 날짜 필드 정리 함수
      const cleanDateField = (dateValue) => {
        if (!dateValue) return null;
        // 숫자, -, :, space, .만 남기고 초 뒤의 소수점 이하 값 제거
        const cleanedValue = dateValue.replace(/[^0-9-: .]/g, "").split(".")[0];
        // 날짜와 시간 사이에 공백 추가
        if (cleanedValue.includes(":") && !cleanedValue.includes(" ")) {
          return cleanedValue.replace(
            /(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/,
            "$1 $2"
          );
        }
        // 초 뒤의 소수점 이하 값 유지
        return (
          cleanedValue.split(".")[0] + (dateValue.includes(".") ? ".99" : "")
        );
      };

      // 날짜 필드 정리
      [
        "sent_date",
        //"completion_date",
        "commit_date",
        "entry_date",
        //"deposit_date",
      ].forEach((key) => {
        if (currentRecord[key]) {
          currentRecord[key] = cleanDateField(currentRecord[key]);
        }
      });
      // field_update 필드 제거
      delete currentRecord.field_update;

      const filteredRecord = {};
      Object.keys(fieldMappings).forEach((key) => {
        filteredRecord[key] =
          currentRecord[key] !== undefined ? currentRecord[key] : "-";
      });

      // 상세 정보 화면 표시
      detailView.classList.remove("hidden");
      listView.classList.add("hidden");
      console.log("detailView:", detailView);
      console.log("listView:", listView);
      detailContent.innerHTML = `
                 <table>
    <tbody>
      ${Object.entries(filteredRecord)
        .map(
          ([key, value]) => `
          <tr>
            <td>${fieldMappings[key]}</td>
            <td>${value !== null && value !== undefined ? value : "-"}</td>
          </tr>
        `
        )
        .join("")}
    </tbody>
  </table>
              `;
      // "목록" 버튼 이벤트 리스너 - 둘 다 같은 기능을 하도록 설정
      document
        .getElementById("backToListButton")
        .addEventListener("click", backToList);
      document
        .getElementById("backToListButton2")
        .addEventListener("click", backToList);

      // 목록으로 돌아가는 함수
      function backToList() {
        detailView.classList.add("hidden");
        listView.classList.remove("hidden");

        // 상단 요소들 다시 표시
        containerDiv.style.display = "block";

        // 검색 필드 다시 표시
        if (searchFields) {
          searchFields.style.display = "block";
        }
      }

      // 저장 버튼 이벤트 리스너
      document
        .getElementById("saveButton")
        .addEventListener("click", async () => {
          try {
            // 암호 입력 요청
            const password = prompt("암호를 입력하십시오:");
            if (password === null) {
              // 사용자가 Cancel을 눌렀을 경우
              alert("작업이 취소되었습니다.");
              return;
            }
            if (password !== "2233") {
              alert("잘못된 암호입니다. 저장이 취소되었습니다.");
              return;
            }
            const formData = new FormData(
              document.getElementById("detailForm")
            );
            const updatedData = {};
            formData.forEach((value, key) => {
              if (
                [
                  "commit_date",
                  "sent_date",
                  //"completion_date",
                  "entry_date",
                  //"deposit_date",
                ].includes(key)
              ) {
                updatedData[key] = cleanDateField(value);
              } else if (key === "loan_pre_priority") {
                updatedData[key] = Number(value);
              } else if (key === "phone_type") {
                updatedData[key] = Number(value);
              } else {
                updatedData[key] = value.trim() === "" ? null : value;
              }
            });

            console.log("수정 데이터:", updatedData);

            const response = await fetch(`/api/records/${currentRecord.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedData),
            });

            if (!response.ok) throw new Error("수정 실패");

            alert("수정이 완료되었습니다.");
          } catch (error) {
            console.error("수정 중 오류:", error);
            alert("수정에 실패했습니다.");
          }
        });
    } catch (error) {
      console.error("상세 정보 로드 중 오류:", error);
      alert("상세 정보를 불러오는데 실패했습니다.");
    }
  };

  // 초기화 버튼 클릭 이벤트
  resetButton.addEventListener("click", resetToDefault);

  // 조회 버튼 클릭 이벤트
  searchButton.addEventListener("click", loadRecords);
});
