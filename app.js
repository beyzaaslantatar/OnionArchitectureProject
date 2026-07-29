//Enter your own backend port
const API_BASE_URL = "http://localhost:5000/api"; 

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorAlert = document.getElementById("errorAlert");

    errorAlert.classList.add("d-none");

    try {
        const response = await fetch(`${API_BASE_URL}/Auth/Login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token); 
            localStorage.setItem("refreshToken", data.refreshToken)
            window.location.href = "dashboard.html"; 
        } else {
            const errorMsg = data.errors ? data.errors[0] : "Email or password is not correct";
            errorAlert.textContent = errorMsg;
            errorAlert.classList.remove("d-none");
        }
    } catch (error) {
        errorAlert.textContent = "Server problem";
        errorAlert.classList.remove("d-none");
    }
});

