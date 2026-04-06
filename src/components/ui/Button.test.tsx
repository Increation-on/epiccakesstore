
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('рендерит кнопку с текстом', () => {
    render(<Button>Нажми меня</Button>);
    
    const button = screen.getByText('Нажми меня');
    expect(button).toBeInTheDocument();
  });

  it('применяет variant primary по умолчанию', () => {
    render(<Button>Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('bg-[var(--pink)]');
  });

  it('применяет variant outline', () => {
    render(<Button variant="outline">Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('border');
    expect(button.className).toContain('bg-[var(--mint)]');
  });

  it('применяет variant secondary', () => {
    render(<Button variant="secondary">Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('bg-gray-500');
  });

  it('применяет variant ghost', () => {
    render(<Button variant="ghost">Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('text-gray-300');
  });

  it('применяет размер sm', () => {
    render(<Button size="sm">Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('px-3 py-1 text-sm');
  });

  it('применяет размер md по умолчанию', () => {
    render(<Button>Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('px-4 py-2 text-base');
  });

  it('применяет размер lg', () => {
    render(<Button size="lg">Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('px-6 py-3 text-lg');
  });

  it('применяет дополнительные классы', () => {
    render(<Button className="custom-class">Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('custom-class');
  });

  it('обрабатывает клик', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('не обрабатывает клик когда disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('применяет классы для disabled состояния', () => {
    render(<Button disabled>Кнопка</Button>);
    
    const button = screen.getByText('Кнопка');
    expect(button.className).toContain('opacity-50');
    expect(button.className).toContain('cursor-not-allowed');
    expect(button).toBeDisabled();
  });
});