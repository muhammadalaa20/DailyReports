export default function LogoutModal({ isOpen, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-black">Are you sure you want to logout?</h3>
        <div className="mt-4 flex justify-end space-x-4">

          <button
            className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            onClick={onLogout}
          >
            Logout
          </button>
          <button
            className="py-2 px-4 bg-gray-300 rounded-md hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}