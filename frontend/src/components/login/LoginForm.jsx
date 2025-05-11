import { useState } from "react";
import LoginInput from "./LoginInput";
import LoginButton from "./LoginButton";
import ErrorAlert from "./ErrorAlert";

export default function LoginForm({ onSubmit, error, loading }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onSubmit({ username, password });
  };

  const userIcon = (
    <svg
      className="h-5 w-5 text-blue-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );

  const passwordIcon = (
    <svg
      className="h-5 w-5 text-blue-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
      <ErrorAlert message={error} />

      <form onSubmit={handleSubmit}>
        <LoginInput
          id="username"
          type="text"
          label="Username"
          icon={userIcon}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Masukkan username"
        />

        <LoginInput
          id="password"
          type="password"
          label="Password"
          icon={passwordIcon}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Masukkan password"
        />

        <LoginButton loading={loading} />
      </form>
    </div>
  );
}
