import routes from './routes/routes';
import UrlParser from './routes/url-parser';
import SessionUtil from './utils/session';
import Profile from './view/component/profile';
import Sidebar from './view/component/sidebar';
import LoginPage from './view/pages/auth/login-page';
import Logout from './view/pages/auth/logout';
import DashboardMain from './view/pages/dashboard-home';
import Budget from './view/pages/feature/budget';
import NewsPage from './view/pages/feature/news';
import PasswordChangePage from './view/pages/profile/password-change';

class Main {
  constructor({
    content, dashboardContainer, loadingContainer, mainContentWrapper,
  }) {
    this._content = content;
    this._loadingContainer = loadingContainer;
    this._dashboardContainer = dashboardContainer;
    this._mainContentWrapper = mainContentWrapper;

    this.InitialAppShell();
  }

  InitialAppShell() {
    const sidebar = new Sidebar().render();
    this._dashboardContainer.insertBefore(sidebar, this._mainContentWrapper);

    const profile = new Profile().render();
    this._mainContentWrapper.insertBefore(profile, this._content);

    const sessionStatus = new SessionUtil()._render();
    document.body.appendChild(sessionStatus);

    const logout = new Logout();
    logout._initializeEvent();

    SessionUtil.startSessionCheckInterval();
  }

  renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const Page = routes[url];

    if (url === '/') {
      const loginPage = new LoginPage();

      document.body.removeChild(this._loadingContainer);

      document.body.innerHTML = '';
      document.body.appendChild(new Page()._render());
      loginPage._initializeEvent();

      document.body.appendChild(this._loadingContainer);

      this._dashboardContainer.style.display = 'none';
    } else {
      this._dashboardContainer.style.display = 'flex';
      this._content.innerHTML = '';
      this._content.appendChild(new Page()._render());
    }

    if (url === '/passwordchange') {
      const PasswordchangePage = new PasswordChangePage();
      PasswordchangePage.InitializeEvent();
    }

    if (url === '/home') {
      const DashboardMainPage = new DashboardMain();
      DashboardMainPage.InitializeEvent();
    }

    if (url === '/budget') {
      const BudgetPage = new Budget();
      BudgetPage.InitializeEvent();
    }
    if (url === '/news') {
      const newsPage = new NewsPage();
      newsPage.InitializeEvent();
    }
  }
}

export default Main;
