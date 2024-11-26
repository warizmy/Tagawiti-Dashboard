import LoadingCircle from '../../utils/loading';

class DashboardMain {
  constructor() {
    this._render();
  }

  _render() {
    document.title = 'Tagawiti Dashboard - Beranda';
    const dashboardContentContainer = document.createElement('div');
    dashboardContentContainer.className = 'dashboard-content-container';
    dashboardContentContainer.innerHTML = `
            <div class="d-flex align-items-center justify-content-between pe-5">
              <header>
                  <h1>Ringkasan Data Anggaran Desa</h1>
              </header>
              <section class="filter-section">
                  <label for="yearFilter">Tahun </label>
                  <select id="yearFilter" class="yearFilter"></select>
              </section>
            </div>
             <section class="table-section">
                 <table>
                     <thead>
                         <tr>
                             <th>No</th>
                             <th>Bidang</th>
                             <th>Nilai Anggaran</th>
                             <th>Realisasi</th>
                             <th>Selisih</th>
                         </tr>
                     </thead>
                     <tbody id="budget-table-body"></tbody>
                 </table>
             </section>
         `;
    return dashboardContentContainer;
  }

  async InitializeEvent() {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();

      await this.fetchData();

      document.getElementById('yearFilter').addEventListener('change', (event) => {
        this.filterDataByYear(event.target.value);
      });
    } finally {
      loadingIndicator.hide();
    }
  }

  async fetchData(year = 2023) {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();

      const response = await fetch(`https://api.desatagawiti.com/api/get/budget/year/${year}`, {
        credentials: 'include',
      });
      const result = await response.json();

      const yearResponse = await fetch('https://api.desatagawiti.com/api/get/years', {
        credentials: 'include',
      });
      const yearData = await yearResponse.json();

      const years = yearData.data.map((item) => item.tahun);

      if (Array.isArray(years)) {
        years.sort((a, b) => a - b);
        this.populateYearFilter(years);
      }

      if (response.ok) {
        this.renderBudgetTable(result.data);
      } else {
        console.error('Error fetching data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loadingIndicator.hide();
    }
  }

  filterDataByYear(year) {
    const loadingIndicator = new LoadingCircle();
    loadingIndicator.show();

    const yearFilter = document.getElementById('yearFilter');
    yearFilter.value = year;

    this.fetchData(year).finally(() => {
      loadingIndicator.hide();
    });
  }

  populateYearFilter(years) {
    const yearFilter = document.getElementById('yearFilter');
    const currentYear = yearFilter.value;

    yearFilter.innerHTML = '';
    years.forEach((year) => {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });

    if (currentYear && years.includes(parseInt(currentYear, 10))) {
      yearFilter.value = currentYear;
    } else {
      yearFilter.value = years[0];
    }
  }

  renderBudgetTable(data) {
    const tableBody = document.getElementById('budget-table-body');
    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="5">Tidak ada data untuk tahun ini</td></tr>';
      return;
    }

    let mainCategoryIndex = 1;
    data.forEach((kategoriUtama) => {
      const kategoriUtamaRow = document.createElement('tr');
      kategoriUtamaRow.className = 'bg-dark-subtle';
      kategoriUtamaRow.innerHTML = `
        <td style="font-weight: bold;">${mainCategoryIndex}</td>
        <td style="font-weight: bold;">${kategoriUtama.name}</td>
        <td>${this.formatCurrency(kategoriUtama.totalBudget)}</td>
        <td>${this.formatCurrency(kategoriUtama.realized)}</td>
        <td>${this.formatCurrency(kategoriUtama.surplusDeficit)}</td>
      `;
      tableBody.appendChild(kategoriUtamaRow);

      let subCategoryIndex = 1;
      kategoriUtama.subCategories.forEach((subUtama) => {
        const subUtamaRow = document.createElement('tr');
        subUtamaRow.className = 'bg-body-secondary';
        subUtamaRow.innerHTML = `
          <td style="padding-left: 30px;">${mainCategoryIndex}.${subCategoryIndex}</td>
          <td style="padding-left: 30px;">${subUtama.name}</td>
          <td>${this.formatCurrency(subUtama.totalBudget)}</td>
          <td>${this.formatCurrency(subUtama.realized)}</td>
          <td>${this.formatCurrency(subUtama.surplusDeficit)}</td>
        `;
        tableBody.appendChild(subUtamaRow);

        let subSubCategoryIndex = 1;
        subUtama.subCategories.forEach((subKedua) => {
          const subKeduaRow = document.createElement('tr');
          subKeduaRow.className = 'bg-body-secondary';
          subKeduaRow.innerHTML = `
            <td style="padding-left: 60px;">${mainCategoryIndex}.${subCategoryIndex}.${subSubCategoryIndex}</td>
            <td style="padding-left: 60px;">${subKedua.name}</td>
            <td>${this.formatCurrency(subKedua.totalBudget)}</td>
            <td>${this.formatCurrency(subKedua.realized)}</td>
            <td>${this.formatCurrency(subKedua.surplusDeficit)}</td>
          `;
          tableBody.appendChild(subKeduaRow);
          subSubCategoryIndex++;
        });
        subCategoryIndex++;
      });

      mainCategoryIndex++;
    });
  }

  formatCurrency(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }
}

export default DashboardMain;
