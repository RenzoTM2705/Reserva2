import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';

/**
 * Rutas base. Las páginas del producto se añadirán por fases:
 * - Fase 2: landing, página de negocio y reserva pública.
 * - Fase 3: autenticación y panel.
 */
export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
]);
