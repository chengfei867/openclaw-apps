import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = async (credentials) => {
    await register(credentials);
    navigate('/');
  };

  return (
    <AuthForm
      title="Create your space"
      subtitle="Start capturing ideas in seconds"
      submitLabel="Create account"
      onSubmit={handleSubmit}
      error={error}
      passwordAutoComplete="new-password"
      footer={
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
          >
            Sign in
          </Link>
        </p>
      }
    />
  );
}
