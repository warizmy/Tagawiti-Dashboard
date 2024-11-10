class SessionUtil {
  _render() {
    const sessionContainer = document.createElement('div');
    sessionContainer.id = 'session-status';
    sessionContainer.className = 'alert-container';
    sessionContainer.style.display = 'none';

    sessionContainer.innerHTML = `
     <div class="alert-inner-container">
          <div class="alert-box" style="background-color: #f44336; color: #fff; padding: 20px; border-radius: 10px; text-align: center; max-width: 400px;">
               <strong>Perhatian!</strong> Sesi Anda telah habis. Anda akan dialihkan ke halaman login.
          </div>
     </div> `;
    return sessionContainer;
  }

  static async checkSession() {
    try {
      const response = await fetch('http://localhost:5000/api/auth/check-session', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 401) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        const sessionStatus = document.getElementById('session-status');
        sessionStatus.style.display = 'block';

        setTimeout(() => {
          window.location.hash = '#/';
          window.location.reload();
        }, 4000);

        return false;
      }

      return response.status === 200;
    } catch (error) {
      console.error('Error saat mengecek sesi:', error);
      return false;
    }
  }

  static startSessionCheckInterval() {
    setInterval(async () => {
      await SessionUtil.checkSession();
    }, 5 * 60 * 1000);
  }
}

export default SessionUtil;
