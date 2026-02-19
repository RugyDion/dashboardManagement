document.addEventListener("DOMContentLoaded", function () {
    const foodReportTableBody = document.querySelector("#foodReportTable tbody");

    async function loadFoodReportEntries() {
        const res = await fetch("/api/v1/food")
        const e = (await res.json()).foods || [];
        const foodReportEntries = e || [];
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
        foodReportTableBody.innerHTML = ""; // Clear table
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
            return entryDate >= new Date(fromDate) && entryDate <= new Date(toDate + "T23:59:59");
        });

        if (filteredEntries.length === 0) {
            alert("No food entries found for selected dates.");
            return;
        }

        // 🔥 Calculate grand total
        let grandTotal = 0;
        let printContent = `
            <html>
            <head>
                <title>Food Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h1 { text-align:center; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; }
                    .grand-total { font-weight:bold; font-size:14px; }
                    @page { size:A4; margin:20mm; }
                </style>
            </head>
            <body>
                <h1>Food Report - Montevar Hotel</h1>
                <p><strong>From:</strong> ${fromDate} &nbsp;&nbsp; <strong>To:</strong> ${toDate}</p>
                <table>
                    <tr>
                        <th>Room No</th>
                        <th>Type of Food and Amount</th>
                        <th>Payment Method</th>
                        <th>Service Location</th>
                        <th>Total Amount</th>
                        <th>Date of Entry</th>
                    </tr>
        `;

        filteredEntries.forEach(entry => {
            const totalAmount = Number(entry.totalAmount) || 0;
            grandTotal += totalAmount;

            printContent += `
                <tr>
                    <td>${entry.roomNo}</td>
                    <td>${entry.foodTypes.map((type, index) => `${type} - ${entry.foodAmounts[index]}`).join("<br>")}</td>
                    <td>${entry.paymentMethod}</td>
                    <td>${entry.serviceLocation}</td>
                    <td>₦${totalAmount.toLocaleString()}</td>
                    <td>${entry.dateOfEntry}</td>
                </tr>
            `;
        });

        printContent += `
                <tr class="grand-total">
                    <td colspan="4" style="text-align:right;">GRAND TOTAL</td>
                    <td>₦${grandTotal.toLocaleString()}</td>
                    <td></td>
                </tr>
                </table>
            </body>
            </html>
        `;

        const printWindow = window.open("", "", "width=900,height=700");
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
        closePrintModal();
    }

    // Load entries on page load
    loadFoodReportEntries();
});
