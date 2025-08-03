const username = localStorage.getItem("username"); // assuming you stored this on login

async function loadRegistrations() {
  const res = await fetch(`/api/courseview/${username}`);
  const data = await res.json();

  const tbody = document.querySelector("table tbody");
  tbody.innerHTML = ""; // clear the existing hardcoded rows

  data.forEach((reg) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
  <td>${reg.courseCode}</td>
  <td>${reg.courseName}</td>
  <td>${reg.credits}</td>
  <td>${reg.instructor}</td>
`;
    tbody.appendChild(tr);
  });
}

window.onload = loadRegistrations;
