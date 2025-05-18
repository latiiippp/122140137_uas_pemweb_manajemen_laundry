export default function PageHeader({ title, toggleSidebar }) {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <button
        className="lg:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      <div className="w-6 h-6"></div> {/* Spacer untuk menjaga layout */}
    </header>
  );
}
