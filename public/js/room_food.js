let currentEditIndex;
document.addEventListener("DOMContentLoaded", function () {
    let editMode = false;

    const roomFoodForm = document.getElementById("food-form");
    const foodItemsContainer = document.getElementById("food-items-container");
    const entriesTableBody = document.getElementById("entries-table-body");

    // Load saved food entries
    loadFoodEntries();

    foodItemsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-food")) {
            addFoodItem();
        } else if (e.target.classList.contains("remove-food")) {
            e.target.closest(".food-item").remove();
            calculateTotalAmount();
        }
    });

    foodItemsContainer.addEventListener("input", calculateTotalAmount);

    roomFoodForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const entry = collectFormData();
        if (editMode) {
            updateEntry(entry);
        } else {
            addNewEntry(entry);
        }
        resetForm();
    });

    entriesTableBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("edit-entry")) {
            prepareEditEntry(e.target.closest("tr"));
        } else if (e.target.classList.contains("print-receipt")) {
            printReceipt(e.target.closest("tr"));
        }
    });

    function addFoodItem(type = "", amount = "") {
        const newFoodItem = document.createElement("div");
        newFoodItem.classList.add("food-item");
        newFoodItem.innerHTML = `
            <div class="food-item-flex">
                 <div class="cnt">
                <label>Food/Beverage:</label>
                <input type="text" class="food-type" name="foodType[]" value="${type}" required></div>
                <div class="cnt nt">
                <label><br>Amount:</label>
                <input type="number" class="food-amount" name="foodAmount[]" value="${amount}" min="0" required></div>
            </div>
            <button type="button" class="remove-food">-</button>
        `;
        foodItemsContainer.appendChild(newFoodItem);
    }

    function calculateTotalAmount() {
        const foodAmounts = document.querySelectorAll(".food-amount");
        const total = Array.from(foodAmounts).reduce(
            (sum, input) => sum + Number(input.value || 0),
            0
        );
        document.getElementById("total-amount").value = total;
    }

    function collectFormData() {
        const roomNo = document.getElementById("room-no").value;
        const paymentMethod = document.getElementById("payment-method").value;
        const serviceLocation = document.getElementById("service-location").value;
        const foodTypes = Array.from(document.querySelectorAll(".food-type")).map((input) => input.value);
        const foodAmounts = Array.from(document.querySelectorAll(".food-amount")).map((input) => input.value);
        const totalAmount = document.getElementById("total-amount").value;
        const dateOfEntry = new Date().toLocaleString();

        return { roomNo, foodTypes, foodAmounts, paymentMethod, serviceLocation, totalAmount, dateOfEntry };
    }

    async function addNewEntry(entry) {
        addEntryToTable(entry);
        await fetch ("/api/v1/food", {
            method:"POST",
            body:JSON.stringify(entry),
            headers:{
                "Content-type":"application/json"
            }
        })
    }

    function addEntryToTable(entry) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.roomNo}</td>
            <td>
                ${entry.foodTypes.map((type, index) => `<div>${type} - ${entry.foodAmounts[index]}</div>`).join("")}
            </td>
            <td>${entry.paymentMethod}</td>
            <td>${entry.serviceLocation}</td>
            <td>${entry.totalAmount}</td>
            <td>${entry.dateOfEntry}</td>
            <td>
                <button class="edit-entry">Edit</button>
                <button class="print-receipt">Print</button>
            </td>
        `;
        entriesTableBody.prepend(row);
    }

    async function prepareEditEntry(row) {
        const cells = row.children;
        const roomNo = cells[0].textContent;
        const paymentMethod = cells[2].textContent;
        const serviceLocation = cells[3].textContent;
        const totalAmount = cells[4].textContent;

        let index = Array.from(entriesTableBody.children).indexOf(row);
        const entries = await getEntries();
        const entry = entries[index];
        if(entry.isPrint){
            alert("Can't edit after making a print out")
            return
        }

        const foodDetails = Array.from(cells[1].querySelectorAll("div")).map((div) => {
            const [type, amount] = div.textContent.split(" - ");
            return { type, amount };
        });

        document.getElementById("room-no").value = roomNo;
        document.getElementById("payment-method").value = paymentMethod;
        document.getElementById("service-location").value = serviceLocation;
        document.getElementById("total-amount").value = totalAmount;

        foodItemsContainer.innerHTML = "";
        foodDetails.forEach(({ type, amount }) => addFoodItem(type, amount));

        editMode = true;
        currentEditIndex = Array.from(entriesTableBody.children).indexOf(row);
    }

    async function updateEntry(entry) {
        const entries = await getEntries();
        entry._id = entries[currentEditIndex]._id 
        saveEntries(entry);
        reloadTable();
        editMode = false;
    }

    // 🔥 UPDATED POS THERMAL PRINT RECEIPT
    async function printReceipt(row) {
        const entry = collectRowData(row);

        let index = Array.from(entriesTableBody.children).indexOf(row);
        const entries = await getEntries();
        const _id = entries[index]._id

        const formatCurrency = (amount) => {
            return "₦" + Number(amount).toLocaleString('en-NG');
        };

        const printWindow = window.open("", "", "width=400,height=600");

        printWindow.document.write(`
            <html>
            <head>
                <title>Receipt</title>
                <style>
                    body {
                        font-family: "Courier New", monospace;
                        font-size: 12px;
                        width: 300px;
                        margin: auto;
                        padding: 10px;
                    }
                    .center { text-align: center; }
                    .logo img { width: 80px; margin-bottom: 5px; }
                    .line { border-top: 1px dashed #000; margin: 8px 0; }
                    .footer { font-size: 10px; margin-top: 10px; text-align: center; }
                    button { margin-top: 10px; font-size: 11px; padding: 4px 8px; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>

                <div class="center logo">
                    <img src="/images/Montevar_logo.png" alt="Montevar Logo">
                </div>

                <div class="center">
                    <strong>MONTEVAR HOTEL</strong><br>
                    Food/Beverage Receipt
                </div>

                <div class="line"></div>

                <div><strong>Room No:</strong> ${entry.roomNo}</div>

                <div class="line"></div>

                <div>
                    <strong>Items:</strong><br>
                    ${entry.foodTypes.map(
                        (type, index) => `${type} - ${formatCurrency(entry.foodAmounts[index])}`
                    ).join("<br>")}
                </div>

                <div class="line"></div>

                <div><strong>Payment:</strong> ${entry.paymentMethod}</div>
                <div><strong>Location:</strong> ${entry.serviceLocation}</div>

                <div class="line"></div>

                <div><strong>Total:</strong> ${formatCurrency(entry.totalAmount)}</div>

                <div class="line"></div>

                <div><strong>Date:</strong> ${entry.dateOfEntry}</div>

                <div class="line"></div>

                <div class="footer">
                    airport road a, 1, Montevar street ofumwengbe community off Egbirhi, near obazagbon, Benin City, Edo<br>
                    Phone: 07060996380
                </div>

                <div class="center">
                    <button onclick="window.print()">Print</button>
                    <button onclick="window.close()">Close</button>
                </div>

            </body>
            </html>
        `);

        printWindow.document.close();

        await fetch("/api/v1/food", {
            method:"POST",
            body: JSON.stringify({edit:true, isPrint:true, _id}),
            headers:{
                "Content-type":"application/json"
            }
        })
    }

    function resetForm() {
        roomFoodForm.reset();
        foodItemsContainer.innerHTML = "";
        editMode = false;
    }

    async function reloadTable() {
        entriesTableBody.innerHTML = "";
        const entries = await getEntries();
        entries.forEach(addEntryToTable);
    }

    async function saveEntries(entry) {
        entry.edit = true
        await fetch ("/api/v1/food", {
            method:"POST",
            body:JSON.stringify(entry),
            headers:{
                "Content-type":"application/json"
            }
        })
    }

    async function getEntries() {
        const res = await fetch("/api/v1/food")
        return (await res.json()).foods || [];
    }

    async function loadFoodEntries() {
        const entries = await getEntries();
        entries.forEach(addEntryToTable);
    }

    function collectRowData(row) {
        const cells = row.children;
        return {
            roomNo: cells[0].textContent,
            foodTypes: Array.from(cells[1].querySelectorAll("div")).map(div => div.textContent.split(" - ")[0]),
            foodAmounts: Array.from(cells[1].querySelectorAll("div")).map(div => div.textContent.split(" - ")[1]),
            paymentMethod: cells[2].textContent,
            serviceLocation: cells[3].textContent,
            totalAmount: cells[4].textContent,
            dateOfEntry: cells[5].textContent,
        };
    }
});
