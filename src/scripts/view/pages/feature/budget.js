import LoadingCircle from '../../../utils/loading';
import Popup from '../template-creators/pop-up-box';

class Budget {
  constructor() {
    this._render();
    this.history = [];
  }

  _render() {
    document.title = 'Tagawiti Dashboard - Anggaran';

    const budgetContentContainer = document.createElement('div');
    budgetContentContainer.className = 'budget-content-container';

    budgetContentContainer.innerHTML = `
      <header>
        <h1>Data Anggaran</h1>
        <div class="category-filters">
          <button id="addMainCategory" class="btn-add-main">Tambah anggaran</button>
          <button>
            <img src="./images/reset.webp" alt="reset-img" id="resetButton" class="reset-button" style="display: none;">
          </button>
          <select id="categorySelect" disabled>
            <option value=""></option>
          </select>
          <select id="subCategorySelect" style="display: none;" disabled>
            <option value=""></option>
          </select>
          <select id="subSubCategorySelect" style="display: none;" disabled>
            <option value=""></option>
          </select>
        </div>
      </header>
      <section id="crudSection" class="crud-section">
        <p>Pilih Anggaran untuk menampilkan data anggaran.</p>
      </section>
    `;

    return budgetContentContainer;
  }

  async InitializeEvent() {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();
      await this._fetchData();
      this._setupEventListeners();
    } catch (error) {
      console.error('Error initializing event:', error);
    } finally {
      loadingIndicator.hide();
    }

    document.getElementById('addMainCategory').addEventListener('click', () => {
      this._showAddMainCategoryForm();
    });
  }

  async _fetchData() {
    const errorMessage = document.getElementById('errorMessage');
    try {
      const response = await fetch('https://api.desatagawiti.com/api/get/budget', {
        credentials: 'include',
      });

      if (response.status === 401) {
        window.location.href = '#/';
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      this.categories = result.data;

      const categorySelect = document.getElementById('categorySelect');
      categorySelect.innerHTML = `
            <option value="">--Pilih Anggaran--</option>
            ${this.categories
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join('')}
        `;
      categorySelect.disabled = false;
    } catch (error) {
      if (error.name === 'TypeError') {
        errorMessage.innerText = 'Network error: Could not reach the server. Please check your connection or server status.';
      } else {
        errorMessage.innerText = `Error fetching categories: ${error.message}`;
      }
      errorMessage.style.display = 'block';
      console.error('Error fetching categories:', error);
    }
  }

  _setupEventListeners() {
    const categorySelect = document.getElementById('categorySelect');
    const subCategorySelect = document.getElementById('subCategorySelect');
    const subSubCategorySelect = document.getElementById('subSubCategorySelect');
    const resetButton = document.getElementById('resetButton');

    categorySelect.addEventListener('change', () => {
      this.history = [];
      resetButton.style.display = categorySelect.value ? 'inline-block' : 'none';
      this._filterSubCategories();
      this._showDataForSelectedCategory('utama', categorySelect.value);
      subCategorySelect.style.display = categorySelect.value ? 'inline-block' : 'none';
      subSubCategorySelect.style.display = 'none';
      subSubCategorySelect.selectedIndex = 0;
    });

    subCategorySelect.addEventListener('change', () => {
      this.history = this.history.filter(item => item.level === 'utama');
      this._filterSubSubCategories();
      this._showDataForSelectedCategory('sub_utama', subCategorySelect.value);
      subSubCategorySelect.style.display = subCategorySelect.value ? 'inline-block' : 'none';
    });

    subSubCategorySelect.addEventListener('change', () => {
      this.history = this.history.filter(item => item.level === 'utama' || item.level === 'sub_utama');
      this._showDataForSelectedCategory('sub_kedua', subSubCategorySelect.value);
    });

    resetButton.addEventListener('click', () => this._resetUI());
  }

  _filterSubCategories() {
    const categorySelect = document.getElementById('categorySelect');
    const subCategorySelect = document.getElementById('subCategorySelect');
    const selectedCategory = categorySelect.value;

    subCategorySelect.innerHTML = '<option value="">--Pilih Sub-Bidang--</option>';

    const selected = this.categories.find((cat) => cat.id === parseInt(selectedCategory, 10));

    if (selected && selected.subCategories.length > 0) {
      selected.subCategories.forEach((subCat) => {
        const option = document.createElement('option');
        option.value = subCat.id;
        option.textContent = subCat.name;
        subCategorySelect.appendChild(option);
      });
      subCategorySelect.disabled = false;
    } else {
      subCategorySelect.disabled = true;
      document.getElementById('subSubCategorySelect').disabled = true;
    }
  }

  _filterSubSubCategories() {
    const subCategorySelect = document.getElementById('subCategorySelect');
    const subSubCategorySelect = document.getElementById('subSubCategorySelect');
    const selectedSubCategory = subCategorySelect.value;

    subSubCategorySelect.innerHTML = '<option value="">--Pilih Kategori--</option>';

    const selected = this.categories
      .flatMap((cat) => cat.subCategories)
      .find((subCat) => subCat.id === parseInt(selectedSubCategory, 10));

    if (selected && selected.subCategories && selected.subCategories.length > 0) {
      selected.subCategories.forEach((subSubCat) => {
        const option = document.createElement('option');
        option.value = subSubCat.id;
        option.textContent = subSubCat.name;
        subSubCategorySelect.appendChild(option);
      });
      subSubCategorySelect.disabled = false;
    } else {
      subSubCategorySelect.disabled = true;
    }
  }

  _showDataForSelectedCategory(level, id) {
    const crudSection = document.getElementById('crudSection');
    let selectedCategory;
    let title = '';

    if (!id) {
      crudSection.innerHTML = '<p>Pilih Anggaran untuk menampilkan data anggaran.</p>';
      return;
    }

    this.history.push({ level, id });

    const utama = this.history.find(item => item.level === 'utama');
    const subUtama = this.history.find(item => item.level === 'sub_utama');
    const subKedua = this.history.find(item => item.level === 'sub_kedua');

    if (utama) {
      const utamaData = this.categories.find(cat => cat.id === parseInt(utama.id, 10));
      if (utamaData) {
        title += utamaData.name;
        utamaData.level = 'utama';
        selectedCategory = utamaData;
      }
    }
    if (subUtama) {
      const subUtamaData = this.categories
        .flatMap(cat => cat.subCategories)
        .find(subCat => subCat.id === parseInt(subUtama.id, 10));
      if (subUtamaData) {
        title += ` / ${subUtamaData.name}`;
        subUtamaData.level = 'sub_utama';
        selectedCategory = subUtamaData;
      }
    }
    if (subKedua) {
      const subKeduaData = this.categories
        .flatMap(cat => cat.subCategories)
        .flatMap(subCat => subCat.subCategories)
        .find(subSubCat => subSubCat.id === parseInt(subKedua.id, 10));
      if (subKeduaData) {
        title += ` / ${subKeduaData.name}`;
        subKeduaData.level = 'sub_kedua';
        selectedCategory = subKeduaData;
      }
    }

    if (selectedCategory) {
      crudSection.innerHTML = `
        <h2>${title}</h2>
        <table>
          <thead>
            <tr>
              <th>Nilai Anggaran</th>
              <th>Realisasi</th>
              <th>Selisih</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rp ${selectedCategory.totalBudget.toLocaleString()}</td>
              <td>Rp ${selectedCategory.realized.toLocaleString()}</td>
              <td>Rp ${selectedCategory.surplusDeficit.toLocaleString()}</td>
              <td>
                <button class="entryCRUD" id="crudUpdate">Edit</button>
                <button class="entryCRUD" id="crudDelete">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
        ${this._generateAddButton(level, selectedCategory.id)} <!-- Tambahkan tombol "Tambah" -->
      `;

      document.getElementById('crudDelete').addEventListener('click', async () => {
        await this._deleteCategory(level, id);
      });

      document.getElementById('crudUpdate').addEventListener('click', () => {
        this._showPopup(selectedCategory);
      });

      const addButton = document.getElementById(level === 'utama' ? 'addSubCategory' : 'addSubSubCategory');
      if (addButton) {
        addButton.addEventListener('click', () => {
          this._showAddCategoryForm(level === 'utama' ? 'sub_utama' : 'sub_kedua', selectedCategory.id);
        });
      }
    } else {
      crudSection.innerHTML = '<p>Pilih Anggaran untuk menampilkan data anggaran.</p>';
    }
  }

  // eslint-disable-next-line no-unused-vars
  _generateAddButton(level, categoryId) {
    if (level === 'utama') {
      return '<button id="addSubCategory" class="btn-add mt-3">Tambah Sub Bidang</button>';
    }
    if (level === 'sub_utama') {
      return '<button id="addSubSubCategory" class="btn-add mt-3">Tambah Kategori</button>';
    }
    return '';
  }

  _showAddMainCategoryForm() {
    const crudSection = document.getElementById('crudSection');
    crudSection.innerHTML = `
      <h2>Tambah Anggaran</h2>
      <form id="addMainCategoryForm" class="d-flex flex-column gap-3 px-3 py-2">
        <div class="form-group d-flex flex-column gap-1">
          <label for="categoryName">Nama</label>
          <input type="text" id="categoryName" class="form-control" required placeholder="Masukkan nama anggaran">
        </div>
        <div class="form-group d-flex flex-column gap-1">
          <label for="categoryBudget">Anggaran</label>
          <input type="text" id="categoryBudget" class="form-control" required placeholder="Masukkan nilai anggaran">
        </div>
        <div class="form-group d-flex flex-column gap-1">
          <label for="categoryBuying">Realisasi</label>
          <input type="text" id="categoryBuying" class="form-control" required placeholder="Masukkan realisasi anggaran">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-save-main-cat">Simpan</button>
          <button type="button" id="backButton" class="btn-back">Kembali</button>
        </div>
      </form>
    `;

    const budgetInput = document.getElementById('categoryBudget');
    const buyingInput = document.getElementById('categoryBuying');

    // Tambahkan format Rupiah
    this._formatToRupiah(budgetInput);
    this._formatToRupiah(buyingInput);

    document.getElementById('backButton').addEventListener('click', () => {
      this._resetUI();
    });

    document.getElementById('addMainCategoryForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('categoryName').value;
      const budget = parseInt(budgetInput.dataset.rawValue || '0', 10); // Gunakan dataset untuk nilai asli
      const buying = parseInt(buyingInput.dataset.rawValue || '0', 10);

      await this._addCategory('utama', null, { name, budget, buying });
    });
  }

  _showAddCategoryForm(level, parentId) {
    const crudSection = document.getElementById('crudSection');
    const title = level === 'sub_utama' ? 'Tambah Sub Bidang' : 'Tambah Kategori';

    crudSection.innerHTML = `
        <h2>${title}</h2>
        <form id="addCategoryForm" class="d-flex flex-column gap-3 px-3 py-2">
            <div class="form-group d-flex flex-column gap-1">
                <label for="categoryName">Nama</label>
                <input type="text" id="categoryName" class="form-control" required placeholder="Masukkan nama">
            </div>
            <div class="form-group d-flex flex-column gap-1">
                <label for="categoryBudget">Anggaran</label>
                <input type="text" id="categoryBudget" class="form-control" required placeholder="Masukkan anggaran">
            </div>
            <div class="form-group d-flex flex-column gap-1">
                <label for="categoryBuying">Realisasi</label>
                <input type="text" id="categoryBuying" class="form-control" required placeholder="Masukkan realisasi anggaran">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn-save-main-cat">Simpan</button>
                <button type="button" id="backButton" class="btn-back">Kembali</button>
            </div>
        </form>
    `;

    const budgetInput = document.getElementById('categoryBudget');
    const buyingInput = document.getElementById('categoryBuying');

    // Tambahkan format Rupiah
    this._formatToRupiah(budgetInput);
    this._formatToRupiah(buyingInput);

    document.getElementById('backButton').addEventListener('click', () => {
      this._showDataForSelectedCategory(level === 'sub_utama' ? 'utama' : 'sub_utama', parentId);
    });

    document.getElementById('addCategoryForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('categoryName').value;
      const budget = parseInt(budgetInput.dataset.rawValue || '0', 10); // Gunakan dataset untuk nilai asli
      const buying = parseInt(buyingInput.dataset.rawValue || '0', 10);

      await this._addCategory(level, parentId, { name, budget, buying });
    });
  }

  async _addCategory(level, parentId, data) {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();
      const response = await fetch(`https://api.desatagawiti.com/api/add/category/${level}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, ...data }),
        credentials: 'include',
      });

      // eslint-disable-next-line no-unused-vars
      const result = await response.json();

      loadingIndicator.hide();

      if (response.ok) {
        this._showPopupMessage('Data Berhasil ditambahkan!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        await this._fetchData();
        this._showDataForSelectedCategory(level, parentId);
      } else {
        this._showPopupMessage('Gagal Menambahkan Data!', 'error');
      }
    } catch (error) {
      loadingIndicator.hide();
      console.error('Error adding category:', error);
      this._showPopupMessage('Error adding category', 'error');
    }
  }

  async _deleteCategory(level, id) {
    const loadingIndicator = new LoadingCircle();
    try {
      const userConfirmed = await this._showConfirmationPopup(
        'Konfirmasi Hapus',
        'Apakah Anda yakin ingin menghapus kategori ini?',
      );

      if (!userConfirmed) {
        return;
      }

      loadingIndicator.show();

      const response = await fetch(`https://api.desatagawiti.com/api/delete/budget/${level}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      // eslint-disable-next-line no-unused-vars
      const result = await response.json();

      loadingIndicator.hide();

      if (response.ok) {
        this._showPopupMessage('Kategori berhasil dihapus!', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        await this._fetchData();
      } else {
        this._showPopupMessage('Gagal menghapus kategori.', 'error');
      }
    } catch (error) {
      loadingIndicator.hide();
      console.error('Error deleting category:', error);
      this._showPopupMessage('Error deleting category', 'error');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  _showConfirmationPopup(title, message) {
    return new Promise((resolve) => {
      const existingPopup = document.getElementById('confirmationPopup');
      if (existingPopup) {
        existingPopup.remove();
      }

      const popup = document.createElement('div');
      popup.id = 'confirmationPopup';
      popup.className = 'confirmation-popup';
      popup.innerHTML = `
        <div class="popup-content">
          <h2>${title}</h2>
          <p>${message}</p>
          <div class="popup-actions">
            <button id="confirmYes" class="btn-confirm">Ya</button>
            <button id="confirmNo" class="btn-cancel">Tidak</button>
          </div>
        </div>
      `;

      document.body.appendChild(popup);

      document.getElementById('confirmYes').addEventListener('click', () => {
        popup.remove();
        resolve(true);
      });

      document.getElementById('confirmNo').addEventListener('click', () => {
        popup.remove();
        resolve(false);
      });
    });
  }

  _showPopupMessage(message, type) {
    const existingPopup = document.getElementById('popupMessage');
    const existingOverlay = document.getElementById('popupOverlay');
    if (existingPopup) {
      existingPopup.remove();
    }
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'popupOverlay';
    overlay.className = 'popupOverlay';

    const popup = document.createElement('div');
    popup.id = 'popupMessage';
    popup.className = `popupMessage ${type}`;
    popup.innerHTML = `
      <div class="popup-content">
        <p>${message}</p>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(popup);
  }

  _showPopup(selectedCategory) {
    const popup = new Popup(async ({ totalBudget, realizedBudget }) => {
      const loadingIndicator = new LoadingCircle();
      try {
        loadingIndicator.show();

        const updateData = {};

        if (totalBudget !== undefined && totalBudget !== null) {
          updateData.total_anggaran = totalBudget;
        } else {
          updateData.total_anggaran = selectedCategory.totalBudget;
        }

        if (realizedBudget !== undefined && realizedBudget !== null) {
          updateData.realisasi = realizedBudget;
        }

        if (Object.keys(updateData).length > 0) {
          const response = await fetch(`https://api.desatagawiti.com/api/update/budget/${selectedCategory.level}/${selectedCategory.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
            credentials: 'include',
          });

          if (response.status === 401) {
            window.location.hash = '#/';
            window.location.reload();
            return;
          }

          if (!response.ok) throw new Error('Gagal memperbarui data');

          window.location.reload();
          await this._fetchData();
          this._showDataForSelectedCategory(selectedCategory.level, selectedCategory.id);
        }
      } catch (error) {
        console.error('Error updating budget:', error);
      } finally {
        loadingIndicator.hide();
      }
    }, () => this._resetUI());

    const totalBudgetFormatted = selectedCategory.totalBudget ? `Rp ${selectedCategory.totalBudget.toLocaleString('id-ID')}` : '';
    const realizedBudgetFormatted = selectedCategory.realized ? `Rp ${selectedCategory.realized.toLocaleString('id-ID')}` : '';

    const totalBudgetInput = popup.popupContainer.querySelector('#totalBudget');
    const realizedBudgetInput = popup.popupContainer.querySelector('#realizedBudget');

    totalBudgetInput.value = totalBudgetFormatted;
    realizedBudgetInput.value = realizedBudgetFormatted;
  }

  _resetUI() {
    document.getElementById('categorySelect').selectedIndex = 0;
    document.getElementById('subCategorySelect').style.display = 'none';
    document.getElementById('subCategorySelect').selectedIndex = 0;
    document.getElementById('subSubCategorySelect').style.display = 'none';
    document.getElementById('subSubCategorySelect').selectedIndex = 0;
    document.getElementById('crudSection').innerHTML = '<p>Pilih kategori untuk menampilkan data anggaran.</p>';

    document.getElementById('resetButton').style.display = 'none';
    this.history = [];
  }

  _formatToRupiah(inputElement) {
    inputElement.addEventListener('input', (event) => {
      const value = event.target.value.replace(/[^0-9]/g, ''); // Hanya angka
      if (value) {
        event.target.value = `Rp. ${parseInt(value, 10).toLocaleString('id-ID')}`; // Format Rupiah
      } else {
        event.target.value = '';
      }
    });

    inputElement.addEventListener('blur', (event) => {
      const rawValue = event.target.value.replace(/[^0-9]/g, '');
      event.target.dataset.rawValue = rawValue;
    });
  }
}

export default Budget;
