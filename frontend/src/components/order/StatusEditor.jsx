import { FormSelect } from "../form/FormElements";
import { ORDER_STATUS } from "../../data/constants";

export default function StatusEditor({
  status,
  onStatusChange,
  onSave,
  onCancel,
}) {
  return (
    <div className="flex items-center space-x-1">
      <FormSelect
        id="status"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        options={[
          {
            value: ORDER_STATUS.PROCESSING,
            label: "Dilaundry",
          },
          {
            value: ORDER_STATUS.READY,
            label: "Siap Ambil",
          },
          {
            value: ORDER_STATUS.COMPLETED,
            label: "Selesai",
          },
        ]}
        className="text-xs py-1"
      />
      <div className="flex space-x-1">
        <button
          onClick={onSave}
          className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          onClick={onCancel}
          className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
