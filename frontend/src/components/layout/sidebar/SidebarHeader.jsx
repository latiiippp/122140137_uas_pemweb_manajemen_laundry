export default function SidebarHeader({ toggleSidebar }) {
  return (
    <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
          <p className="text-black">M</p>
        </div>
        <span className="text-lg font-semibold">Manajemen Laundry</span>
      </div>
      <button
        className="lg:hidden hover:bg-blue-700 p-1 rounded"
        onClick={toggleSidebar}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
}
