import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoading } from '@/components/layout/PageLoading';
import { cryptanalysisPath, docsPath, labPath, ROUTES } from '@/config/routes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    HydrateFallback: PageLoading,
    children: [
      {
        index: true,
        lazy: () => import('@/pages/Home/HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: ROUTES.algorithms.slice(1),
        lazy: () =>
          import('@/pages/Algorithms/AlgorithmsPage').then((m) => ({
            Component: m.AlgorithmsPage,
          })),
      },
      {
        path: ROUTES.lab.slice(1),
        element: <Navigate to={labPath('caesar')} replace />,
      },
      {
        path: `${ROUTES.lab.slice(1)}/:algorithm`,
        lazy: () => import('@/pages/Laboratory/LabPage').then((m) => ({ Component: m.LabPage })),
      },
      {
        path: ROUTES.docs.slice(1),
        element: <Navigate to={docsPath('caesar')} replace />,
      },
      {
        path: `${ROUTES.docs.slice(1)}/:algorithm`,
        lazy: () =>
          import('@/pages/Documentation/DocumentationPage').then((m) => ({
            Component: m.DocumentationPage,
          })),
      },
      {
        path: ROUTES.cryptanalysis.slice(1),
        element: <Navigate to={cryptanalysisPath('caesar')} replace />,
      },
      {
        path: `${ROUTES.cryptanalysis.slice(1)}/:algorithm`,
        lazy: () =>
          import('@/pages/Cryptanalysis/CryptanalysisPage').then((m) => ({
            Component: m.CryptanalysisPage,
          })),
      },
      {
        path: ROUTES.exercises.slice(1),
        lazy: () =>
          import('@/pages/Exercises/ExercisesPage').then((m) => ({ Component: m.ExercisesPage })),
      },
      {
        path: ROUTES.compare.slice(1),
        lazy: () =>
          import('@/pages/Comparison/ComparisonPage').then((m) => ({
            Component: m.ComparisonPage,
          })),
      },
      {
        path: '*',
        lazy: () =>
          import('@/pages/NotFound/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
]);
