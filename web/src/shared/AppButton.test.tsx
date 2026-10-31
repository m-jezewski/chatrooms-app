// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom/vitest';
import { AppButton } from './AppButton.tsx';
import styles from './AppButton.module.scss';
import loaderStyles from './Loader.module.scss';

describe('AppButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('never submits a form unless it was asked to', () => {
    render(<AppButton>Cancel</AppButton>);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
  });

  it('submits when that is the whole point of it', () => {
    render(<AppButton type="submit">Join room</AppButton>);

    expect(screen.getByRole('button', { name: 'Join room' })).toHaveAttribute('type', 'submit');
  });

  it('becomes a link that goes somewhere, with no button type to inherit', () => {
    render(
      <MemoryRouter>
        <AppButton as="link" to="/login">
          Sign in
        </AppButton>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Sign in' });

    expect(link).toHaveAttribute('href', '/login');
    expect(link).not.toHaveAttribute('type');
  });

  it('shows it is busy instead of its label', () => {
    const { container } = render(<AppButton loader>Join room</AppButton>);

    expect(screen.queryByText('Join room')).not.toBeInTheDocument();
    expect(container.querySelector(`.${loaderStyles.loader}`)).toBeInTheDocument();
  });

  it('ignores clicks once disabled', async () => {
    const onClick = vi.fn();
    render(
      <AppButton disabled onClick={onClick}>
        Delete room
      </AppButton>,
    );
    const button = screen.getByRole('button', { name: 'Delete room' });

    await userEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(button).toHaveClass(styles.disabled);
  });

  it('uses styles it was asked for', () => {
    render(
      <AppButton variant="purple" compact rounded>
        Save
      </AppButton>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass(styles.purple, styles.compact, styles.round);
  });

  it('looks neutral when no styling props was provided', () => {
    render(<AppButton>Save</AppButton>);
    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveClass(styles.neutral, styles.rounded);
    expect(button).not.toHaveClass(styles.compact, styles.round);
  });
});
