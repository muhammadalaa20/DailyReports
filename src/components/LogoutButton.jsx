// Logout Button Component
export default function LogoutButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
  
    const handleLogout = () => {
      // Clear session (localStorage)
      localStorage.removeItem('token');
      localStorage.removeItem('role');
  
      // Close modal and redirect to home page
      setIsModalOpen(false);
      router.push('/');
    };
  
    return (
      <div>
        {/* Logout Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2 text-lg text-gray-600 hover:text-red-500"
        >
          <HiLogout size={24} />
        </button>
  
        {/* Confirmation Modal */}
        <LogoutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    );
  }