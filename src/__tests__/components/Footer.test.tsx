import { render, screen } from '@testing-library/react';
import Footer from '@components/layout/Footer';

describe('Footer Component', () => {
  it('should render footer', () => {
    render(<Footer />);
    
    const footer = screen.queryByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should contain links', () => {
    render(<Footer />);
    
    const links = screen.queryAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should contain RNDM branding', () => {
    const { container } = render(<Footer />);
    
    expect(container.textContent).toContain('RNDM');
  });

  it('should show copyright year', () => {
    const { container } = render(<Footer />);
    
    expect(container.textContent).toContain('2026');
  });
});
