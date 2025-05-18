import { useState, useMemo } from "react";
import { useUsers } from "../context/useUsers"; // Update import path
import Sidebar from "../components/layout/Sidebar";
import PageHeader from "../components/layout/PageHeader";
import UsersTable from "../components/user/UsersTable";
import DeleteUserModal from "../components/user/DeleteUserModal";
import SearchBar from "../components/user/SearchBar";
import UserForm from "../components/user/UserForm";

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Gunakan UserContext
  const { users, addUser, updateUser, deleteUser } = useUsers();

  // Fungsi untuk mencari dan mengurutkan users
  const filteredUsers = useMemo(() => {
    // Filter berdasarkan kata kunci pencarian
    return searchTerm
      ? users.filter(
          (user) =>
            user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : users;
  }, [users, searchTerm]);

  // Handler untuk menampilkan form dalam mode edit
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setUserFormOpen(true);
  };

  // Handler untuk menampilkan modal konfirmasi hapus
  const handleOpenDeleteModal = (id) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  };

  // Handler untuk konfirmasi hapus
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Handler untuk menampilkan form tambah user
  const handleOpenUserForm = () => {
    setCurrentUser(null); // Reset current user for add mode
    setUserFormOpen(true);
  };

  // Handler untuk submit form (add atau edit)
  const handleSubmitUser = (userData) => {
    if (currentUser) {
      // Edit mode
      updateUser(currentUser.id, userData);
    } else {
      // Add mode
      addUser(userData);
    }
    setUserFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header menggunakan komponen PageHeader */}
        <PageHeader
          title="Data Users"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4">
          {/* Search Bar */}
          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

          {/* Indikator hasil pencarian jika ada kata kunci pencarian */}
          {searchTerm && (
            <div className="mb-4 flex items-center text-sm text-gray-600">
              <span>
                Menampilkan {filteredUsers.length} hasil untuk "{searchTerm}"
              </span>
              {filteredUsers.length > 0 && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Reset
                </button>
              )}
            </div>
          )}

          {/* Tabel Users */}
          <UsersTable
            users={filteredUsers}
            onUpdateUser={handleEditUser}
            onDeleteUser={handleOpenDeleteModal}
            onAddUser={handleOpenUserForm}
          />
        </main>
      </div>

      {/* Modal konfirmasi hapus */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Form tambah/edit user */}
      <UserForm
        isOpen={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        user={currentUser}
        onSubmit={handleSubmitUser}
      />

      {/* Elemen visual khas tema */}
      <div className="fixed bottom-4 right-4">
        <div className="h-1 w-20 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"></div>
      </div>
    </div>
  );
}
