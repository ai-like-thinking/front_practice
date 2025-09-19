const calendar = document.getElementById("calendar");
const selectedDate = document.getElementById("selectedDate");
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// ✅ LocalStorage 데이터
let tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};
let currentDate = null;

// 연휴 기간 (2025-09-02 ~ 2025-10-11)
const holidayStart = new Date(2025, 9, 3);   // 10월(8) 3일
const holidayEnd   = new Date(2025, 9, 12);  // 10월(9) 12일

// 시작일 & 종료일 지정
const startDate = new Date(2025, 8, 22);  // 9월(월=8) 22일
const endDate   = new Date(2025, 9, 13);  // 10월(월=9) 11일

// 달력 생성 (특정 기간)
function generateCalendar() {
  calendar.innerHTML = "";

  // 요일 헤더 (일월화수목금토 순서)
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  weekdays.forEach(dayName => {
    const w = document.createElement("div");
    w.classList.add("weekday");
    w.textContent = dayName;
    calendar.appendChild(w);
  });

  // 시작 요일 맞추기 (일요일=0 기준)
  let date = new Date(startDate);
  const firstDay = date.getDay(); // 일요일=0, 월요일=1 ...
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

while (date <= endDate) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dateKey = `${y}-${m}-${d}`;

  const day = document.createElement("div");
  day.classList.add("day");
  day.textContent = d;

  // ✅ 요일 색상 강조
  const dayOfWeek = date.getDay(); // 0=일요일, 6=토요일
  if (dayOfWeek === 0) day.classList.add("sunday");
  if (dayOfWeek === 6) day.classList.add("saturday");

    // ✅ 연휴 강조 (holidayStart~holidayEnd 범위 안에 있으면 holiday 클래스 추가)
  if (date >= holidayStart && date <= holidayEnd) {
    day.classList.add("holiday");
  }

  day.addEventListener("click", () => {
    currentDate = dateKey;
    document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
    day.classList.add("selected");
    selectedDate.textContent = `📅 ${dateKey}의 할 일 목록`;
    renderTasks(dateKey);
  });

  calendar.appendChild(day);
  date.setDate(date.getDate() + 1);

    // ✅ 오늘 날짜 자동 선택 표시
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
    if (dateKey === todayKey) {
      currentDate = dateKey;
      day.classList.add("selected");
      selectedDate.textContent = `📅 ${dateKey}의 할 일 목록`;
      renderTasks(dateKey);  
}
}



// 할 일 렌더링
function renderTasks(date) {
  taskList.innerHTML = "";
  if (!tasksByDate[date] || tasksByDate[date].length === 0) {
    taskList.innerHTML = "<li>할 일이 없습니다.</li>";
    return;
  }

  tasksByDate[date].forEach((taskObj, index) => {
    const li = document.createElement("li");
    li.textContent = taskObj.text;
    if (taskObj.done) li.classList.add("done");

    li.addEventListener("click", () => {
      taskObj.done = !taskObj.done;
      saveTasks();
      renderTasks(date);
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "삭제";
    delBtn.style.marginLeft = "10px";
    delBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      tasksByDate[date].splice(index, 1);
      saveTasks();
      renderTasks(date);
    });

    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

// ✅ 기존 할 일 추가 함수에서 마지막에 renderAllTasks 실행
addBtn.addEventListener("click", () => {
  if (!currentDate) {
    alert("날짜를 먼저 선택하세요!");
    return;
  }

  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  if (!tasksByDate[currentDate]) tasksByDate[currentDate] = [];
  tasksByDate[currentDate].push({ text: taskText, done: false });

  taskInput.value = "";
  saveTasks();
  renderTasks(currentDate);  // 기존 개별 날짜 목록
  renderAllTasks();          // 전체 목록 갱신
});

// 전체 할 일 렌더링 (날짜순 정렬)
function renderAllTasks() {
  const allTasks = document.getElementById("allTasks");
  allTasks.innerHTML = "";

  // 날짜 키 추출 + 정렬
  const dates = Object.keys(tasksByDate).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  if (dates.length === 0) {
    allTasks.innerHTML = "<li>아직 할 일이 없습니다.</li>";
    return;
  }

  dates.forEach(date => {
    tasksByDate[date].forEach((taskObj, index) => {
      const li = document.createElement("li");
      li.textContent = `${date} : ${taskObj.text}`;
      if (taskObj.done) li.classList.add("done");

      // 완료 토글
      li.addEventListener("click", () => {
        taskObj.done = !taskObj.done;
        saveTasks();
        renderAllTasks();
      });

      // 삭제 버튼
      const delBtn = document.createElement("button");
      delBtn.textContent = "삭제";
      delBtn.style.marginLeft = "10px";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        tasksByDate[date].splice(index, 1);
        saveTasks();
        renderAllTasks();
      });

      li.appendChild(delBtn);
      allTasks.appendChild(li);
    });
  });
}

// LocalStorage 저장
function saveTasks() {
  localStorage.setItem("tasksByDate", JSON.stringify(tasksByDate));
}

// 실행 시 전체 목록도 표시
generateCalendar();
renderAllTasks();
