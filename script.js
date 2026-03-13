/* =====================================
   AUTH PROTECTION
===================================== */
document.addEventListener("DOMContentLoaded", function () {

    const protectedPages = [
        "dashboard.html",
        "seat.html",
        "payment.html",
        "confirmation.html",
        "bookings.html"
    ];

    const currentPage = window.location.pathname.split("/").pop();
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (protectedPages.includes(currentPage) && !isLoggedIn) {
        window.location.href = "login.html";
    }
});


/* =====================================
   EMAIL VALIDATION
===================================== */
function isValidEmail(email) {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
    return pattern.test(email);
}


/* =====================================
   LOGIN
===================================== */
function validateLogin() {

    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();

    const emailError = document.getElementById("loginEmailError");
    const passError = document.getElementById("loginPasswordError");

    if (!emailError || !passError) return false;

    emailError.textContent = "";
    passError.textContent = "";

    if (!isValidEmail(email)) {
        emailError.textContent = "Enter valid email format";
        return false;
    }

    if (!password || password.length < 6) {
        passError.textContent = "Password must be at least 6 characters";
        return false;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);

    window.location.href = "dashboard.html";
    return false;
}


/* =====================================
   LOGOUT
===================================== */
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
}


/* =====================================
   REGISTER
===================================== */
function validateRegister() {

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passError = document.getElementById("passwordError");

    if (!nameError || !emailError || !passError) return false;

    nameError.textContent = "";
    emailError.textContent = "";
    passError.textContent = "";

    if (!name) {
        nameError.textContent = "Full name required";
        return false;
    }

    if (!isValidEmail(email)) {
        emailError.textContent = "Enter valid email format";
        return false;
    }

    if (!password || password.length < 6) {
        passError.textContent = "Password must be at least 6 characters";
        return false;
    }

    window.location.href = "login.html";
    return false;
}


/* =====================================
   MOVIE SELECT
===================================== */
function bookMovie(movieName) {
    localStorage.setItem("selectedMovie", movieName);
    window.location.href = "seat.html";
}


/* =====================================
   DASHBOARD SEARCH
===================================== */
document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        const value = this.value.toLowerCase();
        const cards = document.querySelectorAll(".movies-row .card");

        cards.forEach(card => {
            const title = card.querySelector("h3")?.innerText.toLowerCase();
            if (!title) return;
            card.classList.toggle("hide", !title.includes(value));
        });

    });
});


/* =====================================
   SEAT PAGE (GLOBAL LOCK SYSTEM)
===================================== */
document.addEventListener("DOMContentLoaded", function () {

    const seatContainer = document.getElementById("seatContainer");
    if (!seatContainer) return;

    const movieTitle = document.getElementById("movieTitle");
    const seatCount = document.getElementById("seatCount");
    const totalPrice = document.getElementById("totalPrice");

    const movieName = localStorage.getItem("selectedMovie") || "Movie";
    if (movieTitle) movieTitle.innerText = "Booking for: " + movieName;

    const seatPrice = 200;
    let selectedSeats = [];

    const globalKey = "movieSeats_" + movieName;
    let bookedSeats = JSON.parse(localStorage.getItem(globalKey)) || [];

    for (let i = 0; i < 48; i++) {

        const seat = document.createElement("div");
        seat.classList.add("seat");
        seat.innerText = i + 1;

        if (bookedSeats.includes(i)) {
            seat.classList.add("occupied");
        }

        seat.addEventListener("click", () => {

            if (seat.classList.contains("occupied")) return;

            seat.classList.toggle("selected");

            if (selectedSeats.includes(i)) {
                selectedSeats = selectedSeats.filter(s => s !== i);
            } else {
                selectedSeats.push(i);
            }

            if (seatCount) seatCount.innerText = selectedSeats.length;
            if (totalPrice) totalPrice.innerText = selectedSeats.length * seatPrice;
        });

        seatContainer.appendChild(seat);
    }

    window.proceedPayment = function () {

        if (selectedSeats.length === 0) {
            alert("Please select at least one seat!");
            return;
        }

        localStorage.setItem("seatNumbers", JSON.stringify(selectedSeats));
        localStorage.setItem("seatCount", selectedSeats.length);
        localStorage.setItem("totalPrice", selectedSeats.length * seatPrice);

        window.location.href = "payment.html";
    };
});


/* =====================================
   PAYMENT PAGE
===================================== */
document.addEventListener("DOMContentLoaded", function () {

    const payMovie = document.getElementById("payMovie");
    if (!payMovie) return;

    const movie = localStorage.getItem("selectedMovie");
    const seatNumbers = JSON.parse(localStorage.getItem("seatNumbers")) || [];
    const total = localStorage.getItem("totalPrice");

    document.getElementById("payMovie").innerText = movie || "-";
    document.getElementById("paySeats").innerText =
        seatNumbers.map(s => s + 1).join(", ");
    document.getElementById("payTotal").innerText = total || "0";

    const form = document.getElementById("paymentForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("cardName").value.trim();
        const number = document.getElementById("cardNumber").value.trim();
        const expiry = document.getElementById("expiry").value.trim();
        const cvv = document.getElementById("cvv").value.trim();

        if (!name) return alert("Enter cardholder name");
        if (!/^\d{16}$/.test(number)) return alert("Card number must be 16 digits");
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return alert("Expiry must be MM/YY");
        if (!/^\d{3}$/.test(cvv)) return alert("CVV must be 3 digits");

        const ticketID = "CP-" + Math.floor(100000 + Math.random() * 900000);
        const currentUser = localStorage.getItem("userEmail");
        const userKey = "bookings_" + currentUser;

        const booking = {
            ticketID,
            movie,
            seats: seatNumbers.map(s => s + 1),
            total,
            date: new Date().toLocaleString()
        };

        // Save to user bookings
        const bookings = JSON.parse(localStorage.getItem(userKey)) || [];
        bookings.push(booking);
        localStorage.setItem(userKey, JSON.stringify(bookings));

        // Lock seats globally
        const globalKey = "movieSeats_" + movie;
        let bookedSeats = JSON.parse(localStorage.getItem(globalKey)) || [];
        bookedSeats = [...bookedSeats, ...seatNumbers];
        localStorage.setItem(globalKey, JSON.stringify(bookedSeats));

        localStorage.setItem("ticketID", ticketID);

        window.location.href = "confirmation.html";
    });
});


/* =====================================
   CONFIRMATION PAGE
===================================== */
document.addEventListener("DOMContentLoaded", function () {

    const confMovie = document.getElementById("confMovie");
    if (!confMovie) return;

    document.getElementById("confMovie").innerText =
        localStorage.getItem("selectedMovie") || "-";

    const seats = JSON.parse(localStorage.getItem("seatNumbers")) || [];
    document.getElementById("confSeats").innerText =
        seats.map(s => s + 1).join(", ");

    document.getElementById("confTotal").innerText =
        localStorage.getItem("totalPrice") || "0";
});


/* =====================================
   BOOKINGS PAGE WITH CANCEL
===================================== */
document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("bookingContainer");
    if (!container) return;

    const currentUser = localStorage.getItem("userEmail");
    const userKey = "bookings_" + currentUser;

    let bookings = JSON.parse(localStorage.getItem(userKey)) || [];

    if (bookings.length === 0) {
        container.innerHTML = "<p>No bookings yet.</p>";
        return;
    }

    container.innerHTML = "";

    bookings.forEach(booking => {

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <h3>${booking.movie}</h3>
            <p><strong>Ticket ID:</strong> ${booking.ticketID}</p>
            <p><strong>Seats:</strong> ${booking.seats.join(", ")}</p>
            <p><strong>Total Paid:</strong> ₹${booking.total}</p>
            <p>${booking.date}</p>
            <button onclick="cancelBooking('${booking.ticketID}')">
                Cancel Booking
            </button>
        `;

        container.appendChild(card);
    });
});


/* =====================================
   CANCEL BOOKING FUNCTION
===================================== */
function cancelBooking(ticketID) {

    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const currentUser = localStorage.getItem("userEmail");
    const userKey = "bookings_" + currentUser;

    let bookings = JSON.parse(localStorage.getItem(userKey)) || [];

    const bookingToCancel = bookings.find(b => b.ticketID === ticketID);
    if (!bookingToCancel) return;

    const movieName = bookingToCancel.movie;
    const seatsToFree = bookingToCancel.seats.map(s => s - 1);

    // Remove from global seats
    const globalKey = "movieSeats_" + movieName;
    let bookedSeats = JSON.parse(localStorage.getItem(globalKey)) || [];

    bookedSeats = bookedSeats.filter(seat => !seatsToFree.includes(seat));
    localStorage.setItem(globalKey, JSON.stringify(bookedSeats));

    // Remove from user bookings
    bookings = bookings.filter(b => b.ticketID !== ticketID);
    localStorage.setItem(userKey, JSON.stringify(bookings));

    alert("Booking cancelled successfully!");
    location.reload();
}