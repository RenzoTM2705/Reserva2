import { lazy } from 'react';

/**
 * Páginas cargadas en diferido.
 *
 * Viven en su propio módulo para que react-refresh vea aquí solo
 * componentes y router.tsx quede como configuración pura.
 */
export const BusinessPage = lazy(() =>
    import('@/pages/BusinessPage').then((m) => ({ default: m.BusinessPage })),
);
export const BookingPage = lazy(() =>
    import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })),
);
export const BookingStatusPage = lazy(() =>
    import('@/pages/BookingStatusPage').then((m) => ({ default: m.BookingStatusPage })),
);
export const LoginPage = lazy(() =>
    import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
export const RegisterPage = lazy(() =>
    import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
export const RecoverPage = lazy(() =>
    import('@/pages/RecoverPage').then((m) => ({ default: m.RecoverPage })),
);
export const OnboardingPage = lazy(() =>
    import('@/pages/OnboardingPage').then((m) => ({ default: m.OnboardingPage })),
);
export const DashboardPage = lazy(() =>
    import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
export const BookingsPage = lazy(() =>
    import('@/pages/BookingsPage').then((m) => ({ default: m.BookingsPage })),
);
export const CalendarPage = lazy(() =>
    import('@/pages/CalendarPage').then((m) => ({ default: m.CalendarPage })),
);
export const ServicesPage = lazy(() =>
    import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })),
);
export const StaffPage = lazy(() =>
    import('@/pages/StaffPage').then((m) => ({ default: m.StaffPage })),
);
export const CustomersPage = lazy(() =>
    import('@/pages/CustomersPage').then((m) => ({ default: m.CustomersPage })),
);
export const SettingsPage = lazy(() =>
    import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
