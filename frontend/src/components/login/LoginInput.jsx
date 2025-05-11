export default function LoginInput({
  id,
  type,
  label,
  icon,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="mb-6">
      <label
        className="block text-sm font-medium text-blue-900 mb-2"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="pl-10 w-full px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
