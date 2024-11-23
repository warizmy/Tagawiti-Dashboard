import LoadingCircle from '../../../utils/loading';

class PasswordChangePage {
  constructor() {
    this._render();
  }

  _render() {
    document.title = 'Tagawiti Dashboard - Ganti Sandi';

    const elementContainer = document.createElement('div');
    elementContainer.className = 'element-container';

    elementContainer.innerHTML = `
     <div class="p-3 element-inner-container">
         <section class="pb-3 section-header ">
               <h1>Ganti Sandi</h1>
         </section>
         <div class="d-flex flex-column align-items-left justify-content-start p-5 w-100 box-content-container">
               <form id="formInput" class="d-flex gap-4" method="post">
                    <div class="mb-0">
                         <label for="inputNewPassword" class="form-label">Kata Sandi Baru</label>
                              <div class="input-group mb-3">
                                   <input type="password" class="rounded-0 form-control" id="inputNewPassword" placeholder="Masukan Kata Sandi Baru" aria-label="Username" required>
                              </div>
                    </div>
                    <div class="mb-0">
                         <label for="inputReenterNewPassword" class="form-label">Ulangi Kata Sandi Baru</label>
                              <div class="input-group mb-3">
                                   <input type="password" class="rounded-0 form-control" id="inputReenterNewPassword" required>
                              </div>
                    </div>
               </form>
               <p id="failed-txt" style="display: none; color:#ff0000"></p>
               <div class="d-flex flex-row align-items-center gap-1 mb-3 form-check">
                         <input type="checkbox" class="form-check-input mb-1" id="showPassword" style="font-size: 13px">
                         <label class="form-check-label" for="showPassword" style="font-size: 14px">Tampilkan Password</label>
               </div>
               <div class="d-flex gap-2 flex-row">
                    <button type="submit" class="d-flex flex-row align-items-center gap-1 px-4 py-1 btn-save " id="btnSave">
                         <i class="lni lni-check-circle-1"></i>
                         <span>Simpan</span>
                    </button>
                    <button class="btn btn-success px-4 py-1 d-flex flex-row align-items-center gap-1" id="btnReset">
                         <i class="lni lni-refresh-circle-1-clockwise"></i>                       
                         <span>Reset</span>
                    </button>
               </div>
         </div>
     </div>
     `;
    return elementContainer;
  }

  InitializeEvent() {
    this._initializeElements();

    this._resetInput();
    this._showPassword();
    this._handlePasswordChange();
  }

  _initializeElements() {
    this.newPasswordInput = document.getElementById('inputNewPassword');
    this.reenterNewPasswordInput = document.getElementById('inputReenterNewPassword');
    this.resetButton = document.getElementById('btnReset');
    this.showpassCheckBox = document.getElementById('showPassword');
    this.saveButton = document.getElementById('btnSave');
    this.failedTxt = document.getElementById('failed-txt');
    this.elementContainer = document.querySelector('.element-container');
  }

  _resetInput() {
    this.resetButton.addEventListener('click', () => {
      this.newPasswordInput.value = '';
      this.reenterNewPasswordInput.value = '';
      this.showpassCheckBox.checked = false;
    });
  }

  _showPassword() {
    this.showpassCheckBox.addEventListener('change', () => {
      const type = this.showpassCheckBox.checked ? 'text' : 'password';
      this.newPasswordInput.type = type;
      this.reenterNewPasswordInput.type = type;
    });
  }

  _handlePasswordChange() {
    this.saveButton.addEventListener('click', async (event) => {
      event.preventDefault();

      const newPassword = this.newPasswordInput.value;
      const confirmPassword = this.reenterNewPasswordInput.value;

      if (!newPassword || !confirmPassword) {
        this.failedTxt.textContent = 'Semua kolom harus diisi!';
        this.failedTxt.style.display = 'block';
        return;
      }

      if (newPassword !== confirmPassword) {
        this.failedTxt.textContent = 'Kata sandi tidak cocok!';
        this.failedTxt.style.display = 'block';
        return;
      }

      // Tampilkan loading indicator
      const loadingIndicator = new LoadingCircle();
      loadingIndicator.show();

      try {
        const response = await fetch('https://api.desatagawiti.com/api/admin/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ newPassword, confirmPassword }),
        });

        const data = await response.json();

        if (response.status === 200) {
          this._showSuccessPopup();
          // Logout user after password change
          await fetch('https://api.desatagawiti.com/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } else {
          this.failedTxt.textContent = data.message || 'Terjadi kesalahan saat mengganti kata sandi.';
          this.failedTxt.style.display = 'block';
        }
      } catch (error) {
        console.error('Error:', error);
        this.failedTxt.textContent = 'Terjadi kesalahan. Silakan coba lagi.';
        this.failedTxt.style.display = 'block';
      } finally {
        // Sembunyikan loading indicator setelah proses selesai
        loadingIndicator.hide();
      }
    });
  }

  _showSuccessPopup() {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'success-popup';
    popupContainer.innerHTML = `
       <div class="popup-box">
         <h2>Kata Sandi Berhasil Diubah</h2>
         <p>Anda akan diarahkan ke halaman login...</p>
       </div>
     `;

    const style = document.createElement('style');
    style.innerHTML = `
       .success-popup {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         background: rgba(0, 0, 0, 0.5);
         display: flex;
         justify-content: center;
         align-items: center;
         z-index: 1000;
       }
       .success-popup .popup-box {
         background: #fff;
         padding: 30px 40px;
         text-align: center;
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
       }
     `;

    document.head.appendChild(style);
    document.body.appendChild(popupContainer);

    setTimeout(() => {
      window.location.hash = '#/';
      window.location.reload();
    }, 2000);
  }
}

export default PasswordChangePage;
