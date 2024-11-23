class Logout {
  _initializeEvent() {
    const logoutAnchor = document.getElementById('logoutAnchor');
    if (logoutAnchor) {
      logoutAnchor.addEventListener('click', (event) => {
        event.preventDefault();
        this._showPopup();
      });
    } else {
      console.error('Element logoutAnchor tidak ditemukan di DOM');
    }
  }

  _showPopup() {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'popup-container';

    const popupBox = document.createElement('div');
    popupBox.className = 'popup-box';
    popupBox.innerHTML = `
     <div class="d-flex flex-column justify-content-center align-items-center p-3">
         <p style="font-size: 20px">Apakah Anda yakin ingin keluar?</p>
         <div class="d-flex flex-row gap-2 justify-content-center">
           <button id="confirmLogout" class="btn btn-danger rounded-0">Ya</button>
           <button id="cancelLogout" class="btn btn-secondary rounded-0">Batal</button>
         </div>
     </div>
       `;

    popupContainer.appendChild(popupBox);
    document.body.appendChild(popupContainer);

    document.getElementById('confirmLogout').addEventListener('click', () => {
      this._handleLogout();
      document.body.removeChild(popupContainer);
    });

    document.getElementById('cancelLogout').addEventListener('click', () => {
      document.body.removeChild(popupContainer);
    });
  }

  _handleLogout() {
    // Proses logout ke backend
    fetch('https://api.desatagawiti.com/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 200) {
          window.location.hash = '#/';
          window.location.reload();
        } else {
          alert(`Logout gagal: ${data.message}`);
        }
      })
      .catch(error => console.error('Error:', error));
  }
}

export default Logout;
