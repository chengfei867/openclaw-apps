import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = async (credentials) => {
    await login(credentials);
    navigate('/');
  };

  return (
    <AuthForm
      title="Welcome back"
      subtitle="Sign in to continue to your notes"
      submitLabel="Sign in"
      onSubmit={handleSubmit}
      error={error}
      footer={
        <p className="text-sm text-slate-600 dark:text-slate-300">
          No account yet?{' '}
          <Link
            to="/register"
            className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Create one
          </Link>
        </p>
      }
    />
  );
}
