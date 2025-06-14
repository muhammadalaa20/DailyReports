'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { authState, login } = useAuth();  // Get auth state and login function

  // Redirect if session exists (using useEffect)
  useEffect(() => {
    if (authState.role) {
      if (authState.role === 'act') {
        router.push('/ACT');
      } else if (authState.role === 'dct') {
        router.push('/DCT');
      }
    }
  }, [authState, router]);  // Runs when authState or router changes

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      setLoading(true);
      const res = await fetch('http://172.17.40.200:8070/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await res.json();

      if (res.ok) {
        login(data);  // Use the login function from context

        // Use router.push to redirect based on role
        if (data.role === 'act') {
          router.push('/ACT');
        } else if (data.role === 'dct') {
          router.push('/DCT');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Something went wrong, please try again later');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  // const handleSignup = async (e) => {
  //   e.preventDefault();
  //   const formData = new FormData(e.target);
  //   const credentials = {
  //     username: formData.get('username'),
  //     password: formData.get('password'),
  //     role: formData.get('role'),
  //   };

  //   try {
  //     setLoading(true);
  //     const res = await fetch('http://localhost:3000/users/signup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(credentials),
  //     });
  //     const data = await res.json();

  //     if (res.ok) {
  //       login(data);  // Use the login function from context

  //       // Use router.push to redirect based on role
  //       if (data.role === 'act') {
  //         router.push('/ACT');  
  //       } else if (data.role === 'dct') {
  //         router.push('/DCT');  
  //       }
  //     } else {
  //       setError(data.error || 'Signup failed');
  //     }
  //   } catch (error) {
  //     setError('Something went wrong, please try again later');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <motion.div
        className="w-full max-w-sm p-8 bg-white rounded-lg shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex space-x-4 border-b-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`py-2 w-full text-lg font-semibold ${isLogin ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          >
            Login
          </button>

        </div>

        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ x: 200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -200, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        </motion.div>
      </motion.div>
    </div>
  );
}

// LoginForm Component
function LoginForm({ onSubmit, loading, error }) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor="Username" className="block text-sm font-semibold text-gray-600">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Enter your username"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-600">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Enter your password"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 mt-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

// SignupForm Component
// function SignupForm({ onSubmit, loading, error }) {
//   return (
//     <form className="space-y-4" onSubmit={onSubmit}>
//       <div>
//         <label htmlFor="username" className="block text-sm font-semibold text-gray-600">
//           Username
//         </label>
//         <input
//           type="text"
//           name="username"
//           id="username"
//           className="w-full p-3 border border-gray-300 rounded-md"
//           placeholder="Enter your Username"
//         />
//       </div>
//       <div>
//         <label htmlFor="password" className="block text-sm font-semibold text-gray-600">
//           Password
//         </label>
//         <input
//           type="password"
//           name="password"
//           id="password"
//           className="w-full p-3 border border-gray-300 rounded-md"
//           placeholder="Create a password"
//         />
//       </div>
//       <div>
//         <label htmlFor="role" className="block text-sm font-semibold text-gray-600">
//           Role
//         </label>
//         <select
//           name="role"
//           id="role"
//           className="w-full p-3 border border-gray-300 rounded-md"
//         >
//           <option value="act">ACT</option>
//           <option value="dct">DCT</option>
//         </select>
//       </div>
//       {error && <p className="text-red-500 text-sm">{error}</p>}
//       <button
//         type="submit"
//         disabled={loading}
//         className="w-full py-3 mt-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
//       >
//         {loading ? 'Signing up...' : 'Sign Up'}
//       </button>
//     </form>
//   );
// }
