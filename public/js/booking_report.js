document.addEventListener("DOMContentLoaded", function() {
    loadBookingReport();
    updateBookingCount();  // Ensure count is updated when the page loads
});

// Load completed bookings from localStorage and display them in the booking report, showing the date only once per day
async function loadBookingReport() {
    const res1 = await fetch("/api/v1/bookings")
    let bks = await res1.json() || [];
    const completedBookings = bks
    .filter(booking => !booking.isConfirmed)
    .sort((a, b) => 
    new Date(b.completedDate || 0) - new Date(a.completedDate || 0)
    );


    const bookingReportDiv = document.getElementById('booking-report');
    bookingReportDiv.innerHTML = ''; // Clear the report section first

    // If no completed bookings, display a message
    if (completedBookings.length === 0) {
        bookingReportDiv.innerHTML = '<p>No completed bookings available.</p>';
        return;
    }

    let lastDisplayedDate = ''; // To keep track of the last displayed date
 
    completedBookings.forEach(booking => {
        // Ensure completedDate exists and is in a valid format
        let bookingDate = booking.completedDate ? new Date(booking.completedDate) : null;

        // If completedDate is not valid, set it to the current date
        if (!bookingDate || isNaN(bookingDate.getTime())) {
            bookingDate = new Date(); // Default to current date if the completedDate is invalid or missing
        }

        const formattedBookingDate = bookingDate.toLocaleDateString(); // Format the booking date

        // Only display the date if it's different from the last displayed date
        if (formattedBookingDate !== lastDisplayedDate) {
            const dateHeader = document.createElement('h2');
            dateHeader.textContent = `Bookings for ${formattedBookingDate}`;
            dateHeader.classList.add('date-header'); // Add the new class for styling
            bookingReportDiv.appendChild(dateHeader);
            lastDisplayedDate = formattedBookingDate; // Update the last displayed date
        }

        // Create and append the booking entry
        const bookingInfo = document.createElement('div');
        bookingInfo.innerHTML = `
            <table>
                <tr>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Duration</th>
                    <th>Room No</th>
                    <th>Room Price</th>
                    <th>Room Type</th>
                    <th>Number of Days</th>
                    <th>Total Amount</th>
                </tr>
                <tr>
                    <td>${booking.fullName}</td>
                    <td>${booking.phoneNumber}</td>
                    <td>
                    ${booking.durationOfStayStart ? booking.durationOfStayStart.split("T")[0] : "-"}
                     to 
                    ${booking.durationOfStayEnd ? booking.durationOfStayEnd.split("T")[0] : "-"}
                    </td>
                    <td>${booking.roomNumber}</td>
                    <td>${booking.roomPrice}</td>
                    <td>${booking.roomType}</td>
                    <td>${booking.numberOfDays}</td>
                    <td>${booking.totalAmount}</td>
                </tr>
            </table>
        `;
        bookingReportDiv.appendChild(bookingInfo);
    });

    // Update the booking count after loading the report
    updateBookingCount();
}

// Function to update the booking count in the dashboard card
async function updateBookingCount() {
    const res1 = await fetch("/api/v1/bookings")
    let bks = await res1.json() || [];
    const completedBookings = bks.filter(booking => !booking.isConfirmed);
    const bookingCount = completedBookings.length;

    // Update the booking count in the UI (card in the dashboard)
    const bookingCard = document.getElementById('bookings');
    const statsElement = document.querySelector('.stats');
    if (statsElement) {
        statsElement.textContent = bookingCount;
    }
}

// Function to clear completed bookings from localStorage (only for this report)
async function clearBookings() {
    if (confirm('Are you sure you want to clear all completed bookings from this report?')) {

        //do this:
        const re = await fetch("/api/v1/bookings", {
            method:"DELETE",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify({completed:true})
        })
        // Clear the completed bookings from localStorage (affects only the booking report)
        //localStorage.removeItem('completedBookings');

        // After clearing, update the report section to reflect the change
        const bookingReportDiv = document.getElementById('booking-report');
        bookingReportDiv.innerHTML = '<p>No completed bookings available.</p>';
        
        // Reset booking count after clearing bookings
        updateBookingCount();
    }
}

// Simulate adding a new completed booking for testing
async function addBooking() {
    const res1 = await fetch("/api/v1/bookings")
    const completedBookings = await res1.json() || [];
     

  
    completedBookings.push(newBooking); // Add to completed bookings
    const res = await fetch("/api/v1/bookings", {
        method:"POST",
        headers:{
            "Content-type":"application/json"
        },
        body:JSON.stringify(completedBookings)
    })
    // Save back to localStorage
    //localStorage.setItem('completedBookings', JSON.stringify(completedBookings));

    // Reload the bookings on the page
    loadBookingReport();

    // Update the booking count
    updateBookingCount();
}


// 🔥 Modal controls
function openPrintModal() {
    document.getElementById('printModal').style.display = 'block';
}

function closePrintModal() {
    document.getElementById('printModal').style.display = 'none';
}

// 🔥 Updated printBookingReport function to use modal dates
async function printBookingReport() {

    const fromDate = document.getElementById("modalFromDate").value;
    const toDate = document.getElementById("modalToDate").value;

    if (!fromDate || !toDate) {
        alert("Please select both From and To dates.");
        return;
    }

    closePrintModal();

    const res = await fetch("/api/v1/bookings");
    let bks = await res.json() || [];

    const filteredBookings = bks.filter(booking => {
        if (!booking.completedDate) return false;
        const bookingDate = new Date(booking.completedDate);
        return (
            bookingDate >= new Date(fromDate) &&
            bookingDate <= new Date(toDate + "T23:59:59") &&
            !booking.isConfirmed
        );
    });

    if (filteredBookings.length === 0) {
        alert("No completed bookings found for selected dates.");
        return;
    }

    let grandTotal = 0;

    const printWindow = window.open("", "", "width=1000,height=800");

    printWindow.document.write(`
        <html>
        <head>
            <title>Montevar Hotel Booking Report</title>

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

            <h1>Booking Report</h1>

            <div class="date-range">
                <strong>From:</strong> ${fromDate}
                &nbsp;&nbsp;
                <strong>To:</strong> ${toDate}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Full Name</th>
                        <th>Phone</th>
                        <th>Room No</th>
                        <th>Room Type</th>
                        <th>Days</th>
                        <th>Total (₦)</th>
                    </tr>
                </thead>
                <tbody>
    `);

    filteredBookings.forEach(booking => {
        const bookingDate = new Date(booking.completedDate).toLocaleDateString();
        const totalAmount = Number(booking.totalAmount) || 0;
        grandTotal += totalAmount;

        printWindow.document.write(`
            <tr>
                <td>${bookingDate}</td>
                <td>${booking.fullName}</td>
                <td>${booking.phoneNumber}</td>
                <td>${booking.roomNumber}</td>
                <td>${booking.roomType}</td>
                <td>${booking.numberOfDays}</td>
                <td>₦${totalAmount.toLocaleString()}</td>
            </tr>
        `);
    });

    printWindow.document.write(`
            <tr class="grand-total">
                <td colspan="6" style="text-align:right;">GRAND TOTAL</td>
                <td>₦${grandTotal.toLocaleString()}</td>
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
}
