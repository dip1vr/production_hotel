import AdminChat from "@/components/admin/AdminChat";

export default function AdminChatPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-serif font-bold text-slate-900">Admin Chat Dashboard</h1>
                <p className="text-slate-500">Manage customer messages and support inquiries.</p>
            </div>
            <AdminChat />
        </div>
    );
}
