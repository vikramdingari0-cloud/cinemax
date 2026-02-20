/* ================================
   EMAIL VALIDATION
================================ */
function isValidEmail(email) {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
    return pattern.test(email);
}

/* ================================
   LOGIN VALIDATION
================================ */
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

    window.location.href = "dashboard.html";
    return false;
}

/* ================================
   REGISTER VALIDATION
================================ */
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

/* ================================
   MOVIE SELECT
================================ */
function bookMovie(movieName) {
    localStorage.setItem("selectedMovie", movieName);
    window.location.href = "seat.html";
}

/* ================================
   DASHBOARD SEARCH (ANIMATED)
================================ */
document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchValue = this.value.toLowerCase();
            const cards = document.querySelectorAll(".movies-row .card");

            cards.forEach(card => {

                const titleElement = card.querySelector("h3");
                if (!titleElement) return;

                const movieTitle = titleElement.innerText.toLowerCase();

                if (movieTitle.includes(searchValue)) {
                    card.classList.remove("hide");
                } else {
                    card.classList.add("hide");
                }

            });
        });
    }

});

/* ================================
   SEAT PAGE
================================ */
document.addEventListener("DOMContentLoaded", function () {

    const seatContainer = document.getElementById("seatContainer");

    if (!seatContainer) return;

    const movieTitle = document.getElementById("movieTitle");
    const seatCount = document.getElementById("seatCount");
    const totalPrice = document.getElementById("totalPrice");

    const movieName = localStorage.getItem("selectedMovie") || "Movie";
    if (movieTitle) {
        movieTitle.innerText = "Booking for: " + movieName;
    }

    const seatPrice = 200;
    let selectedSeats = [];

    for (let i = 0; i < 48; i++) {

        const seat = document.createElement("div");
        seat.classList.add("seat");

        if (Math.random() < 0.2) {
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

        localStorage.setItem("seatCount", selectedSeats.length);
        localStorage.setItem("totalPrice", selectedSeats.length * seatPrice);

        window.location.href = "payment.html";
    };

});

/* ================================
   PAYMENT PAGE
================================ */
document.addEventListener("DOMContentLoaded", function () {

    const payMovie = document.getElementById("payMovie");

    if (!payMovie) return;

    document.getElementById("payMovie").innerText =
        localStorage.getItem("selectedMovie") || "-";

    document.getElementById("paySeats").innerText =
        localStorage.getItem("seatCount") || "0";

    document.getElementById("payTotal").innerText =
        localStorage.getItem("totalPrice") || "0";
});

/* ================================
   CONFIRMATION PAGE
================================ */
document.addEventListener("DOMContentLoaded", function () {

    const confMovie = document.getElementById("confMovie");

    if (!confMovie) return;

    document.getElementById("confMovie").innerText =
        localStorage.getItem("selectedMovie") || "-";

    document.getElementById("confSeats").innerText =
        localStorage.getItem("seatCount") || "0";

    document.getElementById("confTotal").innerText =
        localStorage.getItem("totalPrice") || "0";
});

/* ================================
   BOOKINGS PAGE
================================ */
document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("bookingContainer");

    if (!container) return;

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    if (bookings.length === 0) {
        container.innerHTML = "<p>No bookings yet.</p>";
        return;
    }

    bookings.forEach(booking => {

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <h3>${booking.movie}</h3>
            <p>Seats: ${booking.seats}</p>
            <p>Total Paid: ₹${booking.total}</p>
            <p>${booking.date}</p>
        `;

        container.appendChild(card);
    });

});
