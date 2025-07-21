import React from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  status: 'uploading' | 'success' | 'error' | 'loading';
  message?: string;
  onClose?: () => void;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  status, 
  message, 
  onClose 
}) => {
  if (!isVisible) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'loading':
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading vehicle...';
      case 'loading':
        return message || 'Loading...';
      case 'success':
        return 'Operation successful!';
      case 'error':
        return message || 'An error occurred. Please try again.';
      default:
        return 'Processing...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center justify-center">
            {getStatusIcon()}
          </div>
          <h3 className={`text-xl font-semibold ${getStatusColor()}`}>
            {getStatusMessage()}
          </h3>
          {message && (status === 'uploading' || status === 'loading') && (
            <p className="text-gray-600 text-sm">{message}</p>
          )}
          {(status === 'success' || status === 'error') && onClose && (
            <button
              onClick={onClose}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                status === 'success'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {status === 'success' ? 'Continue' : 'Try Again'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
