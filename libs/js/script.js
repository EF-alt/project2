// pre loader

$(window).on("load", function () {
  $("#preloader")
    .delay(500)
    .fadeOut("slow", function () {
      $(this).remove();
    });
});

// Search bar key up function

$("#searchInp").on("keyup", function () {
  let searchValue = $(this).val().toLowerCase();

  $("#personnelTableBody tr").filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
  });

  $("#departmentTableBody tr").filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
  });

  $("#locationTableBody tr").filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(searchValue) > -1);
  });
});

$("#refreshBtn").click(function () {
  $("#loadingSpinner").show();
  if ($("#personnelBtn").hasClass("active")) {
    fetchPersonnelData();
  } else if ($("#departmentsBtn").hasClass("active")) {
    fetchDepartmentData();
  } else {
    fetchLocationData();
  }
});

// Fetch personnel data

function fetchPersonnelData() {
  $.ajax({
    url: "libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        const personnelData = response.data;
        const tableBody = $("#personnelTableBody");

        tableBody.empty();

        personnelData.forEach((person) => {
          const row = `
              <tr id="${person.id}">
                <td>${person.lastName}, ${person.firstName}</td>
                <td>${person.email}</td>
                <td>${person.department}</td>
                <td>${person.location}</td>
                <td class="text-end text-nowrap">
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>
            `;
          tableBody.append(row);
        });
      } else {
        console.error(
          "Failed to fetch personnel data:",
          response.status.description
        );
      }
    },
    error: function (error) {
      console.error("Error in AJAX request:", error);
    },
    complete: function () {
      $("#loadingSpinner").delay(500).fadeOut("slow");
    },
  });
}
$(document).ready(fetchPersonnelData);

// Fetch department data

function fetchDepartmentData() {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    cache: false,
    success: function (response) {
      if (response.status.code === "200") {
        let data = response.data;
        let tableBody = $("#departmentTableBody");

        tableBody.empty();
        let displayedDepartment = new Set();

        data.forEach(function (item) {
          let departmentName = item.department;
          let locationName = item.location;
          let id = item.departmentID;
          if (!displayedDepartment.has(departmentName)) {
            displayedDepartment.add(departmentName);
            let row = `<tr>
                        <td>${departmentName}</td>
                        <td>${locationName}</td>
                        <td class="align-middle text-end text-nowrap">
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${id}">
                                <i class="fa-solid fa-pencil fa-fw"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${id}">
                                <i class="fa-solid fa-trash fa-fw"></i>
                            </button>
                        </td>
                    </tr>`;

            tableBody.append(row);
          }
        });
      } else {
        console.log("Error: " + response.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error in AJAX request:", textStatus, errorThrown);
    },
    complete: function () {
      $("#loadingSpinner").delay(500).fadeOut("slow");
    },
  });
}
$(document).ready(fetchDepartmentData);

// Fetch location data

function fetchLocationData() {
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        let locationData = response.data;
        let tableBody = $("#locationTableBody");

        tableBody.empty();
        let displayedLocations = new Set();

        locationData.forEach(function (location) {
          const locationZone = location.locationName;
          const locationID = location.locationId;
          if (!displayedLocations.has(locationZone)) {
            displayedLocations.add(locationZone);

            let row = `<tr>
                        <td>${locationZone}</td>
                        <td class="text-end text-nowrap">
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${locationID}">
                            <i class="fa-solid fa-pencil fa-fw"></i>
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="${locationID}">
                            <i class="fa-solid fa-trash fa-fw"></i>
                        </button>
                        </td>
                        </tr>`;

            tableBody.append(row);
          }
        });
      } else {
        console.log("Error: " + response.status.description);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error in AJAX request:", textStatus, errorThrown);
    },
    complete: function () {
      $("#loadingSpinner").delay(500).fadeOut("slow");
    },
  });
}
$(document).ready(fetchLocationData);

// If personnel tab is active it enables the filter btn
function checkActiveTab() {
  if ($("#personnelBtn").hasClass("active")) {
    $("#filterBtn").prop("disabled", false);
  } else {
    $("#filterBtn").prop("disabled", true);
  }
}
$(document).ready(function () {
  checkActiveTab();
});

// Detects when a tab is clicked and acts accordingly
$(".nav-tabs .nav-link").on("click", function () {
  if ($(this).attr("id") === "personnelBtn") {
    // Enable filter button when on Personnel tab
    $("#filterBtn").prop("disabled", false);
  } else {
    // Disable filter button when on Departments or Locations tab
    $("#filterBtn").prop("disabled", true);
  }
});

// Open modal if user is on personnel tab and its enabled
$("#filterBtn").click(function () {
  if (!$(this).prop("disabled")) {
    $("#filterModal").modal("show");
    populateDepartmentSelect($("#filterDepartment"));
    populateLocationSelect($("#filterLocation"));
  }
});

// Function to fill department select
function populateDepartmentSelect(selectId) {
  $.ajax({
    url: "libs/php/getAllDepartments.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        let departments = response.data;
        // console.log(departments);
        let departmentSelect = $(selectId);
        departmentSelect.empty();

        // Placeholder
        departmentSelect.append(
          '<option value="" disabled selected>Select a department</option>'
        );

        // Using Map to store unique values
        let uniqueDepartments = new Map();

        departments.forEach(function (item) {
          let departmentName = item.department;
          let departmentID = item.departmentID;

          if (!uniqueDepartments.has(departmentID)) {
            uniqueDepartments.set(departmentID, departmentName);
          }
          // console.log(uniqueDepartments);
        });

        // Convert map entries to an array and sort alphabetically
        let sortedDepartments = Array.from(uniqueDepartments.entries()).sort(
          function (a, b) {
            let nameA = a[1] || "";
            let nameB = b[1] || "";
            return nameA.localeCompare(nameB);
          }
        );

        // Append sorted array to select element
        sortedDepartments.forEach(function ([departmentID, departmentName]) {
          let option = `<option value=${departmentID}>${departmentName}</option>`;
          departmentSelect.append(option);
        });
      } else {
        console.log("Error: " + response.status.description);
      }
    },
    error: function (jqXHR) {
      console.log("Error in AJAX request: ", jqXHR.textStatus);
    },
  });
}

// Function to fill location select
function populateLocationSelect(selectId) {
  $.ajax({
    url: "libs/php/getAllLocations.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        let locations = response.data;
        let locationSelect = selectId;
        locationSelect.empty();

        locationSelect.append(
          '<option value="" disabled selected>Select a location</option>'
        );
        let uniqueLocations = new Map();

        locations.forEach(function (item) {
          let locationName = item.locationName;
          let locationId = item.locationId;

          if (!uniqueLocations.has(locationId)) {
            uniqueLocations.set(locationId, locationName);
          }
        });

        let sortedLocations = Array.from(uniqueLocations.entries()).sort(
          function (a, b) {
            let nameA = a[1] || "";
            let nameB = b[1] || "";
            return nameA.localeCompare(nameB);
          }
        );

        sortedLocations.forEach(function ([locationId, locationName]) {
          let option = `<option value=${locationId}>${locationName}</option>`;
          locationSelect.append(option);
        });

        /* locationSelect.append(
          '<option value="" disabled selected>Select a location</option>'
        );

        locations.forEach(function (item) {
          let locationName = item.locationName;
          let locationID = item.id;
          // displayedLocation.add(locationName);
          let option = `<option value="${locationID}">${locationName}</option>`;
          locationSelect.append(option);
        });
        // let sortedLocations = Array.from(displayedLocation).sort();

        /* sortedLocations.forEach(function (locationName) {
          let option = `<option value=${locationID}>${locationName}</option>`;
          locationSelect.append(option); 
        }); */
      } else {
        console.log("Error: " + response.status.description);
      }
    },
    error: function (jqXHR) {
      console.log("Error in AJAX request: ", jqXHR.textStatus);
    },
  });
}

$("#applyFilter").click(function () {
  const selectedDepartment = $("#filterDepartment").val();
  const selectedLocation = $("#filterLocation").val();

  // Ensure that all rows are shown initially
  $("#personnelTableBody tr").each(function () {
    const department = $(this).find("td:nth-child(3)").text().trim(); // Department column
    const location = $(this).find("td:nth-child(4)").text().trim(); // Location column

    // Show the row if it matches the selected department or location (or both)
    const matchesDepartment = !selectedDepartment || department === $("#filterDepartment option:selected").text();
    const matchesLocation = !selectedLocation || location === $("#filterLocation option:selected").text();

    // Toggle the row based on the matching criteria
    $(this).toggle(matchesDepartment && matchesLocation);
  });
});


let originalTableData = [];

// Fetching data for current state
function fetchTableData() {
  $.ajax({
    url: "libs/php/getAll.php",
    type: "GET",
    dataType: "json",
    success: function (response) {
      if (response.status.code === "200") {
        let data = response.data;
        originalTableData = data;
        populateTable(data);
      } else {
        console.log("Error: " + response.status.description);
      }
    },
    error: function (jqXHR) {
      console.log("Error in AJAX request:", jqXHR.textStatus);
    },
  });
}

// Populate personnel table

function populateTable(data) {
  let tableBody = $("#personnelTableBody");
  tableBody.empty();

  data.forEach(function (person) {
    let row = `<tr>
                    <td>${person.lastName}, ${person.firstName}</td>
                    <td>${person.email}</td>
                    <td>${person.department}</td>
                    <td>${person.location}</td>
                    <td class="text-end text-nowrap">
                      <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${person.id}">
                      <i class="fa-solid fa-pencil fa-fw"></i>
                      </button>
                      <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="${person.id}">
                      <i class="fa-solid fa-trash fa-fw"></i>
                      </button>
                    </td>
                </tr>`;
    tableBody.append(row);
  });
}

$(document).ready(function () {
  fetchTableData();
});

// Reset personnel table once cancel is clicked
$("#cancelFilter").click(function () {
  populateTable(originalTableData);
});

// Show modals depending on which tab the user is on
$("#addBtn").click(function () {
  if ($("#personnelBtn").hasClass("active")) {
    // Populate department select
    populateDepartmentSelect("#addPersonnelDepartment");
    // Show the modal
    $("#addPersonnelModal").modal("show");
  } else if ($("#locationsBtn").hasClass("active")) {
    $("#addLocationModal").modal("show");
  } else {
    populateLocationSelect($("#addDepartmentLocation"));
    $("#addDepartmentModal").modal("show");
  }
});

// Function to add new personnel
$("#savePersonnel").click(function (e) {
  e.preventDefault();

  const firstNameField = document.getElementById("addPersonnelFirstName");
  const lastNameField = document.getElementById("addPersonnelLastName");
  const departmentField = document.getElementById("addPersonnelDepartment");
  const jobTitleField = document.getElementById("addPersonnelJobTitle");
  const emailField = document.getElementById("addPersonnelEmailAddress");
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  let firstName = $("#addPersonnelFirstName").val();
  let lastName = $("#addPersonnelLastName").val();
  let jobTitle = $("#addPersonnelJobTitle").val();
  let email = $("#addPersonnelEmailAddress").val();
  let department = $("#addPersonnelDepartment").val();

  let isValid = true;

  // Validate first name
  if (!firstName) {
    firstNameField.classList.add("is-invalid");
    isValid = false;
  } else {
    firstNameField.classList.remove("is-invalid");
  }

  // Validate last name
  if (!lastName) {
    lastNameField.classList.add("is-invalid");
    isValid = false;
  } else {
    lastNameField.classList.remove("is-invalid");
  }

  // Validate email format
  if (!emailPattern.test(email)) {
    emailField.classList.add("is-invalid");
    isValid = false;
  } else {
    emailField.classList.remove("is-invalid");
  }

  // Validate job title
  if (!jobTitle) {
    jobTitleField.classList.add("is-invalid");
    isValid = false;
  } else {
    jobTitleField.classList.remove("is-invalid");
  }

  // Validate department
  if (!department) {
    departmentField.classList.add("is-invalid");
    isValid = false;
  } else {
    departmentField.classList.remove("is-invalid");
  }

  // If any of the fields are invalid, stop the submission
  if (!isValid) {
    return;
  }

  // All fields are valid, continue
  $.ajax({
    url: "libs/php/insertPersonnel.php",
    type: "POST",
    dataType: "json",
    data: {
      firstName: firstName,
      lastName: lastName,
      jobTitle: jobTitle,
      email: email,
      departmentID: department,
    },
    success: function (response) {
      if (response.status.code === "200") {
        let departmentName = $(
          "#addPersonnelDepartment option:selected"
        ).text();
        let newRow = `
        <tr>
          <td>${lastName}</td>
          <td>${firstName}</td>
          <td>${email}</td>
          <td>${departmentName}</td> 
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="23">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deletePersonnelModal" data-id="23">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
        `;
        fetchPersonnelData();
        $("#personnelTableBody").append(newRow);
        $("#addPersonnelModal").modal("hide");
        $("#saveMessageModal").modal("show");
      } else {
        alert("Error:" + response.status.description);
      }
    },
    error: function (jqXHR) {
      alert("AJAX error:" + jqXHR.text);
    },
  });
});

// Once edit button is clicked open personnel info
$("#editPersonnelModal").on("show.bs.modal", function (e) {
  const employeeID = $(e.relatedTarget).data("id"); // getting the id attribute from the button
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      id: employeeID,
    }),
    success: function (result) {
      if (result.status.code == 200) {
        const personnel = result.data.personnel[0];
        const departments = result.data.department;

        $("#editPersonnelEmployeeID").val(personnel.id);
        $("#editPersonnelFirstName").val(personnel.firstName);
        $("#editPersonnelLastName").val(personnel.lastName);
        $("#editPersonnelJobTitle").val(personnel.jobTitle);
        $("#editPersonnelEmailAddress").val(personnel.email);

        $("#editPersonnelDepartment").html("");

        departments.forEach(function (department) {
          $("#editPersonnelDepartment").append(
            $("<option>", {
              value: department.id,
              text: department.name,
            })
          );
        });

        $("#editPersonnelDepartment").val(personnel.departmentID);
      } else {
        $("#editPersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function () {
      $("#editPersonnelModal .modal-title").replaceWith(
        "Error retrieving data"
      );
    },
  });
});

// Delete personnel
$("#deletePersonnelModal").on("show.bs.modal", function (e) {
  const employeeID = $(e.relatedTarget).data("id"); // Get the id attribute from the button

  // Set the ID on the confirm button
  $("#confirmDeletePersonnelBtn").data("id", employeeID);

  // Fetch personnel details by ID
  $.ajax({
    url: "libs/php/getPersonnelByID.php",
    type: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({ id: employeeID }),
    success: function (result) {
      if (result.status.code == 200) {
        const firstName = result.data.personnel[0].firstName;
        const lastName = result.data.personnel[0].lastName;

        // Set the delete confirmation message
        $("#delPersonnelMsg").text(
          `Are you sure you want to delete ${firstName} ${lastName}?`
        );
      } else {
        $("#deletePersonnelModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("Error retrieving data");
    },
  });
});

// reset delete personnel data modal
$("#deletePersonnelModal").on("hidden.bs.modal", function () {
  $("#confirmDeletePersonnelBtn").removeData("id");
});

$("#confirmDeletePersonnelBtn").on("click", function () {
  const personnelId = $(this).data("id");

  // Send the request to delete the personnel
  $.ajax({
    url: "libs/php/deletePersonnelByID.php",
    type: "POST",
    contentType: "application/JSON",
    data: JSON.stringify({ id: personnelId }),
    success: function (result) {
      if (result.status.code == 200) {
        // Remove the personnel row from the table
        $(`#${personnelId}`).remove();
        // Hide the modal after deletion
        $("#deletePersonnelModal").modal("hide");
        fetchPersonnelData();
      } else {
        alert("Error deleting personnel");
      }
    },
    error: function () {
      alert("Error deleting personnel.");
    },
  });
});

//
$("#editPersonnelForm").on("submit", function (e) {
  e.preventDefault();

  const firstNameField = document.getElementById("editPersonnelFirstName");
  const lastNameField = document.getElementById("editPersonnelLastName");
  const departmentField = document.getElementById("editPersonnelDepartment");
  const jobTitleField = document.getElementById("editPersonnelJobTitle");
  const emailField = document.getElementById("editPersonnelEmailAddress");
  const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  const employeeID = $("#editPersonnelEmployeeID").val();
  const firstName = $("#editPersonnelFirstName").val();
  const lastName = $("#editPersonnelLastName").val();
  const jobTitle = $("#editPersonnelJobTitle").val();
  const email = $("#editPersonnelEmailAddress").val();
  const departmentID = $("#editPersonnelDepartment").val();

  let department = $("#editPersonnelDepartment").val();
  let isValid = true;
  // Validate first name
  if (!firstName) {
    firstNameField.classList.add("is-invalid");
    isValid = false;
  } else {
    firstNameField.classList.remove("is-invalid");
  }
  // Validate last name
  if (!lastName) {
    lastNameField.classList.add("is-invalid");
    isValid = false;
  } else {
    lastNameField.classList.remove("is-invalid");
  }
  // Validate email format
  if (!emailPattern.test(email)) {
    emailField.classList.add("is-invalid");
    isValid = false;
  } else {
    emailField.classList.remove("is-invalid");
  }
  // Validate job title
  if (!jobTitle) {
    jobTitleField.classList.add("is-invalid");
    isValid = false;
  } else {
    jobTitleField.classList.remove("is-invalid");
  }
  // Validate department
  if (!department) {
    departmentField.classList.add("is-invalid");
    isValid = false;
  } else {
    departmentField.classList.remove("is-invalid");
  }
  // If any of the fields are invalid, stop the submission
  if (!isValid) {
    return;
  }

  $.ajax({
    url: "libs/php/updatePersonnel.php",
    type: "POST",
    dataType: "json",
    data: {
      id: employeeID,
      firstName: firstName,
      lastName: lastName,
      jobTitle: jobTitle,
      email: email,
      departmentID: departmentID,
    },
    success: function (response) {
      if (response.status.code === "200") {
        // Hide the modal after saving
        $("#editPersonnelModal").modal("hide");
        $("#saveMessageModal").modal("show");
        fetchPersonnelData();
      } else {
        $("#editPersonnelModal").modal("hide");
        $("#saveMessageModal").modal("show");
      }
    },
    error: function () {
      alert("Error saving employee data.");
    },
  });
});

// Clear the input when the Add Location button is clicked
$("#addLocationModal").on("show.bs.modal", function () {
  $("#addLocation").val("");  
});

$("#addDepartmentModal").on("show.bs.modal", function () {
  $("#addDepartment").val("");
})


// Function to add new location
$("#saveLocation").click(function (e) {
  e.preventDefault();

  const locationField = document.getElementById("addLocation");
  let location = $("#addLocation").val();

  let isValid = true;
  // Validate location
  if (!location) {
    locationField.classList.add("is-invalid");
    isValid = false;
  } else {
    locationField.classList.remove("is-invalid");
  }
  if (!isValid) {
    return;
  }

  $.ajax({
    url: "libs/php/insertLocation.php",
    type: "POST",
    dataType: "json",
    data: {
      name: location,
    },
    success: function (response) {
      if (response.status.code === "200") {
        /* let newRow = `
        <tr>
          <td>${location}</td>
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="23">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteLocationModal" data-id="23">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
        `; 

        $("#locationTableBody").append(newRow); */
        fetchLocationData();
        $("#addLocationModal").modal("hide");
        $("#saveMessageModal").modal("show");
      } else {
        alert("Error:" + response.status.description);
      }
    },
    error: function (jqXHR) {
      alert("AJAX error:" + jqXHR.text);
    },
  });
});

$("#ContinueMessageBtn").click(function () {
  $("#saveMessageModal").modal("hide");
});

// Function to add new department

$("#saveDepartment").click(function (e) {
  e.preventDefault();

  const departmentField = document.getElementById("addDepartment");
  const locationField = document.getElementById("addDepartmentLocation");

  let department = $("#addDepartment").val();
  let locationID = $("#addDepartmentLocation").val();

  let isValid = true;
  // Validate department
  if (!department) {
    departmentField.classList.add("is-invalid");
    isValid = false;
  } else {
    departmentField.classList.remove("is-invalid");
  }
  // Validate location
  if (!locationID) {
    locationField.classList.add("is-invalid");
    isValid = false;
  } else {
    locationField.classList.remove("is-invalid");
  }
  if (!isValid) {
    return;
  }

  $.ajax({
    url: "libs/php/insertDepartment.php",
    type: "POST",
    dataType: "json",
    data: {
      name: department,
      locationID: locationID,
    },
    success: function (response) {
      if (response.status.code === "200") {
        fetchDepartmentData();
        const newDepartmentID = response.data.id;
        let newRow = `
        <tr>
          <td>${department}</td>
          <td>${$("#addDepartmentLocation option:selected").text()}</td> 
          <td class="text-end text-nowrap">
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${newDepartmentID}">
              <i class="fa-solid fa-pencil fa-fw"></i>
            </button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#deleteDepartmentModal" data-id="${newDepartmentID}">
              <i class="fa-solid fa-trash fa-fw"></i>
            </button>
          </td>
        </tr>
        `;

        $("#departmentTableBody").append(newRow);
        $("#addDepartmentModal").modal("hide");
        $("#saveMessageModal").modal("show");
      } else {
        alert("Error:" + response.status.description);
      }
    },
    error: function (jqXHR) {
      alert("AJAX error:" + jqXHR.text);
    },
  });
});

// Edit department
$("#editDepartmentModal").on("show.bs.modal", function (e) {
  const departmentID = $(e.relatedTarget).data("id"); // Get the id attribute from the button

  // Fetch department details by ID
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "POST",
    dataType: "json",
    data: { id: departmentID },
    success: function (result) {
      if (result.status.code == 200) {
        const department = result.data.department[0];
        const locations = result.data.locations;

        // Set department name and ID
        $("#editDepartmentID").val(department.id);
        $("#editDepartment").val(department.name);

        // Clear and populate the location select dropdown
        $("#editDepartmentLocation").html(""); // Clear any existing options

        locations.forEach(function (location) {
          // pre-select the option if location id's match
          const isSelected =
            department.locationID == location.id ? "selected" : "";
          $("#editDepartmentLocation").append(
            `<option value="${location.id}" ${isSelected}>${location.name}</option>`
          );
        });
      } else {
        $("#editDepartmentModal .modal-title").text("Error retrieving data");
      }
    },
    error: function () {
      alert("Error retrieving data");
    },
  });
});

// Save edit department
$("#saveEditDepartment").click(function (e) {
  e.preventDefault();

  const department = $("#editDepartment").val();
  const departmentID = $("#editDepartmentID").val();
  const locationID = $("#editDepartmentLocation").val();

  $.ajax({
    url: "libs/php/updateDepartment.php",
    type: "POST",
    dataType: "json",
    data: {
      name: department,
      id: departmentID,
      locationID: locationID,
    },
    success: function (response) {
      console.log(response);
      if (response.status.code === "200") {
        let locationName = $("#editDepartmentLocation option:selected").text();
        // Find the row and update it instead of appending a new one
        let row = $(`#departmentTableBody tr[data-id="${departmentID}"]`);
        row.find("td:nth-child(1)").text(department);
        row.find("td:nth-child(2)").text(locationName);

        fetchDepartmentData();
        $("#editDepartmentModal").modal("hide");
        $("#saveMessageModal").modal("show");
      } else {
        $("#editDepartmentModal .modal-title").text("Please edit");
      }
    },
  });
});

$("#deleteDepartmentModal").on("show.bs.modal", function (e) {
  const departmentID = $(e.relatedTarget).data("id"); // Get the id attribute from the button

  // Set the ID on the confirm button
  $("#confirmDeleteDepartmentBtn").data("id", departmentID);

  // Fetch department details by ID
  $.ajax({
    url: "libs/php/getDepartmentByID.php",
    type: "POST",
    dataType: "json",
    data: { id: departmentID },
    success: function (result) {
      if (result.status.code == 200) {
        const department = result.data.department[0].name;
        const employeeCount = result.data.department[0].employeeCount;

        if (employeeCount > 0) {
          $("#delDepartmentMsg").text(
            `You cannot delete the department '${department}' because it has ${employeeCount} employees assigned to it.`
          );
          $("#confirmDeleteDepartmentBtn").prop("disabled", true); // Disable delete button
        } else {
          $("#delDepartmentMsg").text(
            `Are you sure you want to delete ${department}?`
          );
          $("#confirmDeleteDepartmentBtn").prop("disabled", false); // Enable delete button
        }
      } else {
        $("#deleteDepartmentModal .modal-title").text("Error retrieving data");
      }
    },
    error: function () {
      alert("Error retrieving data");
    },
  });
});

$("#confirmDeleteDepartmentBtn").on("click", function () {
  const departmentID = $(this).data("id");

  // Send the request to delete the department
  $.ajax({
    url: "libs/php/deleteDepartmentByID.php",
    type: "POST",
    contentType: "application/JSON",
    data: JSON.stringify({ id: departmentID }),
    success: function (result) {
      if (result.status.code == 200) {
        // Remove the department row from the table
        $(`#${departmentID}`).remove();
        // Hide the modal after deletion
        $("#deletePersonnelModal").modal("hide");
        fetchDepartmentData();
      } else {
        alert("Error deleting department");
      }
    },
    error: function () {
      alert("Error deleting department.");
    },
  });
});

// Edit location row
$("#editLocationModal").on("show.bs.modal", function (e) {
  const locationID = $(e.relatedTarget).data("id"); // Get the id attribute from the button
  $("#editLocationID").val(locationID);

  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "POST",
    dataType: "json",
    data: { id: locationID },
    success: function (result) {
      if (result.status.code == 200) {
        const location = result.data.locations[0].name;

        $("#editLocation").val(location);
      } else {
        $("#editDepartmentModal .modal-title").text("Error retrieving data");
      }
    },
    error: function () {
      alert("Error retrieving data");
    },
  });
});

// Save edit location row
$("#saveEditLocation").click(function (e) {
  e.preventDefault();

  const locationID = $("#editLocationID").val();
  const location = $("#editLocation").val();
  console.log(location);
  console.log(locationID);

  $.ajax({
    url: "libs/php/updateLocation.php",
    type: "POST",
    dataType: "json",
    data: {
      id: locationID,
      name: location,
    },
    success: function (response) {
      console.log(response);
      if (response.status.code === "200") {
        // Find the row and update it
        let row = $(`#locationTableBody tr[data-id="${locationID}"]`);
        row.find("td:nth-child(1)").text(location);

        fetchLocationData();
        fetchDepartmentData();
        $("#editLocationModal").modal("hide");
        $("#saveMessageModal").modal("show");
      } else {
        $("#editLocationModal .modal-title").text("Please edit");
      }
    },
  });
});

// Delete location row
$("#deleteLocationModal").on("show.bs.modal", function (e) {
  const locationID = $(e.relatedTarget).data("id"); // Get the id attribute from the button

  // Set the ID on the confirm button
  $("#confirmDeleteLocationBtn").data("id", locationID);

  // Fetch department details by ID
  $.ajax({
    url: "libs/php/getLocationByID.php",
    type: "POST",
    dataType: "json",
    data: { id: locationID },
    success: function (result) {
      if (result.status.code == 200) {
        const location = result.data.locations[0].name;
        const employeeCount = result.data.locations[0].employeeCount;
        if (employeeCount > 0) {
          $("#delLocationMsg").text(
            `You cannot delete ${location} because it has ${employeeCount} employees assigned to it.`
          );
          $("#confirmDeleteLocationBtn").prop("disabled", true);
        } else {
          // Set the delete confirmation message
          $("#delLocationMsg").text(
            `Are you sure you want to delete ${location}?`
          );
          $("#confirmDeleteLocationBtn").prop("disabled", false);
        }
      } else {
        $("#deleteLocationModal .modal-title").text("Error retrieving data");
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert("Error retrieving data");
    },
  });
});

$("#confirmDeleteLocationBtn").on("click", function () {
  const locationID = $(this).data("id");

  // Send the request to delete the location
  $.ajax({
    url: "libs/php/deleteLocationByID.php",
    type: "POST",
    contentType: "application/JSON",
    data: JSON.stringify({ id: locationID }),
    success: function (result) {
      if (result.status.code == 200) {
        // Remove the department row from the table
        $(`#${locationID}`).remove();
        // Hide the modal after deletion
        $("#deleteLocationModal").modal("hide");
        fetchLocationData();
      } else {
        alert("Error deleting location");
      }
    },
    error: function () {
      alert("Error deleting location.");
    },
  });
});
