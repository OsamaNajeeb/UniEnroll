// Get modal elements
const modal = document.getElementById("myModal");
const addBtn = document.getElementById("addCourse");
const closeBtn = document.getElementsByClassName("close")[0];
const confirmBtn = document.getElementById("confirmAccept");
const cancelBtn = document.getElementById("cancelAccept");

// When user clicks Accept button, open modal
addBtn.onclick = function () {
  loadAvailableCourses();
  modal.style.display = "block";
};

// When user clicks on (x), close modal
closeBtn.onclick = function () {
  modal.style.display = "none";
};

// When user clicks Cancel button in modal, close modal
cancelBtn.onclick = function () {
  modal.style.display = "none";
};

// When user clicks Confirm button in modal
confirmBtn.onclick = function () {
  alert("Changes accepted!"); // Replace with your actual accept logic
  modal.style.display = "none";
};

// When user clicks anywhere outside modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

const username = localStorage.getItem("username"); // assuming you stored this on login

async function loadRegistrations() {
  const res = await fetch(`/api/registrations/${username}`);
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
						<td>${reg.status}</td>
						<td><a href="#" class="button small ${
              reg.status === "Registered" ? "" : "disabled"
            }">${reg.status === "Registered" ? "Drop" : "N/A"}</a></td>
					`;
    tbody.appendChild(tr);
  });
}

window.onload = loadRegistrations;

async function loadAvailableCourses() {
  const res = await fetch("/api/courses");
  const courses = await res.json();

  const modalTableBody = document.querySelector("#myModal table tbody");
  modalTableBody.innerHTML = ""; // Clear any existing rows

  courses.forEach((course) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course.courseCode}</td>
      <td>${course.courseName}</td>
      <td>${course.credits}</td>
      <td>${course.instructor}</td>
      <td><a href="#" class="button small add-course-btn" data-id="${course._id}">Add</a></td>
    `;
    modalTableBody.appendChild(row);
  });

  // Optional: add click event to handle "Add"
  document.querySelectorAll(".add-course-btn").forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const courseCode = btn.closest("tr").children[0].textContent;
      console.log("Add course:", courseCode);
      // Optional: send a request to register
    };
  });
}
