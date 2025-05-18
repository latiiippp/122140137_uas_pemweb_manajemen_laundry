// filepath: d:\KULIAH\SEMESTER 6\Pemrograman Web\TUBES\122140137_uas_pemweb_manajemen_laundry\frontend\src\components\user\UserForm.jsx
import { useState, useEffect } from "react";
import { FormInput, FormSelect, FormButton } from "../form/FormElements";

export default function UserForm({ isOpen, onClose, user = null, onSubmit }) {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "karyawan",
  });

  const [errors, setErrors] = useState({});

  // Reset form dan populate data jika dalam mode edit
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          username: user.username,
          password: "", // Password tidak ditampilkan untuk alasan keamanan
          role: user.role,
        });
      } else {
        setFormData({
          username: "",
          password: "",
          role: "karyawan",
        });
      }
      setErrors({});
    }
  }, [isOpen, isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    if (!formData.username.trim()) tempErrors.username = "Username harus diisi";

    if (!isEditing && !formData.password.trim())
      tempErrors.password = "Password harus diisi";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Untuk edit, hanya kirim password jika diisi
      const userData = {
        ...formData,
        // Jika password kosong dan dalam mode edit, jangan kirim password
        ...(isEditing && !formData.password ? { password: undefined } : {}),
      };

      onSubmit(userData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-[15px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-800">
            {isEditing ? "Edit User" : "Tambah User Baru"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Tutup"
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

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <FormInput
              id="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              error={errors.username}
              required
            />

            <FormInput
              id="password"
              type="password"
              label={
                isEditing
                  ? "Password (Kosongkan jika tidak diubah)"
                  : "Password"
              }
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isEditing ? "Kosongkan jika tidak diubah" : "Masukkan password"
              }
              error={errors.password}
              required={!isEditing}
            />

            <FormSelect
              id="role"
              label="Role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "admin", label: "Admin" },
                { value: "karyawan", label: "Karyawan" },
              ]}
              error={errors.role}
              required
            />
          </div>

          <div className="flex justify-end mt-6">
            <FormButton variant="secondary" onClick={onClose} className="mr-2">
              Batal
            </FormButton>

            <FormButton type="submit" variant="primary">
              {isEditing ? "Simpan Perubahan" : "Tambah User"}
            </FormButton>
          </div>
        </form>
      </div>
    </div>
  );
}
