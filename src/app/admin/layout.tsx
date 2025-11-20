import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../globals.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-gray-900 text-white">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1">
        <div className="bg-white shadow">
          <Navbar />
        </div>
        <main className="p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}