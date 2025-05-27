
import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth, useSession } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

const updateApiToken = (token: string | null) => {
	if (token) {
		axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	} else {
		delete axiosInstance.defaults.headers.common["Authorization"];
	}
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const { getToken, userId } = useAuth();
	const { session } = useSession();
	const [loading, setLoading] = useState(true);
	const { checkAdminStatus } = useAuthStore();
	const { initSocket, disconnectSocket } = useChatStore();

	const refreshToken = useCallback(async () => {
		try {
			if (!session) return null;
			const token = await getToken();
			updateApiToken(token);
			return token;
		} catch (error) {
			console.error("Error refreshing token:", error);
			return null;
		}
	}, [getToken, session]);

	useEffect(() => {
		let isMounted = true;
		let tokenRefreshInterval: NodeJS.Timeout;

		const initAuth = async () => {
			try {
				const token = await refreshToken();
				if (!isMounted) return;

				if (token) {
					await checkAdminStatus();
					if (userId) initSocket(userId);
				}
			} catch (error) {
				console.error("Error in auth provider:", error);
				updateApiToken(null);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		initAuth();

		// Refresh token every 4 minutes (before the 5-minute expiry)
		tokenRefreshInterval = setInterval(refreshToken, 4 * 60 * 1000);

		return () => {
			isMounted = false;
			clearInterval(tokenRefreshInterval);
			disconnectSocket();
		};
	}, [refreshToken, userId, checkAdminStatus, initSocket, disconnectSocket]);

	// Listen for session changes
	useEffect(() => {
		if (!session) {
			updateApiToken(null);
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
