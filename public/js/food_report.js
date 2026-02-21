document.addEventListener("DOMContentLoaded", function () {
    const foodReportTableBody = document.querySelector("#foodReportTable tbody");

    async function loadFoodReportEntries() {
        const res = await fetch("/api/v1/food");
        const e = (await res.json()).foods || [];
        const foodReportEntries = e || [];

        // Sort entries: latest date at the top
        foodReportEntries.sort((a, b) => new Date(b.dateOfEntry) - new Date(a.dateOfEntry));

        foodReportTableBody.innerHTML = ""; // Clear before loading
        foodReportEntries.forEach((entry) => {
            addFoodReportEntryToTable(entry);
        });
    }

    function addFoodReportEntryToTable(entry) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.roomNo}</td>
            <td>
                ${entry.foodTypes.map((type, index) => {
                    return `<div class="food-item-entry">
                                <span>${type}</span> - <span>${entry.foodAmounts[index]}</span>
                            </div>`;
                }).join("")}
            </td>
            <td>${entry.paymentMethod}</td>
            <td>${entry.serviceLocation}</td>
            <td>${entry.totalAmount}</td>
            <td>${entry.dateOfEntry}</td>
        `;
        foodReportTableBody.appendChild(row);
    }

    // Clear all entries
    const clearAllBtn = document.getElementById("clearAllBtn");
    clearAllBtn.addEventListener("click", async function () {
        await fetch("/api/v1/food", { method: "DELETE" });
        foodReportTableBody.innerHTML = "";
    });

    // Modal functions
    window.openPrintModal = function () {
        document.getElementById("printModal").style.display = "block";
    }

    window.closePrintModal = function () {
        document.getElementById("printModal").style.display = "none";
    }

    // Print food report for selected dates
  window.printFoodReport = async function () {

    const fromDate = document.getElementById("modalFromDate").value;
    const toDate = document.getElementById("modalToDate").value;

    if (!fromDate || !toDate) {
        alert("Please select both From and To dates.");
        return;
    }

    const res = await fetch("/api/v1/food");
    const e = (await res.json()).foods || [];

    const filteredEntries = e.filter(entry => {
        if (!entry.dateOfEntry) return false;
        const entryDate = new Date(entry.dateOfEntry);
        return entryDate >= new Date(fromDate) &&
               entryDate <= new Date(toDate + "T23:59:59");
    });

    if (filteredEntries.length === 0) {
        alert("No food entries found for selected dates.");
        return;
    }

    filteredEntries.sort((a, b) =>
        new Date(b.dateOfEntry) - new Date(a.dateOfEntry)
    );

    let grandTotal = 0;

    const printWindow = window.open("", "", "width=1000,height=800");

    printWindow.document.write(`
        <html>
        <head>
            <title> Montevar Hotel Food & Drinks Report</title>

            <style>
                @page {
                    size: A4;
                    margin: 25mm 15mm 20mm 15mm;
                }

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding-top: 20px;
                }

                h1 {
                    text-align: center;
                    font-size: 22px;
                    margin: 0 0 15px 0;
                }

                .date-range {
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    display: table-header-group;
                }

                th, td {
                    border: 1px solid #000;
                    padding: 6px;
                    font-size: 13px;
                    text-align: left;
                }

                th {
                    background-color: #f2f2f2;
                }

                .grand-total {
                    font-weight: bold;
                }
            </style>
        </head>

        <body>

            <h1>Food Report - Montevar Hotel</h1>

            <div class="date-range">
                <strong>From:</strong> ${fromDate}
                &nbsp;&nbsp;
                <strong>To:</strong> ${toDate}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Room No</th>
                        <th>Type of Food and Amount</th>
                        <th>Payment Method</th>
                        <th>Service Location</th>
                        <th>Total Amount (₦)</th>
                        <th>Date of Entry</th>
                    </tr>
                </thead>
                <tbody>
    `);

    filteredEntries.forEach(entry => {
        const totalAmount = Number(entry.totalAmount) || 0;
        grandTotal += totalAmount;

        printWindow.document.write(`
            <tr>
                <td>${entry.roomNo}</td>
                <td>${entry.foodTypes.map((type, index) =>
                    `${type} - ${entry.foodAmounts[index]}`
                ).join("<br>")}</td>
                <td>${entry.paymentMethod}</td>
                <td>${entry.serviceLocation}</td>
                <td>₦${totalAmount.toLocaleString()}</td>
                <td>${entry.dateOfEntry}</td>
            </tr>
        `);
    });

    printWindow.document.write(`
            <tr class="grand-total">
                <td colspan="4" style="text-align:right;">GRAND TOTAL</td>
                <td>₦${grandTotal.toLocaleString()}</td>
                <td></td>
            </tr>
                </tbody>
            </table>

        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    closePrintModal();
}

    loadFoodReportEntries();
});
