import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'lazysizes';
import '../styles/main.css';
import Main from './app';
import LoadingCircle from './utils/loading';
import ProfileDropdown from './utils/profileDropdown';

const app = new Main({
  content: document.querySelector('#mainContent'),
  dashboardContainer: document.getElementById('dashboardContainer'),
  loadingContainer: document.getElementById('loading-circle-container'),
  mainContentWrapper: document.querySelector('.main-content-wrapper'),
  profileImage: document.getElementById('profileImage'),
  dropdownMenu: document.getElementById('dropdownMenu'),
});

const loadingBar = new LoadingCircle();

window.addEventListener('hashchange', () => {
  document.querySelectorAll('.nav-links').forEach(link => {
    const pathName = window.location.hash.slice(1);
    if (link.getAttribute('href').slice(1) === pathName) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current', 'page');
    }
  });
  app.renderPage();
  window.scrollTo(0, 0);
});

window.addEventListener('load', async () => {
  document.querySelectorAll('.nav-links').forEach(link => {
    const pathName = window.location.hash.slice(1);
    if (link.getAttribute('href').slice(1) === pathName) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current', 'page');
    }
  });
  loadingBar.show();
  app.renderPage();
  loadingBar.hide();

  // eslint-disable-next-line no-new
  new ProfileDropdown('profileImage', 'dropdownMenu', 'dropdownItem');
});
