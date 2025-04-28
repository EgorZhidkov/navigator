import { screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';

import { getRouteLogin } from '@shared/lib/router';
import { componentRender } from '@shared/lib/tests';

// eslint-disable-next-line no-restricted-imports

import AppRouter from './AppRouter';

describe('app/router/AppRouter', () => {
  test('Страница должна отрендериться', async () => {
    componentRender(<AppRouter />, {
      route: getRouteLogin(),
    });

    const page = await screen.findByTestId('LoginPage');
    expect(page).toBeInTheDocument();
  });
});
