class Sidebar {
  render() {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';
    sidebar.innerHTML = `
         <div class="sidebar-header">
          <div class="d-flex flex-row align-items-center justify-content-center p-2 gap-3">
            <img src="./icon.webp"/>
            <h2>Tagawiti</h2>
          </div>
         </div>
         <hr />
         <nav class="menu">
           <a href="#/home" class="nav-links">
             <i class="lni lni-home-2"></i>
             <span>Beranda</span>
           </a>
           <a href="#/budget" class="nav-links">
             <i class="lni lni-wallet-1"></i>
             <span>Anggaran</span>
           </a>
           <a href="#/news" class="nav-links">
             <i class="lni lni-message-3-text"></i>
             <span>Berita</span>
           </a>
           <a href="#" id="logoutAnchor" class="nav-links">
             <i class="lni lni-exit"></i>
             <span>Keluar</span>
           </a>
         </nav>
         <div class="copyright-container">
           <p>Copyright © Pemerintah Desa Tagawiti.</p>
         </div>
       `;
    return sidebar;
  }
}

export default Sidebar;
