import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Footer from '@components/layout/Footer';
import uiReducer from '@store/slices/uiSlice';

describe('Footer Component', () => {
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
        <Footer />
      </Provider>
    );
  };

  it('should render footer', () => {
    renderComponent();
    
    const footer = screen.queryByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should contain navigation links', () => {
    renderComponent();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should contain RNDM branding', () => {
    const { container } = renderComponent();
    
    expect(container.textContent).toContain('RNDM');
  });

  it('should show current copyright year', () => {
    const { container } = renderComponent();
    
    expect(container.textContent).toContain(String(new Date().getFullYear()));
  });

  it('should have navigation links for all main pages', () => {
    renderComponent();

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('external links should open safely in new tab', () => {
    renderComponent();

    const externalLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('target') === '_blank');

    expect(externalLinks.length).toBeGreaterThan(0);
    externalLinks.forEach((link) => {
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });
});
