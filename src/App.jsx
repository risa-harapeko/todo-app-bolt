import { Navigate, Route, Routes } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import TodoListPage from '@/pages/TodoListPage';
import TodoFormPage from '@/pages/TodoFormPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <Routes>
        <Route path="/" element={<TodoListPage />} />
        <Route path="/new" element={<TodoFormPage />} />
        <Route path="/edit/:id" element={<TodoFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
