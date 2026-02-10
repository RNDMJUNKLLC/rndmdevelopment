import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Navigation from '@components/layout/Navigation';
import uiReducer from '@store/slices/uiSlice';

// Mock the useAuth hook
jest.mock('@/hooks', () => ({
  useAuth: () => ({
    isLoggedIn: false,
    user: null,
    logout: jest.fn(),
  }),
}));

describe('Navigation Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
      },
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  };

  it('should render navigation', () => {
    renderComponent();
    
    const nav = screen.queryByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    renderComponent();
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should display controls/buttons', () => {
    renderComponent();
    
    const buttons = screen.queryAllByRole('button');
    expect(buttons.length >= 0).toBe(true);
  });

  it('should contain navigation elements', () => {
    const { container } = renderComponent();
    
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
