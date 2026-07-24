import './style.css';
import { router } from './router';
import {
  LoginView,
  DashboardView,
  ContactsView,
  LeadsView,
  OpportunitiesView,
  QuotationsView,
  ProductsView
} from './views';

// Register views to router
router.register('/', DashboardView, true);
router.register('/login', LoginView, false);
router.register('/contacts', ContactsView, true);
router.register('/leads', LeadsView, true);
router.register('/opportunities', OpportunitiesView, true);
router.register('/quotations', QuotationsView, true);
router.register('/products', ProductsView, true);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  router.init('app');
});
