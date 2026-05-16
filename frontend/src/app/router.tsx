import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '../components/layout/RootLayout';
import { App } from './App';
import { LoginPage } from '../modules/public/pages/LoginPage';
import { RegisterPage } from '../modules/public/pages/RegisterPage';
import { FeatureCatalogPage } from '../modules/public/pages/FeatureCatalogPage';
import { DebtsPage } from '../modules/debts/pages/DebtsPage';
import { IncomesPage } from '../modules/incomes/pages/IncomesPage';
import { ExpensesPage } from '../modules/expenses/pages/ExpensesPage';
import { DashboardPage } from '../modules/dashboard/pages/DashboardPage';
import { BudgetsPage } from '../modules/budgets/pages/BudgetsPage';
import { SavingsGoalsPage } from '../modules/savings-goals/pages/SavingsGoalsPage';
import { RecurringMovementsPage } from '../modules/recurring-movements/pages/RecurringMovementsPage';
import { FinancialCalendarPage } from '../modules/financial-calendar/pages/FinancialCalendarPage';
import { FinancialProjectionsPage } from '../modules/financial-projections/pages/FinancialProjectionsPage';
import { OnboardingPage } from '../modules/onboarding/pages/OnboardingPage';
import { DemoGuidePage } from '../modules/demo-guide/pages/DemoGuidePage';
import { ProductStatusPage } from '../modules/product-status/pages/ProductStatusPage';
import { FinancialImportsPage } from '../modules/financial-imports/pages/FinancialImportsPage';
import { NotificationsPage } from '../modules/notifications/pages/NotificationsPage';
import { CreditCardsPage } from '../modules/credit-cards/pages/CreditCardsPage';
import { FinancialAnalyticsPage } from '../modules/financial-analytics/pages/FinancialAnalyticsPage';
import { PricingPage } from '../modules/saas/pages/PricingPage';
import { SecurityCenterPage } from '../modules/saas/pages/SecurityCenterPage';
import { LegalPage } from '../modules/saas/pages/LegalPage';
import { LaunchReadinessPage } from '../modules/saas/pages/LaunchReadinessPage';
import { FinancialAssistantPage } from '../modules/financial-assistant/pages/FinancialAssistantPage';
import { QuickAddPage } from '../modules/quick-add/pages/QuickAddPage';
import { SecurityHardeningPage } from '../modules/security/pages/SecurityHardeningPage';
import { TestingDeployPage } from '../modules/testing-deploy/pages/TestingDeployPage';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <App /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/features', element: <FeatureCatalogPage /> },
      { path: '/incomes', element: <IncomesPage /> },
      { path: '/expenses', element: <ExpensesPage /> },
      { path: '/debts', element: <DebtsPage /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/budgets', element: <BudgetsPage /> },
      { path: '/savings-goals', element: <SavingsGoalsPage /> },
      { path: '/recurring-movements', element: <RecurringMovementsPage /> },
      { path: '/financial-calendar', element: <FinancialCalendarPage /> },
      { path: '/financial-projections', element: <FinancialProjectionsPage /> },
      { path: '/financial-assistant', element: <FinancialAssistantPage /> },
      { path: '/quick-add', element: <QuickAddPage /> },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/demo-guide', element: <DemoGuidePage /> },
      { path: '/product-status', element: <ProductStatusPage /> },
      { path: '/financial-imports', element: <FinancialImportsPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/credit-cards', element: <CreditCardsPage /> },
      { path: '/financial-analytics', element: <FinancialAnalyticsPage /> },
      { path: '/pricing', element: <PricingPage /> },
      { path: '/security-center', element: <SecurityCenterPage /> },
      { path: '/legal', element: <LegalPage /> },
      { path: '/launch-readiness', element: <LaunchReadinessPage /> },
      { path: '/security-hardening', element: <SecurityHardeningPage /> },
      { path: '/testing-deploy', element: <TestingDeployPage /> },
    ],
  },
]);
