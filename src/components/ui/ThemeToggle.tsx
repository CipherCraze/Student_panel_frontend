import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={[
        'relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-300',
        'border backdrop-blur-md',
        isDark ? 'bg-gradient-to-r from-indigo-700/60 to-cyan-700/60 border-white/10 shadow-vip' : 'bg-white/70 border-secondary-200/60 shadow-medium',
      ].join(' ')}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
    >
      <span
        className={[
          'inline-block h-7 w-7 transform rounded-full transition-all duration-300',
          'mx-1',
          isDark
            ? 'translate-x-7 bg-gradient-to-br from-cyan-300 to-indigo-400 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
            : 'translate-x-0 bg-gradient-to-br from-yellow-300 to-amber-400 shadow-[0_8px_30px_rgba(31,41,55,0.25)]',
        ].join(' ')}
      />
    </button>
  )
}


