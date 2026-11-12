import { Navigate, Route, Routes } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import useTheme from '../hooks/useTheme';
import BoardDetailPage from '../pages/BoardDetailPage';
import BoardsListPage from '../pages/BoardsListPage';

export default function AppRoutes() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <div className="app-toolbar">
        <span className="app-brand">DevBoard<span>.</span></span>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/boards" replace />} />
        <Route path="/boards" element={<BoardsListPage />} />
        <Route path="/boards/:boardId" element={<BoardDetailPage />} />
        <Route path="*" element={<Navigate to="/boards" replace />} />
      </Routes>
    </>
  );
}
