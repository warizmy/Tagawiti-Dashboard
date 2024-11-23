import DashboardMain from '../view/pages/dashboard-home';
import Budget from '../view/pages/feature/budget';
import NewsPage from '../view/pages/feature/news';
import PasswordChangePage from '../view/pages/profile/password-change';

const { default: LoginPage } = require('../view/pages/auth/login-page');

const routes = {
  '/': LoginPage,
  '/home': DashboardMain,
  '/budget': Budget,
  '/passwordchange': PasswordChangePage,
  '/news': NewsPage,
};

export default routes;
