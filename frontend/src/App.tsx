import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import './i18n/config';

import theme from './theme';
import { Layout } from './components/Layout';
import { ScrollRestoration } from './components/Layout/ScrollRestoration';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { RouteFallback } from './components/feedback/RouteFallback';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ConsultingPage = lazy(() => import('./pages/ConsultingPage').then((m) => ({ default: m.ConsultingPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    },
  },
});

// Wrap a lazy page in a per-route boundary so a crash on one page renders the
// explained ErrorState in place instead of blanking the whole shell.
const route = (element: React.ReactNode) => (
  <ErrorBoundary homeHref="/">{element}</ErrorBoundary>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <ErrorBoundary homeHref="/">
          <Router>
            <ScrollRestoration />
            <Layout>
              <Suspense fallback={<RouteFallback />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={route(<HomePage />)} />
                    <Route path="/about" element={route(<AboutPage />)} />
                    <Route path="/projects" element={route(<ProjectsPage />)} />
                    <Route path="/consulting" element={route(<ConsultingPage />)} />
                    <Route path="/contact" element={route(<ContactPage />)} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </Layout>
          </Router>
        </ErrorBoundary>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
