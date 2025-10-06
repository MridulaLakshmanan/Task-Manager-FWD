// ==== GLOBAL VARIABLES ====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
let weeklyChart, categoryChart, analyticsWeeklyChart, analyticsCategoryChart;

// ==== NAVIGATION ====
const navItems = document.querySelectorAll(".sidebar li");
const sections = document.querySelectorAll(".section");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    navItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    sections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(item.dataset.section).classList.add("active");

    updateUI();
  });
});

// ==== TASK FORM ====
document.getElementById("task-form").addEventListener("submit", e => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;
  const category = document.getElementById("category").value.trim() || "General";

  if (!title) return alert("Task title is required!");

  const task = {
    id: Date.now(),
    title,
    description,
    dueDate,
    priority,
    category,
    completed: false,
  };

  tasks.push(task);
  saveData();
  e.target.reset();
  updateUI();
});

// ==== FILTER CATEGORIES DYNAMICALLY ====
function populateCategoryFilter() {
  const select = document.getElementById("filterCategory");
  const categories = ["All", ...new Set([...tasks, ...completedTasks].map(t => t.category))];
  select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ==== RENDER TASKS ====
function renderTasks() {
  const list = document.getElementById("task-list");
  list.innerHTML = "";

  let filtered = filterTasks(tasks);

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    if (isOverdue) card.style.border = "2px solid #e74c3c";

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || ""}</p>
      <div class="task-meta">
        <span class="tag">#${task.category}</span>
        <span class="tag">Due ${task.dueDate || "N/A"}</span>
      </div>
      <span class="priority ${task.priority}">${task.priority}</span>
      <input type="checkbox" class="complete-checkbox" ${task.completed ? "checked" : ""}>
      <button class="delete-task">Delete</button>
    `;

    card.querySelector(".complete-checkbox").addEventListener("change", e => {
      task.completed = e.target.checked;
      if (task.completed) {
        completedTasks.push(task);
        tasks = tasks.filter(t => t.id !== task.id);
      } else {
        tasks.push(task);
        completedTasks = completedTasks.filter(t => t.id !== task.id);
      }
      saveData();
      updateUI();
    });

    card.querySelector(".delete-task").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      completedTasks = completedTasks.filter(t => t.id !== task.id);
      saveData();
      updateUI();
    });

    list.appendChild(card);
  });
}

// ==== RENDER COMPLETED TASKS ====
function renderCompleted() {
  const list = document.getElementById("completed-list");
  list.innerHTML = "";

  completedTasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card completed";

    card.innerHTML = `
      <h3>${task.title}</h3>
      <p>${task.description || ""}</p>
      <div class="task-meta">
        <span class="tag">#${task.category}</span>
        <span class="tag">Due ${task.dueDate || "N/A"}</span>
      </div>
      <span class="priority ${task.priority}">${task.priority}</span>
      <input type="checkbox" checked>
      <button class="delete-task">Delete</button>
    `;

    card.querySelector(".delete-task").addEventListener("click", () => {
      completedTasks = completedTasks.filter(t => t.id !== task.id);
      saveData();
      updateUI();
    });

    list.appendChild(card);
  });
}

// ==== FILTERS ====
function filterTasks(list) {
  const search = document.getElementById("search").value.toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const priority = document.getElementById("filterPriority").value;

  return list.filter(task => {
    return (
      (task.title.toLowerCase().includes(search) ||
       task.description.toLowerCase().includes(search)) &&
      (category === "All" || task.category === category) &&
      (priority === "All" || task.priority === priority)
    );
  });
}

document.getElementById("search").addEventListener("input", updateUI);
document.getElementById("filterCategory").addEventListener("change", updateUI);
document.getElementById("filterPriority").addEventListener("change", updateUI);

// ==== DASHBOARD PROGRESS ====
function updateProgress() {
  const total = tasks.length + completedTasks.length;
  const done = completedTasks.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("progress-text").innerText =
    `${done}/${total} tasks completed (${percent}%)`;
  document.getElementById("progress-bar").style.width = `${percent}%`;
}

// ==== CHARTS ====
function renderCharts() {
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const data = [0,0,0,0,0,0,0];

  completedTasks.forEach(task => {
    const day = new Date(task.dueDate).getDay();
    if (!isNaN(day)) data[day] += 1;
  });

  let categoryCounts = {};
  completedTasks.forEach(task => {
    categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
  });

  // Dashboard charts update
  if (weeklyChart) { weeklyChart.data.datasets[0].data = data; weeklyChart.update(); }
  else { weeklyChart = new Chart(document.getElementById("weeklyChart"), {type:"bar", data:{labels:days,datasets:[{label:"Tasks Completed",data,backgroundColor:"#000"}]}, options:{plugins:{legend:{display:false}}}}); }

  if (categoryChart) { categoryChart.data.labels = Object.keys(categoryCounts); categoryChart.data.datasets[0].data = Object.values(categoryCounts); categoryChart.update(); }
  else { categoryChart = new Chart(document.getElementById("categoryChart"), {type:"doughnut", data:{labels:Object.keys(categoryCounts),datasets:[{data:Object.values(categoryCounts),backgroundColor:["#3dbdb5","#f39c12","#e74c3c","#6ab04c","#9b59b6"]}]}}); }

  if (analyticsWeeklyChart) { analyticsWeeklyChart.data.datasets[0].data = data; analyticsWeeklyChart.update(); }
  else { analyticsWeeklyChart = new Chart(document.getElementById("analyticsWeeklyChart"), {type:"bar", data:{labels:days,datasets:[{label:"Tasks Completed",data,backgroundColor:"#000"}]}, options:{plugins:{legend:{display:false}}}}); }

  if (analyticsCategoryChart) { analyticsCategoryChart.data.labels = Object.keys(categoryCounts); analyticsCategoryChart.data.datasets[0].data = Object.values(categoryCounts); analyticsCategoryChart.update(); }
  else { analyticsCategoryChart = new Chart(document.getElementById("analyticsCategoryChart"), {type:"doughnut", data:{labels:Object.keys(categoryCounts),datasets:[{data:Object.values(categoryCounts),backgroundColor:["#3dbdb5","#f39c12","#e74c3c","#6ab04c","#9b59b6"]}]}}); }
}

// ==== SAVE DATA ====
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("completedTasks", JSON.stringify(completedTasks));
}

// ==== UPDATE UI ====
function updateUI() {
  populateCategoryFilter();
  renderTasks();
  renderCompleted();
  updateProgress();
  renderCharts();
}


// ==== INITIAL LOAD ====
updateUI();
