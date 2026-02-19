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
        salesData = data.totalSales || []; // <- save here
        const tableBody = document.getElementById('salesEntriesTable');
        tableBody.innerHTML = '';

        let grandTotal = 0;

        // Show latest entries first
        salesData.slice().reverse().forEach(entry => {
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
        if (salesData.length > 0) {
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

    // Add new stock entry to backend
    await fetch(`${salesUrl}dailyStorageEntry`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(storageEntry)
    });

    // Reload storage table with updated totals
    await loadStorageEntries();
    document.getElementById('storageForm').reset();
});

// Load storage entries and calculate totalAfter
async function loadStorageEntries() {
    const res = await fetch(`${salesUrl}dailyStorageEntry`);
    const data = await res.json();
    const rawStorageData = data.entries || [];

    const tableBody = document.getElementById('storageEntriesTable');
    tableBody.innerHTML = '';

    // Track cumulative stock per product
    let stockTotals = {};
    const sorted = [...rawStorageData].sort((a, b) => new Date(a.date) - new Date(b.date));

    let calculatedEntries = [];

    sorted.forEach(entry => {
        if (!stockTotals[entry.productName]) stockTotals[entry.productName] = 0;
        stockTotals[entry.productName] += entry.quantity;

        calculatedEntries.push({
            ...entry,
            totalAfter: stockTotals[entry.productName]
        });
    });

    // Save to storageData for usage calculation
    storageData = calculatedEntries;

    // Display newest first
    calculatedEntries.slice().reverse().forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.productName}</td>
            <td>${entry.quantity}</td>
            <td>${entry.totalAfter}</td>
        `;
        tableBody.appendChild(row);
    });

    // Update usage entries to reflect new stock
    await loadUsageEntries();
}

// Clear storage entries
document.getElementById('clearStorage').addEventListener('click', async function () {
    await fetch(`${salesUrl}dailyStorageEntry`, { method: "DELETE" });
    await loadStorageEntries();
});


// ----------------- USAGE SECTION -----------------
document.getElementById('usageForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const productName = document.getElementById('productNameUsage').value;
    const takeOutQuantity = parseInt(document.getElementById('quantityUsage').value) || 0;
    const dateTime = new Date().toLocaleString();

    const usageEntry = { productName, takeOutQuantity, date: dateTime };

    await fetch(`${salesUrl}storageUsageEntry`, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(usageEntry)
    });

    await loadUsageEntries();
    document.getElementById('usageForm').reset();
});

async function loadUsageEntries() {
    const res = await fetch(`${salesUrl}storageUsageEntry`);
    const data = await res.json();
    const rawUsageData = data.entries || [];

    const tableBody = document.getElementById('usageEntriesTable');
    tableBody.innerHTML = '';

    // Build stock totals from storageData first
    let stockTotals = {};
    storageData.forEach(entry => {
        if (!stockTotals[entry.productName]) stockTotals[entry.productName] = 0;
        stockTotals[entry.productName] += entry.quantity;
    });

    // Subtract all usage chronologically
    const sortedUsage = [...rawUsageData].sort((a, b) => new Date(a.date) - new Date(b.date));
    let calculatedUsage = [];

    sortedUsage.forEach(entry => {
        if (!stockTotals[entry.productName]) stockTotals[entry.productName] = 0;

        stockTotals[entry.productName] -= entry.takeOutQuantity;

        calculatedUsage.push({
            ...entry,
            remaining: stockTotals[entry.productName] >= 0 ? stockTotals[entry.productName] : 0
        });
    });

    // Save back to usageData for printing
    usageData = calculatedUsage;

    // Display newest first
    calculatedUsage.slice().reverse().forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.productName}</td>
            <td>${entry.takeOutQuantity}</td>
            <td>${entry.remaining}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Clear usage entries
document.getElementById('clearUsage').addEventListener('click', async function () {
    await fetch(`${salesUrl}storageUsageEntry`, { method: "DELETE" });
    await loadUsageEntries();
});


   // ----------------- PRINT MODAL -----------------
let salesData = [];   // hold fetched sales entries
let storageData = []; // hold fetched storage entries
let usageData = [];   // hold fetched usage entries

window.openPrintModal = function (section) {
    currentPrintSection = section;
    document.getElementById('printModal').style.display = 'block';
}

window.closePrintModal = function () {
    document.getElementById('printModal').style.display = 'none';
}

window.printSection = function () {
    const fromDate = document.getElementById('modalFromDate').value ? new Date(document.getElementById('modalFromDate').value) : null;
    const toDate = document.getElementById('modalToDate').value ? new Date(document.getElementById('modalToDate').value + "T23:59:59") : null;

    let entriesToPrint = [];
    let title = '';

    if (currentPrintSection === 'sales') {
        entriesToPrint = salesData.slice().filter(entry => {
            const entryDate = new Date(entry.date);
            if (fromDate && entryDate < fromDate) return false;
            if (toDate && entryDate > toDate) return false;
            return true;
        });
        title = 'End of Day Sales Report';
    } else if (currentPrintSection === 'storage') {
        entriesToPrint = storageData.slice().filter(entry => {
            const entryDate = new Date(entry.date);
            if (fromDate && entryDate < fromDate) return false;
            if (toDate && entryDate > toDate) return false;
            return true;
        });
        title = 'Saved Stock Entries';
    } else if (currentPrintSection === 'usage') {
        entriesToPrint = usageData.slice().filter(entry => {
            const entryDate = new Date(entry.date);
            if (fromDate && entryDate < fromDate) return false;
            if (toDate && entryDate > toDate) return false;
            return true;
        });
        title = 'Saved Stock Usage Entries';
    }

    printTable(entriesToPrint, title);
    closePrintModal();
}

function printTable(entries, title) {
    const printWindow = window.open('', '', 'height=600,width=900');
    printWindow.document.write('<html><head><title>' + title + '</title>');
    printWindow.document.write('<style>table{width:100%;border-collapse:collapse;}table,th,td{border:1px solid #000;padding:8px;text-align:left;}h1{text-align:center;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>' + title + '</h1>');
    printWindow.document.write('<table>');

    if (entries.length > 0) {
        // Table header
        if (currentPrintSection === 'sales') {
            printWindow.document.write('<thead><tr><th>Date</th><th>Bookings</th><th>Food</th><th>Drinks</th><th>Events</th><th>Laundry</th><th>Pool</th><th>Total</th></tr></thead>');
        } else if (currentPrintSection === 'storage') {
        printWindow.document.write('<thead><tr><th>Date</th><th>Product Name</th><th>Quantity</th><th>Total After</th></tr></thead>');
        }else if (currentPrintSection === 'usage') {
            printWindow.document.write('<thead><tr><th>Date</th><th>Product Name</th><th>Quantity Taken Out</th><th>Remaining</th></tr></thead>');
        }



        // Table body
        printWindow.document.write('<tbody>');

        let grandTotal = 0;
        entries.forEach(entry => {
            if (currentPrintSection === 'sales') {
                const bookings = entry.bookingsEndOfDaySales || 0;
                const food = entry.foodEndOfDaySales || 0;
                const drinks = entry.drinksEndOfDaySales || 0;
                const events = entry.eventsEndOfDaySales || 0;
                const laundry = entry.laundryEndOfDaySales || 0;
                const pool = entry.poolEndOfDaySales || 0;
                const total = entry.totalSales || 0;
                grandTotal += total;

                printWindow.document.write(`<tr>
                    <td>${entry.date}</td>
                    <td>₦${bookings.toLocaleString()}</td>
                    <td>₦${food.toLocaleString()}</td>
                    <td>₦${drinks.toLocaleString()}</td>
                    <td>₦${events.toLocaleString()}</td>
                    <td>₦${laundry.toLocaleString()}</td>
                    <td>₦${pool.toLocaleString()}</td>
                    <td>₦${total.toLocaleString()}</td>
                </tr>`);
            } else if (currentPrintSection === 'storage') {
                    printWindow.document.write(`<tr>
                        <td>${entry.date}</td>
                        <td>${entry.productName}</td>
                        <td>${entry.quantity}</td>
                        <td>${entry.totalAfter}</td>
                    </tr>`);

            } else if (currentPrintSection === 'usage') {
                printWindow.document.write(`<tr>
                    <td>${entry.date}</td>
                    <td>${entry.productName}</td>
                    <td>${entry.takeOutQuantity}</td>
                    <td>${entry.remaining}</td>
                </tr>`);
                }

        });

        // Add grand total for sales
        if (currentPrintSection === 'sales') {
            printWindow.document.write(`<tr style="font-weight:bold;">
                <td colspan="7" style="text-align:right;">Grand Total:</td>
                <td>₦${grandTotal.toLocaleString()}</td>
            </tr>`);
        }

        printWindow.document.write('</tbody>');
        } else {
        printWindow.document.write('<tbody><tr><td colspan="100%" style="text-align:center;">No entries for selected date range</td></tr></tbody>');
        }


    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

     // Load existing data immediately when page opens
        loadSalesEntries();
        loadStorageEntries();
        loadUsageEntries();
});
