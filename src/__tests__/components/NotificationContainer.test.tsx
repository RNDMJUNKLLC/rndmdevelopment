import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationContainer from '@components/ui/NotificationContainer';
import uiReducer from '@store/slices/uiSlice';

describe('NotificationContainer Component', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        ui: uiReducer,
      },
      preloadedState: {
        ui: {
          isDarkMode: false,
          isMenuOpen: false,
          notifications: [],
        },
      },
    });
  };

  const renderComponent = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <NotificationContainer />
      </Provider>
    );
  };

  it('should render notifications container', () => {
    const { container } = renderComponent();
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render without errors', () => {
    const { container } = renderComponent();
    
    expect(container.querySelector('[role="region"]') || container.firstChild).toBeInTheDocument();
  });

  it('should have empty notifications list initially', () => {
    const { container } = renderComponent();
    
    const notifications = container.querySelectorAll('[role="alert"]');
    expect(notifications.length).toBe(0);
  });
});
