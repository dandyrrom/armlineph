// src/components/LoadingSpinner.jsx

function LoadingSpinner({ message }) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-blue-600 border-t-transparent"></div>
        {message && <p className="mt-4 text-gray-600 font-semibold">{message}</p>}
      </div>
    );
  }
  
  export default LoadingSpinner;
  