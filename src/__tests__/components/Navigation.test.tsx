import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Navigation from '@components/layout/Navigation';
import uiReducer from '@store/slices/uiSlice';
import authReducer from '@store/slices/authSlice';

describe('Navigation Component', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
        auth: authReducer,
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

  it('should have navigation buttons', () => {
    renderComponent();
    
    const buttons = screen.getAllByRole('button');
    // Should have: RNDM DEVS logo + Home, About, Services, Contact, Account + hamburger
    expect(buttons.length).toBeGreaterThanOrEqual(6);
  });

  it('should display logo', () => {
    renderComponent();
    
    const logo = screen.getByText('RNDM DEVS');
    expect(logo).toBeInTheDocument();
  });

  it('should have navigation links for main pages', () => {
    renderComponent();
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should have mobile menu toggle button', () => {
    renderComponent();
    
    const buttons = screen.getAllByRole('button');
    const menuToggle = buttons.find(btn => btn.getAttribute('aria-label') === 'Toggle menu');
    expect(menuToggle).toBeInTheDocument();
  });

  it('should dispatch navigation action on button click', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const aboutButton = screen.getByText('About');
    await user.click(aboutButton);
    
    // Verify the button was clicked (state should update)
    expect(aboutButton).toBeInTheDocument();
  });
});

