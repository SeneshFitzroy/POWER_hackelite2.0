import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { createTestUser, getTestCredentials } from "../../utils/createTestUser";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-fill test credentials for development
    const testCreds = getTestCredentials();
    setEmail(testCreds.email);
    setPassword(testCreds.password);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/");
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Failed to log in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUser = async () => {
    setCreatingUser(true);
    try {
      const result = await createTestUser();
      if (result.success) {
        toast.success("Test user ready! You can now login.");
        const testCreds = getTestCredentials();
        setEmail(testCreds.email);
        setPassword(testCreds.password);
      } else {
        toast.error("Failed to create test user: " + result.error);
      }
    } catch (error) {
      toast.error("Error creating test user");
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pharmacy HR System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="text-center">
              <div className="text-xs text-gray-500 mb-2">
                Development Mode - Test Credentials Pre-filled
              </div>
              <button
                type="button"
                onClick={handleCreateTestUser}
                disabled={creatingUser}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {creatingUser ? "Creating Test User..." : "Create Test User"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
