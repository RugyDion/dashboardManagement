let username = JSON.parse(localStorage.getItem("user")).username;
let currentUpdateId = "";
document.addEventListener("DOMContentLoaded", function () {
  loadEventEntries(); // Load stored entries on page load

  // Form submission handler
  document
    .getElementById("eventForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();

      const fullName = document.getElementById("fullName").value;
      const phoneNo = document.getElementById("phoneNo").value;
      const email = document.getElementById("email").value;
      const eventType = document.getElementById("eventType").value;
      const eventDate = document.getElementById("eventDate").value;
      const services = document.getElementById("services").value;
      const totalCost = document.getElementById("totalCost").value;

      const currentDate = new Date().toLocaleDateString();

      const editingIndex =
        document.getElementById("eventForm").dataset.editingIndex;

      const eventEntry = {
        fullName,
        phoneNumber: phoneNo,
        email,
        eventType,
        eventDate,
        renderedServices: services,
        totalCost,
        date: currentDate,
      };
      eventEntry.username = username;
      eventEntry._id = currentUpdateId;

      if (editingIndex !== undefined && editingIndex !== "") {
        updateEventEntry(eventEntry, parseInt(editingIndex));
        document.getElementById("eventForm").dataset.editingIndex = "";
      } else {
        saveEventEntry(eventEntry);
      }

      loadEventEntries();
      //exportToEventReport(eventEntry); // Save data to event_report.html as well
      document.getElementById("eventForm").reset();
    });
});

// Save event entry to localStorage
async function saveEventEntry(entry) {
  const res = await fetch("/api/v1/events", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(entry),
  });
  window.location.reload();
  // const eventEntries = JSON.parse(localStorage.getItem('eventEntries')) || [];
  // eventEntries.push(entry);
  // localStorage.setItem('eventEntries', JSON.stringify(eventEntries));
}

// Update an existing event entry
async function updateEventEntry(updatedEntry, index) {
    updatedEntry.edit = true
    const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(updatedEntry),
      });
      window.location.reload();
//   const eventEntries = JSON.parse(localStorage.getItem("eventEntries")) || [];
//   eventEntries[index] = updatedEntry;
//   localStorage.setItem("eventEntries", JSON.stringify(eventEntries));
}

// Load event entries from localStorage
async function loadEventEntries() {
  const res = await fetch("/api/v1/events");
  const jsonData = await res.json()
  const eventEntries = jsonData.events || [];
  const tableBody = document.querySelector("#eventTable tbody");
  tableBody.innerHTML = "";
  
  eventEntries.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${entry.fullName}</td>
            <td>${entry.phoneNumber}</td>
            <td>${entry.email || "N/A"}</td>
            <td>${entry.eventType}</td>
            <td>${entry.eventDate}</td>
            <td>${entry.renderedServices}</td>
            <td>${entry.totalCost}</td>
            <td>${entry.date}</td>
            <td>
                <button onclick="editEventEntry(${index})">Edit</button>
                <button onclick="printEventEntry(${index})">Print</button>
            </td>
        `;
    tableBody.appendChild(row);
  });
}

// Edit an event entry
async function editEventEntry(index) {
    const res = await fetch("/api/v1/events");
    const jsonData = await res.json()
    const eventEntries = jsonData.events || [];
  const entry = eventEntries[index];
  if(entry.isPrint){
    alert("Can't edit after printing")
    return
  }
  document.getElementById("fullName").value = entry.fullName;
  document.getElementById("phoneNo").value = entry.phoneNumber;
  document.getElementById("email").value = entry.email;
  document.getElementById("eventType").value = entry.eventType;
  document.getElementById("eventDate").value = entry.eventDate;
  document.getElementById("services").value = entry.renderedServices;
  document.getElementById("totalCost").value = entry.totalCost;

  document.getElementById("eventForm").dataset.editingIndex = index;
  currentUpdateId = entry._id
}

// Print an event entry for the 80mm mini printer
async function printEventEntry(index) {
    const res = await fetch("/api/v1/events");
    const jsonData = await res.json()
    const eventEntries = jsonData.events || [];
  const entry = eventEntries[index];

  const printWindow = window.open("", "", "width=800,height=600");

  printWindow.document.write(`
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1, h2 {
                text-align: left;
                margin-bottom: 10px;
            }
            p {
                text-align: left;
                margin: 8px 0;
            }
            hr {
                border: 1px solid #ccc;
            }
           
            .highlight {
             font-weight: bold; font-size: 1.2em; 
             } 
             </style> 
             <h1>Montevar Hotel Event Service Entry</h1>
              <hr> <h2>Full Name: ${entry.fullName}</h2> 
              <p><span class="highlight">Phone No:</span> ${entry.phoneNumber}</p>
               <p><span class="highlight">Email:</span> ${
                 entry.email || "N/A"
               }</p>
                <p><span class="highlight">Type of Event:</span> ${
                  entry.eventType
                }</p>
                 <p><span class="highlight">Date of Event:</span> ${
                   entry.eventDate
                 }</p>
                  <p><span class="highlight">Services:</span> ${entry.renderedServices}</p> 
                  <p><span class="highlight">Total Cost:</span> ${
                    entry.totalCost
                  }</p> 
                  <p><span class="highlight">Date Submitted:</span> ${
                    entry.date
                  }</p> <hr> `);
                  await fetch("/api/v1/events", {
                    method: "POST",
                    headers: {
                      "Content-type": "application/json",
                    },
                    body: JSON.stringify({isPrint:true,edit:true, _id:entry._id}),
                  });
  printWindow.document.close();
  printWindow.print();
}

// Export to event report page
