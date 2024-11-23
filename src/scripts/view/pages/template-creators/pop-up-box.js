/* eslint-disable object-shorthand */
class Popup {
  constructor(onSubmit, onCancel) {
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
    this._render();
  }

  _render() {
    const contentContainer = document.querySelector('.budget-content-container');
    if (!contentContainer) {
      console.error('Container tidak ditemukan.');
      return;
    }

    this.popupContainer = document.createElement('div');
    this.popupContainer.className = 'popup-container';

    this.popupContainer.innerHTML = `
      <div class="popup-box">
        <button class="close-button" id="popupClose">&times;</button>
        <div class="pop-up-box-content">
          <h2 class="pb-4">Update Data Anggaran</h2>
          <form class="rounded-0 bg-body-secondary">
            <label for="totalBudget">Nominal Anggaran</label>
            <input type="text" id="totalBudget" placeholder="Rp 1.000.000" required />
            <label for="realizedBudget">Realisasi Anggaran</label>
            <input type="text" id="realizedBudget" placeholder="Rp 1.000.000" required />
          </form>
          <div class="pt-4 popup-actions">
            <button id="popupSubmit" class="popupSubmit">Simpan</button>
          </div> 
        </div>
      </div>
    `;

    contentContainer.appendChild(this.popupContainer);

    // Setup inputs with restrictions
    this._setupInputWithClearOnFocus(document.getElementById('totalBudget'));
    this._setupInputWithClearOnFocus(document.getElementById('realizedBudget'));

    // Event listeners for buttons
    document.getElementById('popupSubmit').addEventListener('click', this._handleSubmit.bind(this));
    document.getElementById('popupClose').addEventListener('click', this._handleCancel.bind(this));
  }

  _setupInputWithClearOnFocus(inputElement) {
    // Clear value completely on focus
    inputElement.addEventListener('focus', () => {
      inputElement.value = ''; // Empty the input field on focus
    });

    // Reformat as Rupiah on blur if there is a value
    inputElement.addEventListener('blur', () => {
      const value = inputElement.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      if (value) {
        inputElement.value = `Rp ${parseInt(value, 10).toLocaleString('id-ID')}`;
      } else {
        inputElement.value = ''; // Ensure field is empty if no input
      }
    });

    // Format the input while typing
    inputElement.addEventListener('input', () => {
      const cursorPosition = inputElement.selectionStart;
      const numericValue = inputElement.value.replace(/[^0-9]/g, '');
      inputElement.value = numericValue ? `Rp ${parseInt(numericValue, 10).toLocaleString('id-ID')}` : '';

      // Adjust cursor position
      const diff = inputElement.value.length - cursorPosition;
      inputElement.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
    });
  }

  _handleSubmit() {
    const totalBudgetInput = document.getElementById('totalBudget').value;
    const realizedBudgetInput = document.getElementById('realizedBudget').value;

    // Convert values to pure numbers before submitting
    const totalBudget = totalBudgetInput ? parseInt(totalBudgetInput.replace(/[^0-9]/g, ''), 10) : null;
    const realizedBudget = realizedBudgetInput ? parseInt(realizedBudgetInput.replace(/[^0-9]/g, ''), 10) : null;

    if (this.onSubmit) {
      this.onSubmit({
        totalBudget: totalBudget,
        realizedBudget: realizedBudget,
      });
    }
    this.close();
  }

  _handleCancel() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.close();
  }

  close() {
    const contentContainer = document.querySelector('.budget-content-container');
    if (contentContainer && this.popupContainer) {
      contentContainer.removeChild(this.popupContainer);
    }
  }
}

export default Popup;
