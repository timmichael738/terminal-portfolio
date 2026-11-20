import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Terminal } from './Terminal';

const setup = () => {
  const user = userEvent.setup();
  render(<Terminal />);
  return { user, input: screen.getByLabelText('Command input') };
};

describe('<Terminal />', () => {
  beforeEach(() => localStorage.clear());

  it('shows the banner on load', () => {
    setup();
    expect(screen.getByRole('heading', { name: /Michael Timothy/ })).toBeInTheDocument();
  });

  it('runs a command and prints its output', async () => {
    const { user, input } = setup();
    await user.type(input, 'projects{Enter}');
    expect(screen.getByRole('button', { name: 'gatekeeper' })).toBeInTheDocument();
  });

  it('reports unknown commands', async () => {
    const { user, input } = setup();
    await user.type(input, 'rm -rf /{Enter}');
    expect(screen.getByText(/command not found: rm/)).toBeInTheDocument();
  });

  it('runs commands from clickable links', async () => {
    const { user, input } = setup();
    await user.type(input, 'projects{Enter}');
    await user.click(screen.getByRole('button', { name: 'taskforge' }));
    expect(screen.getByText(/SKIP LOCKED workers/)).toBeInTheDocument();
  });

  it('navigates history with the arrow keys', async () => {
    const { user, input } = setup();
    await user.type(input, 'whoami{Enter}');
    await user.type(input, 'date{Enter}');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('date');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('whoami');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveValue('');
  });

  it('autocompletes with Tab', async () => {
    const { user, input } = setup();
    await user.type(input, 'neof');
    await user.keyboard('{Tab}');
    expect(input).toHaveValue('neofetch ');
  });

  it('switches and persists the theme', async () => {
    const { user, input } = setup();
    await user.type(input, 'theme matrix{Enter}');
    expect(document.documentElement.dataset.theme).toBe('matrix');
    expect(localStorage.getItem('terminal-portfolio:theme')).toBe('matrix');
  });

  it('clears the screen', async () => {
    const { user, input } = setup();
    await user.type(input, 'clear{Enter}');
    expect(screen.queryByRole('heading', { name: /Michael Timothy/ })).not.toBeInTheDocument();
  });
});
