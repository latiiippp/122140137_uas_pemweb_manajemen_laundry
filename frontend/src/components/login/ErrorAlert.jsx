export default function ErrorAlert({ message }) {
  if (!message) return null;

  return (
    <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
      <p className="flex items-center">
        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          ></path>
        </svg>
        {message}
      </p>
    </div>
  );
}
