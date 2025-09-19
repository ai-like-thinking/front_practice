const calendar = document.getElementById("calendar");
const selectedDate = document.getElementById("selectedDate");
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

// ✅ LocalStorage 데이터
let tasksByDate = JSON.parse(localStorage.getItem("tasksByDate")) || {};
let currentDate = null;

// 날짜 포맷 함수 (YYYY-MM-DD)
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 오늘 날짜
const today = new Date();
const todayKey = formatDateKey(today);

// 연휴 기간 (2025-09-02 ~ 2025-10-11)
const holidayStart = new Date(2025, 9, 3);   // 10월 3일
const holidayEnd   = new Date(2025, 9, 12);  // 10월 12일

// 시작일 & 종료일 지정
const startDate = new Date(2025, 8, 22);  // 9월 22일
const endDate   = new Date(2025, 9, 13);  // 10월 13일

// 달력 생성
function generateCalendar() {
  calendar.innerHTML = "";

  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  weekdays.forEach(dayName => {
    const w = document.createElement("div");
    w.classList.add("weekday");
    w.textContent = dayName;
    calendar.appendChild(w);
  });

  let date = new Date(startDate);
  const firstDay = date.getDay();
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  while (date <= endDate) {
    const dateKey = formatDateKey(date);

    const day = document.createElement("div");
    day.classList.add("day");
    day.textContent = date.getDate();

    // ✅ 요일 강조
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) day.classList.add("sunday");
    if (dayOfWeek === 6) day.classList.add("saturday");

    // ✅ 연휴 강조
    if (date >= holidayStart && date <= holidayEnd) {
      day.classList.add("holiday");
    }

    // 날짜 클릭 이벤트
    day.addEventListener("click", () => {
      currentDate = dateKey;
      document.querySelectorAll(".day").forEach(el => el.classList.remove("selected"));
      day.classList.add("selected");
      selectedDate.textContent = `📅 ${dateKey}의 할 일 목록`;
      renderTasks(dateKey);
    });

    // dataset에 날짜키 저장 (자동 선택할 때 찾아쓰기 쉽게)
    day.dataset.dateKey = dateKey;

    calendar.appendChild(day);
    date.setDate(date.getDate() + 1);
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

// 할 일 추가
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
  renderTasks(currentDate);
  renderAllTasks();
});

// 전체 할 일 렌더링 (날짜순)
function renderAllTasks() {
  const allTasks = document.getElementById("allTasks");
  allTasks.innerHTML = "";

  const dates = Object.keys(tasksByDate).sort((a, b) => new Date(a) - new Date(b));

  if (dates.length === 0) {
    allTasks.innerHTML = "<li>아직 할 일이 없습니다.</li>";
    return;
  }

  dates.forEach(date => {
    tasksByDate[date].forEach((taskObj, index) => {
      const li = document.createElement("li");
      li.textContent = `${date} : ${taskObj.text}`;
      if (taskObj.done) li.classList.add("done");

      li.addEventListener("click", () => {
        taskObj.done = !taskObj.done;
        saveTasks();
        renderAllTasks();
      });

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

// 실행
generateCalendar();
renderAllTasks();

// ✅ 오늘 날짜 자동 선택 (범위 밖이면 startDate 선택)
(function selectDefaultDate() {
  let defaultDate;
  if (today >= startDate && today <= endDate) {
    defaultDate = todayKey;        // 오늘
  } else {
    defaultDate = formatDateKey(startDate); // 시작일
  }
  currentDate = defaultDate;

  const targetDay = document.querySelector(`.day[data-date-key="${defaultDate}"]`);
  if (targetDay) {
    targetDay.classList.add("selected");
    selectedDate.textContent = `📅 ${defaultDate}의 할 일 목록`;
    renderTasks(defaultDate);
  }
})();
