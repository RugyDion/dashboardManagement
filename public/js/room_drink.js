document.addEventListener("DOMContentLoaded", function () {
    let editMode = false;
    let currentUpdateId = "";

    const drinkForm = document.getElementById("drink-form");
    const drinkItemsContainer = document.getElementById("drink-items-container");
    const entriesTableBody = document.getElementById("entries-table-body");

    // Load saved drink entries from localStorage
    loadDrinkEntries();

    // Add new drink item row
    drinkItemsContainer.addEventListener("click", (e) => {
        // Add a new drink item row
        if (e.target.classList.contains("add-drink")) {
            const newDrinkItem = document.createElement("div");
            newDrinkItem.classList.add("drink-item");
            newDrinkItem.innerHTML = `
                <div class="drink-item-flex">
                <div class="cnt">
                    <label for="drink-type">Type of Drink/Others:</label>
                    <input type="text" class="drink-type" name="drinkType[]" required>
                    </div>
                    
                    <div class="cnt nt">
                    <label for="drink-amount">Amount:</label>
                    <input type="number" class="drink-amount" name="drinkAmount[]" min="0" required>
                    </div>
                </div>
                <button type="button" class="remove-drink">-</button>
            `;
            drinkItemsContainer.appendChild(newDrinkItem);
        }
    
        // Remove a drink item row
        if (e.target.classList.contains("remove-drink")) {
            e.target.parentElement.remove();
            calculateTotal();
        }
    });

    // Calculate total amount dynamically when input changes
    drinkItemsContainer.addEventListener("input", calculateTotal);

    function calculateTotal() {
        const drinkAmounts = document.querySelectorAll(".drink-amount");
        const totalAmount = Array.from(drinkAmounts).reduce(
            (sum, input) => sum + Number(input.value || 0),
            0
        );
        document.getElementById("total-amount").value = totalAmount;
    }

    // Submit form
    drinkForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const roomNo = document.getElementById("room-no").value;
        const paymentMethod = document.getElementById("payment-method").value;
        const serviceLocation = document.getElementById("service-location").value;
        const drinkTypes = Array.from(document.querySelectorAll(".drink-type")).map(
            (input) => input.value
        );
        const drinkAmounts = Array.from(
            document.querySelectorAll(".drink-amount")
        ).map((input) => input.value);
        const totalAmount = document.getElementById("total-amount").value;
        const dateOfEntry = new Date().toLocaleString(); // Get the current date and time

        const entry = {
            roomNo,
            drinkTypes,
            drinkAmounts,
            paymentMethod,
            serviceLocation,
            totalAmount,
            dateOfEntry, 
        };
        if (editMode){
            entry._id = currentUpdateId;
            entry.edit = true
        }
        !editMode &&addEntryToTable(entry);
        saveEntry(entry);

        // Reset form
        drinkForm.reset();
        drinkItemsContainer.innerHTML = ""; 
        editMode && window.location.reload()
        
    });

    // Add entry to the table
    function addEntryToTable(entry) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.roomNo}</td>
            <td>
                ${entry.drinkTypes.map((type, index) => {
                    return `<div class="drink-item-entry">
                                <span>${type}</span> - <span>${entry.drinkAmounts[index]}</span>
                            </div>`;
                }).join("")}
            </td>
            <td>${entry.paymentMethod}</td>
            <td>${entry.serviceLocation}</td>
            <td>${entry.totalAmount}</td>
            <td>${entry.dateOfEntry}</td> <!-- Display date of entry -->
            <td>
                <button class="edit-entry">Edit</button>
                <button class="print-receipt">Print</button>
            </td>
        `;
        entriesTableBody.appendChild(row);
    }

    // Save entry to localStorage(now db) //todo
    async function saveEntry(entry) {
        await fetch ("/api/v1/drinks", {
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify(entry)
        })
        // const entries = JSON.parse(localStorage.getItem("drinkEntries")) || [];
        // entries.push(entry);
        // localStorage.setItem("drinkEntries", JSON.stringify(entries));
    }

    // Load saved drink entries //todo
    async function loadDrinkEntries() {
        const res = await fetch("/api/v1/drinks")
        const entries = (await res.json()).drinks || [];
        entries.forEach(addEntryToTable);
    }

    // Handle edit functionality //todo
    entriesTableBody.addEventListener("click",async (e) => {
        if (e.target.classList.contains("edit-entry")) {
            const row = e.target.parentElement.parentElement;
            const cells = row.querySelectorAll("td");
            // get index to get entry, used to determine if it can print or not
            const res = await fetch("/api/v1/drinks")
            const entries = (await res.json()).drinks || [];
            const childs = Array.from(entriesTableBody.children)
            const index = childs.indexOf(row);
            const entry = entries[index];
            if (entry.isPrint){
                alert ("Cannot edit after making a print")
                return;
            }
            currentUpdateId = entry._id;
            const roomNo = cells[0].textContent;
            const drinkTypes = Array.from(cells[1].querySelectorAll("span")).map(
                (span) => span.textContent
            ).filter((_, index) => index % 2 === 0); 
            const drinkAmounts = Array.from(cells[1].querySelectorAll("span")).map(
                (span) => span.textContent
            ).filter((_, index) => index % 2 !== 0); 

            const paymentMethod = cells[2].textContent;
            const serviceLocation = cells[3].textContent;
            const totalAmount = cells[4].textContent;
            const dateOfEntry = cells[5].textContent; 

            // Set the form values for editing
            document.getElementById("room-no").value = roomNo;
            document.getElementById("payment-method").value = paymentMethod;
            document.getElementById("service-location").value = serviceLocation;
            document.getElementById("total-amount").value = totalAmount;

            // Populate the drink items for editing
            drinkItemsContainer.innerHTML = "";
            drinkTypes.forEach((type, index) => {
                const drinkItem = document.createElement("div");
                drinkItem.classList.add("drink-item");
                drinkItem.innerHTML = `
                    <div class="drink-item-flex">
                        <label for="drink-type">Type of Drink/Others:</label>
                        <input type="text" class="drink-type" name="drinkType[]" value="${type}" required>
                        
                        <label for="drink-amount">Amount:</label>
                        <input type="number" class="drink-amount" name="drinkAmount[]" value="${drinkAmounts[index]}" min="0" required>
                    </div>
                    <button type="button" class="remove-drink">-</button>
                `;
                drinkItemsContainer.appendChild(drinkItem);
            });

            editMode = true;
        }
    });

// Handle print receipt functionality //todo 
    entriesTableBody.addEventListener("click",async (e) => { if (e.target.classList.contains("print-receipt")) 
    { const row = e.target.parentElement.parentElement; const cells = row.querySelectorAll("td"); 
     // get index to get ID
     const res = await fetch("/api/v1/drinks") const entries = (await res.json()).drinks || []; 
     const childs = Array.from(entriesTableBody.children) const index = childs.indexOf(row); 
     const entry = entries[index]; const _id = entry._id const roomNo = cells[0].textContent; 
     const drinkItems = cells[1].innerHTML; const paymentMethod = cells[2].textContent; 
     const serviceLocation = cells[3].textContent; const totalAmount = cells[4].textContent; 
     const dateOfEntry = cells[5].textContent; const receiptContent = <h1>Montevar Hotel</h1> 
         <h3>Drinks/Beverage Receipt</h3> <p><strong>Room No:</strong> ${roomNo}</p> <p><strong>Drink/Others:</strong><br>${drinkItems}</p> 
         <p><strong>Payment Method:</strong> ${paymentMethod}</p> <p><strong>Service Location:</strong> ${serviceLocation}</p>
         <p><strong>Total Amount:</strong> ${totalAmount}</p> <p><strong>Date:</strong> ${dateOfEntry
         }</p> <!-- Display date on the receipt --> ; const printWindow = window.open("", "_blank"); printWindow.document.write(<html>
        <head><title>Receipt</title></head><body>${receiptContent}</body></html>); printWindow.document.close(); printWindow.print(); 
    // update print status 
    await fetch("/api/v1/drinks", { method:"POST", body:JSON.stringify({_id,isPrint:true, edit:true}), headers:{ "Content-type":"application/json" }, }) } }); });

// Export the drink entry to drink_report.html (save to localStorage) //todo ig
function exportToDrinkReport(entry) {
    const drinkReportEntries = JSON.parse(localStorage.getItem('drinkReportEntries')) || [];
    drinkReportEntries.push(entry);
    localStorage.setItem('drinkReportEntries', JSON.stringify(drinkReportEntries));
    console.log("Drink entry saved to drinkReportEntries", drinkReportEntries);  // Check if the data is saved
}
