// register.js

// Projendeki API_BASE_URL nereden geliyorsa oradan alabilir veya buraya tanımlayabilirsin:
const API_BASE_URL = "http://localhost:5000/api"; 

document.getElementById('registerForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert("Şifreler birbiriyle uyuşmuyor!");
    return;
  }

  const registerData = {
    fullName: fullName,
    email: email,
    password: password,
    confirmPassword: confirmPassword
  };

  try {
    // 1. Register API İsteği
    const registerResponse = await fetch(`${API_BASE_URL}/Auth/Register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    if (registerResponse.ok) {
      // 2. Kayıt başarılıysa arka planda direkt Login isteği
      const loginResponse = await fetch(`${API_BASE_URL}/Auth/Login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();

        if (loginData.token) {
          localStorage.setItem('token', loginData.token);
        }

        // Ana sayfaya / Dashboard'a yönlendir
        window.location.href = '/dashboard.html'; 
      } else {
        // Otomatik login olamazsa login sayfasına at
        window.location.href = '/login.html';
      }
    } else {
      const errorData = await registerResponse.json();
      alert(errorData.message || 'Kayıt sırasında bir hata oluştu.');
    }
  } catch (error) {
    console.error('Bağlantı hatası:', error);
  }
});