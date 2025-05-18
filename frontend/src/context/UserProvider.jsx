import { useState, useEffect } from "react";
import { UserContext } from "./userContext";
import { DUMMY_USERS } from "../data/users";

// Provider component
export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);

  // Inisialisasi users dari data dummy
  useEffect(() => {
    setUsers(DUMMY_USERS);
  }, []);

  // Fungsi untuk menambah user baru
  const addUser = (userData) => {
    const newUser = {
      id: `usr-${String(users.length + 1).padStart(3, "0")}`,
      ...userData,
    };

    setUsers((prevUsers) => [newUser, ...prevUsers]);
    return newUser;
  };

  // Fungsi untuk mengupdate user
  const updateUser = (id, updatedData) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, ...updatedData } : user
      )
    );
  };

  // Fungsi untuk menghapus user
  const deleteUser = (id) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
  };

  return (
    <UserContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
