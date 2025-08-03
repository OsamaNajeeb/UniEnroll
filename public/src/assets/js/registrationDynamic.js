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
// confirmBtn.onclick = function () {
//   alert("Changes accepted!"); // Replace with your actual accept logic
//   modal.style.display = "none";
// };

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
  <td>
    ${
      reg.status === "Registered"
        ? `<a href="#" class="button small drop-course-btn" data-id="${reg._id}">Drop</a>`
        : "N/A"
    }
  </td>
`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".drop-course-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      const confirmDrop = confirm("Are you sure you want to drop this course?");
      if (!confirmDrop) return;

      try {
        const res = await fetch(`/api/registrations/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
          alert("Course dropped successfully!");
          loadRegistrations(); // Refresh the table
        } else {
          alert("Failed to drop course: " + data.error);
        }
      } catch (err) {
        alert("Network error: " + err.message);
      }
    };
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

  document.querySelectorAll(".add-course-btn").forEach((btn) => {
    btn.onclick = async (e) => {
      e.preventDefault();
      const courseCode = btn.closest("tr").children[0].textContent;

      try {
        const res = await fetch("/api/registrations/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: localStorage.getItem("username"),
            courseCode,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          alert("Course added successfully!");
          modal.style.display = "none";
          loadRegistrations(); // Refresh main table
        } else {
          alert("Failed to add course: " + data.error);
        }
      } catch (err) {
        alert("Network error: " + err.message);
      }
    };
  });
}
