class LoginPage {
  constructor() {
    this._render();
  }

  _render() {
    document.title = 'Tagawiti Dashboard - Masuk';

    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';
    loginContainer.innerHTML = `
    <div class="d-flex flex-column grid gap-5 justify-content-center align-items-center login-content-container" style="background-image: url(./images/login-container-bg.webp)">
        <h1>Tagawiti <span>Dashboard</span></h1>
        <div class="d-flex flex-column mb-3 justify-content-center align-items-center grid gap-4 box-container">
            <h4>Silahkan <span>Masuk</span></h4>
            <form method="post" id="loginForm">
                <div class="mb-3">
                  <label for="inputUsername" class="form-label">Masuk Sebagai</label>
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">
                          <i class="bi bi-person-fill"></i>
                        </span>
                        <input type="text" class="form-control" id="inputUsername" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
                    </div>
                </div>
                <div class="mb-3">
                  <label for="inputPassword" class="form-label">Kata Sandi</label>
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1">
                          <i class="bi bi-key-fill"></i>
                        </span>
                        <input type="password" class="form-control" id="inputPassword" placeholder="Masukan Kata Sandi" aria-label="Password" aria-describedby="basic-addon1">
                    </div>
                    <p id="authFailed-txt" style="display: none; color:#ff0000"></p>
                </div>
              <button type="submit" class="btn btn-primary" id="btnSubmit">Masuk</button>
            </form>
        </div>
    </div>`;

    return loginContainer;
  }

  _initializeEvent() {
    this._loginHandler();
  }

  _loginHandler() {
    const form = document.getElementById('loginForm');
    const autherror = document.getElementById('authFailed-txt');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const username = document.getElementById('inputUsername').value;
      const password = document.getElementById('inputPassword').value;

      if (username.trim() === '' || password.trim() === '') {
        autherror.innerText = 'Masukan username dan kata sandi!';
        autherror.style.display = 'block';
        return;
      }

      fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Sertakan cookie di permintaan
        body: JSON.stringify({ username, password }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 200) {
            window.location.hash = '#/home';
            window.location.reload();
          } else {
            autherror.innerText = 'Username atau kata sandi salah!';
            autherror.style.display = 'block';
          }
        })
        .catch(error => {
          console.error('Error:', error);
          autherror.innerText = 'Terjadi kesalahan. Coba lagi!';
          autherror.style.display = 'block';
        });
    });
  }
}

export default LoginPage;
