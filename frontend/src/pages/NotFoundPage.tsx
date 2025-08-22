import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Illustration */}
          <div className="mx-auto h-32 w-32 flex items-center justify-center rounded-full bg-blue-100 mb-8">
            <Search className="h-16 w-16 text-blue-600" />
          </div>

          {/* Error Message */}
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or you entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary btn-lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-secondary btn-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Help Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Need help? Try these links:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Tasks
              </Link>
              <Link
                to="/profile"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Still having trouble?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              If you believe this is an error, please contact our support team.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};