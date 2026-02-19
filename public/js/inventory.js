const salesUrl = "/api/v1/inventory/";

document.addEventListener('DOMContentLoaded', function () {
    let currentPrintSection = ""; // Track which section is being printed

    // ----------------- SALES SECTION -----------------
    document.getElementById('salesForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const bookingsSales = parseFloat(document.getElementById('bookingsSales').value) || 0;
        const foodSales = parseFloat(document.getElementById('foodSales').value) || 0;
        const drinksSales = parseFloat(document.getElementById('drinksSales').value) || 0;
        const eventsSales = parseFloat(document.getElementById('eventsSales').value) || 0;
        const laundrySales = parseFloat(document.getElementById('laundrySales').value) || 0;
        const poolSales = parseFloat(document.getElementById('poolSales').value) || 0;

        const totalSales = bookingsSales + foodSales + drinksSales + eventsSales + laundrySales + poolSales;
        const dateTime = new Date().toLocaleString();

        const salesEntry = {
            bookingsEndOfDaySales: bookingsSales,
            foodEndOfDaySales: foodSales,
            drinksEndOfDaySales: drinksSales,
            eventsEndOfDaySales: eventsSales,
            laundryEndOfDaySales: laundrySales,
            poolEndOfDaySales: poolSales,
            totalSales,
            date: dateTime
        };

        await fetch(`${salesUrl}totalSales`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(salesEntry)
        });

        loadSalesEntries();
        document.getElementById('salesForm').reset();
    });

    async function loadSalesEntries() {
        const res = await fetch(`${salesUrl}totalSales`);
        const data = await res.json();
        const salesEntries = data.totalSales || [];
        const tableBody = document.getElementById('salesEntriesTable');
        tableBody.innerHTML = '';

        let grandTotal = 0;

        // Show latest entries first
        salesEntries.slice().reverse().forEach(entry => {
            grandTotal += entry.totalSales;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>₦${entry.bookingsEndOfDaySales.toLocaleString()}</td>
                <td>₦${entry.foodEndOfDaySales.toLocaleString()}</td>
                <td>₦${entry.drinksEndOfDaySales.toLocaleString()}</td>
                <td>₦${entry.eventsEndOfDaySales.toLocaleString()}</td>
                <td>₦${entry.laundryEndOfDaySales.toLocaleString()}</td>
                <td>₦${entry.poolEndOfDaySales.toLocaleString()}</td>
                <td>₦${entry.totalSales.toLocaleString()}</td>
            `;
            tableBody.appendChild(row);
        });

        // Add Grand Total Row
        if (salesEntries.length > 0) {
            const totalRow = document.createElement('tr');
            totalRow.style.fontWeight = 'bold';
            totalRow.innerHTML = `
                <td colspan="7" style="text-align:right;">Grand Total:</td>
                <td>₦${grandTotal.toLocaleString()}</td>
            `;
            tableBody.appendChild(totalRow);
        }
    }

    document.getElementById('clearSales').addEventListener('click', async function () {
        await fetch(`${salesUrl}totalSales`, { method: "DELETE" });
        loadSalesEntries();
    });

    // ----------------- STORAGE SECTION -----------------
    document.getElementById('storageForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const productName = document.getElementById('productNameStorage').value;
        const quantity = parseInt(document.getElementById('quantityStorage').value) || 0;
        const dateTime = new Date().toLocaleString();

        const storageEntry = { productName, quantity, date: dateTime };

        await fetch(`${salesUrl}dailyStorageEntry`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(storageEntry)
        });

        loadStorageEntries();
        document.getElementById('storageForm').reset();
    });

    async function loadStorageEntries() {
        const res = await fetch(`${salesUrl}dailyStorageEntry`);
        const data = await res.json();
        const storageEntries = data.entries || [];
        const tableBody = document.getElementById('storageEntriesTable');
        tableBody.innerHTML = '';

        storageEntries.slice().reverse().forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.productName}</td>
                <td>${entry.quantity}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('clearStorage').addEventListener('click', async function () {
        await fetch(`${salesUrl}dailyStorageEntry`, { method: "DELETE" });
        loadStorageEntries();
    });

    // ----------------- USAGE SECTION -----------------
    document.getElementById('usageForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const productName = document.getElementById('productNameUsage').value;
        const quantity = parseInt(document.getElementById('quantityUsage').value) || 0;
        const dateTime = new Date().toLocaleString();

        const usageEntry = { productName, takeOutQuantity: quantity, date: dateTime };

        await fetch(`${salesUrl}storageUsageEntry`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(usageEntry)
        });

        loadUsageEntries();
        document.getElementById('usageForm').reset();
    });

    async function loadUsageEntries() {
        const res = await fetch(`${salesUrl}storageUsageEntry`);
        const data = await res.json();
        const usageEntries = data.entries || [];
        const tableBody = document.getElementById('usageEntriesTable');
        tableBody.innerHTML = '';

        usageEntries.slice().reverse().forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.productName}</td>
                <td>${entry.takeOutQuantity}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    document.getElementById('clearUsage').addEventListener('click', async function () {
        await fetch(`${salesUrl}storageUsageEntry`, { method: "DELETE" });
        loadUsageEntries();
    });

   // ----------------- PRINT MODAL -----------------
window.openPrintModal = function (section) {
    currentPrintSection = section;
    document.getElementById('printModal').style.display = 'block';
}

window.closePrintModal = function () {
    document.getElementById('printModal').style.display = 'none';
}

window.printSection = function () {
    const fromDate = document.getElementById('modalFromDate').value;
    const toDate = document.getElementById('modalToDate').value;
    let rows = [];

    if (currentPrintSection === 'sales') {
        const tableRows = Array.from(document.querySelectorAll("#salesEntriesTable tr"));
        rows = tableRows.filter(row => {
            const dateText = row.children[0].textContent;
            const rowDate = new Date(dateText);
            if (fromDate && rowDate < new Date(fromDate)) return false;
            if (toDate && rowDate > new Date(toDate + "T23:59:59")) return false;
            return true;
        });
        printTable(rows, 'End of Day Sales Report');
    } else if (currentPrintSection === 'storage') {
        const tableRows = Array.from(document.querySelectorAll("#storageEntriesTable tr"));
        rows = tableRows.filter(row => {
            const dateText = row.children[0].textContent;
            const rowDate = new Date(dateText);
            if (fromDate && rowDate < new Date(fromDate)) return false;
            if (toDate && rowDate > new Date(toDate + "T23:59:59")) return false;
            return true;
        });
        printTable(rows, 'Saved Stock Entries');
    } else if (currentPrintSection === 'usage') {
        const tableRows = Array.from(document.querySelectorAll("#usageEntriesTable tr"));
        rows = tableRows.filter(row => {
            const dateText = row.children[0].textContent;
            const rowDate = new Date(dateText);
            if (fromDate && rowDate < new Date(fromDate)) return false;
            if (toDate && rowDate > new Date(toDate + "T23:59:59")) return false;
            return true;
        });
        printTable(rows, 'Saved Stock Usage Entries');
    }

    closePrintModal();
}

function printTable(rows, title) {
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<style>table{width:100%;border-collapse:collapse;}table,th,td{border:1px solid #000;padding:8px;text-align:left;}h1{text-align:center;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>' + title + '</h1>');
    printWindow.document.write('<table>');

    if (rows.length > 0) {
        // Write table header
        const ths = rows[0].parentElement.parentElement.querySelectorAll('thead th');
        printWindow.document.write('<thead><tr>');
        ths.forEach(th => printWindow.document.write('<th>' + th.textContent + '</th>'));
        printWindow.document.write('</tr></thead>');

        // Write filtered rows
        printWindow.document.write('<tbody>');
        let grandTotal = 0;
        rows.forEach(row => {
            printWindow.document.write('<tr>' + row.innerHTML + '</tr>');

            // Only for Sales section, calculate grand total
            if (currentPrintSection === 'sales') {
                const total = parseFloat(row.children[7].textContent.replace(/₦|,/g, '')) || 0;
                grandTotal += total;
            }

            // Replace amounts with Naira sign
            if (currentPrintSection === 'sales') {
                for (let i = 1; i <= 7; i++) {
                    row.children[i].textContent = '₦' + parseFloat(row.children[i].textContent.replace(/₦|,/g, '')).toLocaleString();
                }
            }
        });

        // Add grand total row for sales
        if (currentPrintSection === 'sales') {
            printWindow.document.write('<tr style="font-weight:bold;"><td colspan="7" style="text-align:right;">Grand Total:</td><td>₦' + grandTotal.toLocaleString() + '</td></tr>');
        }

        printWindow.document.write('</tbody>');
    } else {
        printWindow.document.write('<tr><td colspan="100%" style="text-align:center;">No entries for selected date range</td></tr>');
    }

    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}
