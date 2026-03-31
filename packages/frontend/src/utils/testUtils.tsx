import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { TodoProvider } from '../contexts/TodoContext';
import { theme } from '../theme';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <TodoProvider>
        {children}
      </TodoProvider>
    </MantineProvider>
  );
}

export function renderWithProviders(ui: ReactNode, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { screen, fireEvent, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
