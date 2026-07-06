function toggleView() {
  const views = ["day", "week", "month"];
  const currentIndex = views.indexOf(currentView);
  currentView = views[(currentIndex + 1) % views.length];
  renderTimeline();
  updateViewIcon();
}

function changeView(view) {
  currentView = view;

  // Обновляем активную кнопку
  document
    .querySelectorAll(".timeline-nav .nav-icon")
    .forEach((el) => el.classList.remove("active"));
  const viewMap = {
    day: "viewDayBtn",
    week: "viewWeekBtn",
    month: "viewMonthBtn",
  };
  const activeBtn = document.getElementById(viewMap[view]);
  if (activeBtn) activeBtn.classList.add("active");

  renderTimeline();
  updateViewTitle();
}

function updateViewIcon() {
  const icon = document.getElementById("viewIcon");
  if (!icon) return;

  if (currentView === "day") {
    icon.innerHTML = `
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
        `;
  } else if (currentView === "week") {
    icon.innerHTML = `
            <rect x="3" y="3" width="18" height="4" rx="1"/>
            <rect x="3" y="10" width="18" height="4" rx="1"/>
            <rect x="3" y="17" width="18" height="4" rx="1"/>
        `;
  } else {
    icon.innerHTML = `
            <rect x="3" y="3" width="18" height="18" rx="1"/>
            <path d="M3 9h18"/>
            <path d="M3 15h18"/>
        `;
  }
}
