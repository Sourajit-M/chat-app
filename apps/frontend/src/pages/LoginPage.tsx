import { useState, FormEvent } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageSquare, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-2xl shadow-lg">

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-base-content/60">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Email</span></label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="email"
                className="input input-bordered w-full pl-10"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Password</span></label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full pl-10 pr-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4 text-base-content/40" />
                  : <Eye className="w-4 h-4 text-base-content/40" />
                }
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
            {isLoggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-base-content/60">
          Don't have an account?{" "}
          <Link to="/signup" className="link link-primary">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;