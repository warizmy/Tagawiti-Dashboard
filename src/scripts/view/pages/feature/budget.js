import LoadingCircle from '../../../utils/loading';
import Popup from '../template-creators/pop-up-box';

/* eslint-disable no-unused-vars */
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
        <h1>Data Anggaran Desa</h1>
        <div class="category-filters">
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
  }

  async _fetchData() {
    const errorMessage = document.getElementById('errorMessage');
    try {
      const response = await fetch('http://localhost:5000/api/get/budget', {
        credentials: 'include', // Pastikan cookie sesi dikirim untuk autentikasi
      });

      // Cek jika status respons adalah 401 (Unauthorized)
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
    let title = 'Data Anggaran - ';

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
       `;

      document.getElementById('crudUpdate').addEventListener('click', () => {
        this._showPopup(selectedCategory);
      });
    } else {
      crudSection.innerHTML = '<p>Pilih Anggaran untuk menampilkan data anggaran.</p>';
    }
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
          const response = await fetch(`http://localhost:5000/api/update/budget/${selectedCategory.level}/${selectedCategory.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData),
            credentials: 'include', // Menyertakan cookie sesi untuk autentikasi
          });

          // Cek jika status respons adalah 401 (Unauthorized)
          if (response.status === 401) {
            window.location.hash = '#/';
            window.location.reload(); // Redirect ke halaman login jika tidak terautentikasi
            return; // Hentikan eksekusi fungsi setelah redirect
          }

          if (!response.ok) throw new Error('Gagal memperbarui data');

          await this._fetchData();
          this._showDataForSelectedCategory(selectedCategory.level, selectedCategory.id);
        }
      } catch (error) {
        console.error('Error updating budget:', error);
      } finally {
        loadingIndicator.hide();
      }
    }, () => this._resetUI());

    // Set nilai input dengan format Rupiah
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
}

export default Budget;
