import { Link } from "react-router-dom";
import { MessageSquare, Home } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <MessageSquare className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold mt-2">Page not found</h2>
          <p className="text-base-content/60 mt-2">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <Link to="/" className="btn btn-primary gap-2">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;