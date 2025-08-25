import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast, useToastHelpers } from '../Toast';

// Test component to trigger toasts
const TestComponent: React.FC = () => {
  const { addToast, removeToast, clearToasts } = useToast();
  const { showSuccess, showError, showWarning, showInfo } = useToastHelpers();

  return (
    <div>
      <button onClick={() => addToast({ type: 'success', title: 'Test Success', message: 'Success message' })} data-testid="add-success">
        Add Success Toast
      </button>
      <button onClick={() => addToast({ type: 'error', title: 'Test Error', message: 'Error message' })} data-testid="add-error">
        Add Error Toast
      </button>
      <button onClick={() => addToast({ type: 'warning', title: 'Test Warning', message: 'Warning message' })} data-testid="add-warning">
        Add Warning Toast
      </button>
      <button onClick={() => addToast({ type: 'info', title: 'Test Info', message: 'Info message' })} data-testid="add-info">
        Add Info Toast
      </button>
      <button onClick={() => addToast({ type: 'success', title: 'Persistent Toast', message: 'This toast is persistent', persistent: true })} data-testid="add-persistent">
        Add Persistent Toast
      </button>
      <button onClick={() => removeToast('test-id')} data-testid="remove-toast">
        Remove Toast
      </button>
      <button onClick={clearToasts} data-testid="clear-toasts">
        Clear All Toasts
      </button>
      <button onClick={() => showSuccess('Success Title', 'Success message')} data-testid="show-success">
        Show Success
      </button>
      <button onClick={() => showError('Error Title', 'Error message')} data-testid="show-error">
        Show Error
      </button>
      <button onClick={() => showWarning('Warning Title', 'Warning message')} data-testid="show-warning">
        Show Warning
      </button>
      <button onClick={() => showInfo('Info Title', 'Info message')} data-testid="show-info">
        Show Info
      </button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement, maxToasts?: number) => {
  return render(
    <ToastProvider maxToasts={maxToasts}>
      {component}
    </ToastProvider>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Toast Display', () => {
    it('should display success toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-success'));

      await waitFor(() => {
        expect(screen.getByText('Test Success')).toBeInTheDocument();
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
    });

    it('should display error toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-error'));

      await waitFor(() => {
        expect(screen.getByText('Test Error')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });

    it('should display warning toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-warning'));

      await waitFor(() => {
        expect(screen.getByText('Test Warning')).toBeInTheDocument();
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });

    it('should display info toast', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-info'));

      await waitFor(() => {
        expect(screen.getByText('Test Info')).toBeInTheDocument();
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Helpers', () => {
    it('should show success toast using helper', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('show-success'));

      await waitFor(() => {
        expect(screen.getByText('Success Title')).toBeInTheDocument();
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
    });

    it('should show error toast using helper', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('show-error'));

      await waitFor(() => {
        expect(screen.getByText('Error Title')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });

    it('should show warning toast using helper', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('show-warning'));

      await waitFor(() => {
        expect(screen.getByText('Warning Title')).toBeInTheDocument();
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });

    it('should show info toast using helper', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('show-info'));

      await waitFor(() => {
        expect(screen.getByText('Info Title')).toBeInTheDocument();
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Auto-dismiss', () => {
    it('should auto-dismiss non-persistent toasts', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-success'));

      await waitFor(() => {
        expect(screen.getByText('Test Success')).toBeInTheDocument();
      });

      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(5300); // 5 seconds + animation time
      });

      await waitFor(() => {
        expect(screen.queryByText('Test Success')).not.toBeInTheDocument();
      });
    });

    it('should not auto-dismiss persistent toasts', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-persistent'));

      await waitFor(() => {
        expect(screen.getByText('Persistent Toast')).toBeInTheDocument();
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(screen.getByText('Persistent Toast')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Manual Dismiss', () => {
    it('should dismiss toast when close button is clicked', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-success'));

      await waitFor(() => {
        expect(screen.getByText('Test Success')).toBeInTheDocument();
      });

      // Find and click the close button (it's the last button in the toast)
      const closeButton = screen.getAllByRole('button').pop();
      fireEvent.click(closeButton!);

      await waitFor(() => {
        expect(screen.queryByText('Test Success')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast Management', () => {
    it('should clear all toasts', async () => {
      renderWithProvider(<TestComponent />);
      
      // Add multiple toasts
      fireEvent.click(screen.getByTestId('add-success'));
      fireEvent.click(screen.getByTestId('add-error'));
      fireEvent.click(screen.getByTestId('add-warning'));

      await waitFor(() => {
        expect(screen.getByText('Test Success')).toBeInTheDocument();
        expect(screen.getByText('Test Error')).toBeInTheDocument();
        expect(screen.getByText('Test Warning')).toBeInTheDocument();
      });

      // Clear all toasts
      fireEvent.click(screen.getByTestId('clear-toasts'));

      await waitFor(() => {
        expect(screen.queryByText('Test Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Error')).not.toBeInTheDocument();
        expect(screen.queryByText('Test Warning')).not.toBeInTheDocument();
      });
    });

    it('should limit number of toasts displayed', async () => {
      renderWithProvider(<TestComponent />, 2);
      
      // Add more toasts than the limit
      fireEvent.click(screen.getByTestId('add-success'));
      fireEvent.click(screen.getByTestId('add-error'));
      fireEvent.click(screen.getByTestId('add-warning'));

      await waitFor(() => {
        // Should only show the last 2 toasts
        expect(screen.queryByText('Test Success')).not.toBeInTheDocument();
        expect(screen.getByText('Test Error')).toBeInTheDocument();
        expect(screen.getByText('Test Warning')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Styling', () => {
    it('should apply correct styles for different toast types', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-success'));
      fireEvent.click(screen.getByTestId('add-error'));

      await waitFor(() => {
        const successToast = screen.getByText('Test Success').closest('div[class*="ring-green-500"]');
        const errorToast = screen.getByText('Test Error').closest('div[class*="ring-red-500"]');
        
        expect(successToast).toBeInTheDocument();
        expect(errorToast).toBeInTheDocument();
      });
    });
  });

  describe('Toast Animation', () => {
    it('should animate in when toast is added', async () => {
      renderWithProvider(<TestComponent />);
      
      fireEvent.click(screen.getByTestId('add-success'));

      await waitFor(() => {
        const toast = screen.getByText('Test Success').closest('div[class*="translate-x-0"]');
        expect(toast).toBeInTheDocument();
      });
    });
  });
});
