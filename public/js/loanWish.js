import { fetchLoanPriorityData } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  const recordsList = document.getElementById("records-list");
  const totalRecordsElement = document.getElementById("totalRecords");

  if (!recordsList || !totalRecordsElement) {
    console.error("필요한 DOM 요소가 존재하지 않습니다.");
    return;
  }

  fetchLoanPriorityData()
    .then((data) => {
      console.log(data);

      if (data.length > 0) {
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
        totalRecordsElement.textContent = data.length;
      } else {
        recordsList.innerHTML =
          '<tr><td colspan="11">데이터가 없습니다.</td></tr>';
      }
    })
    .catch((error) => {
      console.error("Error fetching loan priority records:", error);
    });
});