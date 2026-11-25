import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: (failureCount, error) => {
        const status = error?.statusCode || error?.status || error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 3;
      }
    },
    mutations: {
      retry: false
    }
  }
});

export default queryClient;
