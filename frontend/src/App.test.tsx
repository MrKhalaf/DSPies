import { render, screen } from '@testing-library/react';
import App from './App';

test('renders landing explanation', () => {
  render(<App />);
  expect(screen.getByText(/Interactive Classification Demo/i)).toBeInTheDocument();
});
