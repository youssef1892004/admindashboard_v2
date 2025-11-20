import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-gray-900 text-white fixed top-0 left-0 h-full z-50">
        <Sidebar />
      </div>
      
      {/* Main content area, offset by sidebar width */}
      <div className="flex flex-col flex-1 ml-64"> {/* ml-64 to account for w-64 sidebar */}
        {/* Fixed Navbar */}
        <div className="bg-white shadow fixed top-0 left-64 right-0 z-40"> {/* left-64 to start after sidebar */}
          <Navbar />
        </div>
        
        {/* Main content, offset by navbar height and sidebar width */}
        <main className="p-6 w-full mt-16"> {/* mt-16 for Navbar height (approx. 64px) */}
          {children}
        </main>
      </div>
    </div>
  );
}