import DashboardMain from '../view/pages/dashboard-home';
import Budget from '../view/pages/feature/budget';
import PasswordChangePage from '../view/pages/profile/password-change';

const { default: LoginPage } = require('../view/pages/auth/login-page');

const routes = {
  '/': LoginPage,
  '/home': DashboardMain,
  '/budget': Budget,
  '/passwordchange': PasswordChangePage,
};

export default routes;
