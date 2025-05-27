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
    if (!Array.isArray(users)) return []; // Pastikan users adalah array
    if (!searchTerm.trim()) {
      // Jika searchTerm kosong, kembalikan semua user
      return users;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return users.filter((user) => {
      // Pastikan semua field yang dicari ada dan merupakan string sebelum toLowerCase
      const userIdString = user.id != null ? String(user.id).toLowerCase() : "";
      const usernameString = user.username ? user.username.toLowerCase() : "";
      const roleString = user.role ? user.role.toLowerCase() : "";

      return (
        userIdString.includes(lowerSearchTerm) ||
        usernameString.includes(lowerSearchTerm) ||
        roleString.includes(lowerSearchTerm)
      );
    });
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
              {/* Tombol reset akan selalu tampil jika searchTerm tidak kosong */}
              <button
                onClick={() => setSearchTerm("")}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                Reset
              </button>
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
