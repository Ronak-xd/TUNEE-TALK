import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useSession, useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { userId } = useAuth();
	const { session } = useSession();
	const [loading, setLoading] = useState(true);
	const { checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();

	useEffect(() => {
		let isMounted = true;

		const initAuth = async () => {
			try {
				if (session) {
					await checkAdminStatus();
					if (userId) initSocket(userId);
				}
			} catch (error) {
				console.error("Error in auth provider:", error);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		initAuth();

		return () => {
			isMounted = false;
			disconnectSocket();
		};
	}, [session, userId, checkAdminStatus, initSocket, disconnectSocket]);

	// Clear socket if user logs out
	useEffect(() => {
		if (!session) {
			disconnectSocket();
		}
	}, [session, disconnectSocket]);

	if (loading) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<Loader className="size-8 text-emerald-500 animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
};

export default AuthProvider;
