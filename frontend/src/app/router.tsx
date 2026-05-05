import { createBrowserRouter } from 'react-router-dom';
import { App } from './App';
import { DebtsPage } from '../modules/debts/pages/DebtsPage';
import { IncomesPage } from '../modules/incomes/pages/IncomesPage';
import { ExpensesPage } from '../modules/expenses/pages/ExpensesPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/incomes',
    element: <IncomesPage />,
  },
  {
    path: '/expenses',
    element: <ExpensesPage />,
  },
  {
    path: '/debts',
    element: <DebtsPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
]);
