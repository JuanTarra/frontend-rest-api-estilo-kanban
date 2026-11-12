import Button from './Button';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <Button
      variant="secondary"
      aria-label={`Activar tema ${isDark ? 'claro' : 'oscuro'}`}
      aria-pressed={isDark}
      onClick={onToggle}
    >
      {isDark ? '☀ Tema claro' : '☾ Tema oscuro'}
    </Button>
  );
}
