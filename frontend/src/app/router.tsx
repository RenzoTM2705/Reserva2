import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '@/components/shared/site-layout';
import { PanelLayout } from '@/components/shared/panel-layout';
import { PageFallback } from '@/components/shared/page-fallback';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { RouteErrorPage } from '@/pages/RouteErrorPage';
import {
    BusinessPage,
    BookingPage,
    BookingStatusPage,
    LoginPage,
    RegisterPage,
    RecoverPage,
    OnboardingPage,
    DashboardPage,
    BookingsPage,
    CalendarPage,
    ServicesPage,
    StaffPage,
    CustomersPage,
    SettingsPage,
} from '@/app/lazy-pages';

function suspense(node: ReactNode) {
    return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

/**
 * Rutas de la aplicación.
 *
 * Público: landing, negocio, reserva, consulta por token y auth.
 * Privado: panel con guardia de sesión en PanelLayout.
 */
export const router = createBrowserRouter([
    {
        element: <SiteLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/', element: <HomePage /> },
            { path: '/negocio/:slug', element: suspense(<BusinessPage />) },
            { path: '/negocio/:slug/reservar', element: suspense(<BookingPage />) },
            { path: '/reserva/:token', element: suspense(<BookingStatusPage />) },
            { path: '/entrar', element: suspense(<LoginPage />) },
            { path: '/crear-cuenta', element: suspense(<RegisterPage />) },
            { path: '/recuperar', element: suspense(<RecoverPage />) },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
    {
        path: '/panel',
        element: <PanelLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            { index: true, element: suspense(<DashboardPage />) },
            { path: 'reservas', element: suspense(<BookingsPage />) },
            { path: 'calendario', element: suspense(<CalendarPage />) },
            { path: 'servicios', element: suspense(<ServicesPage />) },
            { path: 'profesionales', element: suspense(<StaffPage />) },
            { path: 'clientes', element: suspense(<CustomersPage />) },
            { path: 'configuracion', element: suspense(<SettingsPage />) },
        ],
    },
    {
        // El onboarding vive fuera del shell para no depender del negocio.
        path: '/panel/onboarding',
        element: suspense(<OnboardingPage />),
        errorElement: <RouteErrorPage />,
    },
]);
