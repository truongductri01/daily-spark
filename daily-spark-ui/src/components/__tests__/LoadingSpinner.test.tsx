import React from 'react';
import { render, screen } from '@testing-library/react';
import { 
  LoadingSpinner, 
  FullPageSpinner, 
  ButtonSpinner, 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  LoadingOverlay 
} from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic LoadingSpinner', () => {
    it('should render with default props', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-6', 'h-6', 'text-blue-600');
    });

    it('should render with custom size', () => {
      render(<LoadingSpinner size="xl" />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveClass('w-12', 'h-12');
    });

    it('should render with custom color', () => {
      render(<LoadingSpinner color="white" />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveClass('text-white');
    });

    it('should render with text', () => {
      render(<LoadingSpinner text="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<LoadingSpinner className="custom-class" />);
      
      const container = screen.getByText('Loading data...').parentElement?.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('FullPageSpinner', () => {
    it('should render full page spinner', () => {
      render(<FullPageSpinner />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-12', 'h-12');
    });

    it('should render with custom text', () => {
      render(<FullPageSpinner text="Please wait..." />);
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should have correct positioning classes', () => {
      render(<FullPageSpinner />);
      
      const container = screen.getByText('Loading...').closest('div');
      expect(container).toHaveClass('fixed', 'inset-0', 'z-50');
    });
  });

  describe('ButtonSpinner', () => {
    it('should render button spinner', () => {
      render(<ButtonSpinner />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-4', 'h-4', 'text-white');
    });

    it('should render with custom size', () => {
      render(<ButtonSpinner size="md" />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveClass('w-6', 'h-6');
    });

    it('should have inline-block class', () => {
      render(<ButtonSpinner />);
      
      const container = screen.getByText('Loading data...').parentElement?.parentElement;
      expect(container).toHaveClass('inline-block');
    });
  });

  describe('Skeleton', () => {
    it('should render single line skeleton', () => {
      render(<Skeleton />);
      
      const skeleton = screen.getByTestId('skeleton-line-0');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-gray-200', 'rounded', 'h-4', 'w-full');
    });

    it('should render multiple lines', () => {
      render(<Skeleton lines={3} />);
      
      expect(screen.getByTestId('skeleton-line-0')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-line-1')).toBeInTheDocument();
      expect(screen.getByTestId('skeleton-line-2')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Skeleton className="custom-skeleton" />);
      
      const container = screen.getByTestId('skeleton-line-0').parentElement;
      expect(container).toHaveClass('custom-skeleton');
    });

    it('should make last line shorter', () => {
      render(<Skeleton lines={2} />);
      
      const firstLine = screen.getByTestId('skeleton-line-0');
      const lastLine = screen.getByTestId('skeleton-line-1');
      
      expect(firstLine).toHaveClass('w-full');
      expect(lastLine).toHaveClass('w-3/4');
    });
  });

  describe('CardSkeleton', () => {
    it('should render card skeleton', () => {
      render(<CardSkeleton />);
      
      const card = screen.getByTestId('card-skeleton');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6');
    });

    it('should have avatar placeholder', () => {
      render(<CardSkeleton />);
      
      const avatar = screen.getByTestId('card-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('bg-gray-200', 'rounded-full', 'h-12', 'w-12');
    });

    it('should have title and subtitle placeholders', () => {
      render(<CardSkeleton />);
      
      const title = screen.getByTestId('card-title');
      const subtitle = screen.getByTestId('card-subtitle');
      
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
      expect(title).toHaveClass('w-3/4');
      expect(subtitle).toHaveClass('w-1/2');
    });

    it('should have content placeholders', () => {
      render(<CardSkeleton />);
      
      const contentLines = screen.getAllByTestId(/card-content-line/);
      expect(contentLines).toHaveLength(3);
    });
  });

  describe('TableSkeleton', () => {
    it('should render table skeleton with default rows', () => {
      render(<TableSkeleton />);
      
      const table = screen.getByTestId('table-skeleton');
      expect(table).toBeInTheDocument();
      expect(table).toHaveClass('bg-white', 'rounded-lg', 'shadow');
    });

    it('should render table skeleton with custom rows', () => {
      render(<TableSkeleton rows={3} />);
      
      const headerCells = screen.getAllByTestId(/table-header-cell/);
      const rowCells = screen.getAllByTestId(/table-row-cell/);
      
      expect(headerCells).toHaveLength(4);
      expect(rowCells).toHaveLength(12); // 3 rows * 4 cells
    });

    it('should have header row', () => {
      render(<TableSkeleton />);
      
      const header = screen.getByTestId('table-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('bg-gray-50');
    });

    it('should have data rows', () => {
      render(<TableSkeleton rows={2} />);
      
      const rows = screen.getAllByTestId(/table-row/);
      expect(rows).toHaveLength(2);
    });
  });

  describe('LoadingOverlay', () => {
    it('should render children when not loading', () => {
      render(
        <LoadingOverlay isLoading={false}>
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('should render loading overlay when loading', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with custom loading text', () => {
      render(
        <LoadingOverlay isLoading={true} text="Please wait...">
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      );
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
    });

    it('should have correct overlay positioning', () => {
      render(
        <LoadingOverlay isLoading={true}>
          <div data-testid="content">Content</div>
        </LoadingOverlay>
      );
      
      const overlay = screen.getByText('Loading...').closest('div');
      expect(overlay).toHaveClass('absolute', 'inset-0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner text="Loading data..." />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be screen reader friendly', () => {
      render(<LoadingSpinner text="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });
  });

  describe('Animation Classes', () => {
    it('should have animation classes', () => {
      render(<LoadingSpinner />);
      
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should have pulse animation for text', () => {
      render(<LoadingSpinner text="Loading..." />);
      
      const text = screen.getByText('Loading...');
      expect(text).toHaveClass('animate-pulse');
    });

    it('should have pulse animation for skeleton', () => {
      render(<Skeleton />);
      
      const container = screen.getByTestId('skeleton-line-0').parentElement;
      expect(container).toHaveClass('animate-pulse');
    });
  });
});
