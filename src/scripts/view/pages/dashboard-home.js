import LoadingCircle from '../../utils/loading';

class DashboardMain {
  constructor() {
    this._render();
  }

  _render() {
    document.title = 'Tagawiti Dashboard - Home';
    const dashboardContentContainer = document.createElement('div');
    dashboardContentContainer.className = 'dashboard-content-container';
    dashboardContentContainer.innerHTML = `
             <header>
                 <h1>Ringkasan Data Anggaran Desa</h1>
             </header>
             <section class="table-section">
                 <table>
                     <thead>
                         <tr>
                             <th>Tahun</th>
                             <th>Bidang</th>
                             <th>Sub-Bidang</th>
                             <th>Kategori</th>
                             <th>Nilai Anggaran</th>
                             <th>Realisasi</th>
                             <th>Selisih</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td>2023</td>
                             <td></td>
                             <td></td>
                             <td></td>
                             <td></td>
                             <td></td>
                             <td></td>
                         </tr>
                     </tbody>
                 </table>
                 <div class="dashboard-actions">
                     <button id="donwloadData">Unduh Data</button>
                     <button id="printData">Cetak Data</button>
                 </div>
             </section>
         `;
    return dashboardContentContainer;
  }

  async InitializeEvent() {
    const loadingIndicator = new LoadingCircle();
    try {
      loadingIndicator.show();

      await this.fetchData();
    } finally {
      loadingIndicator.hide();
    }
  }

  async fetchData() {
    //
  }
}

export default DashboardMain;
