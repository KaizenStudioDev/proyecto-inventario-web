import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

function Hello({ name }) {
    return <div>Hello {name}</div>;
}

describe('React Environment', () => {
    it('renders components correctly', () => {
        render(<Hello name="Vitest" />);
        expect(screen.getByText(/Hello Vitest/i)).toBeInTheDocument();
    });
});
