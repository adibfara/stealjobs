import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router';
import { ResumesPage } from '@/features/resume/components/ResumesPage';
import { ResumeEditorPage } from '@/features/resume/components/ResumeEditorPage';
import { ResumePreviewPage } from '@/features/resume/components/ResumePreviewPage';
import { ThemesPage } from '@/features/theme/ThemesPage';
import { ThemeEditorPage } from '@/features/theme/ThemeEditorPage';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const resumesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ResumesPage,
});

const resumeEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resume/$resumeId',
  component: ResumeEditorPage,
});

const resumePreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resume/$resumeId/preview',
  component: ResumePreviewPage,
});

const themesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/themes',
  component: ThemesPage,
});

const themeEditorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/themes/$themeId',
  component: ThemeEditorPage,
});

const routeTree = rootRoute.addChildren([
  resumesRoute,
  resumeEditorRoute,
  resumePreviewRoute,
  themesRoute,
  themeEditorRoute,
]);

export const router = createRouter({ routeTree, basepath: '/stealjobs/' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
