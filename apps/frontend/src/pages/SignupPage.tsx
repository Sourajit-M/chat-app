import { useState, FormEvent } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageSquare, User, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-base-100 rounded-2xl shadow-lg">

        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-base-content/60">Get started for free</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Full Name</span></label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                className="input input-bordered w-full pl-10"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>

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

          <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
            {isSigningUp ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-base-content/60">
          Already have an account?{" "}
          <Link to="/login" className="link link-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;