export default function Button({ isLoading, children, ...props }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 w-full flex justify-center items-center ${
        isLoading ? "opacity-70 cursor-not-allowed" : ""
      }`}
      {...props}
    >
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-t-transparent border-white"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
