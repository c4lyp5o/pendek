import { createContext, useContext, useEffect, useState } from "react";

const SessionContext = createContext();

async function getSession() {
	const res = await fetch("/api/session", { credentials: "include" });
	if (!res.ok) return { isLoggedIn: false };
	return res.json();
}

export function SessionProvider({ children }) {
	const [session, setSession] = useState({ isLoggedIn: false });
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let active = true;
		getSession()
			.then((s) => active && setSession(s))
			.finally(() => active && setIsLoading(false));
		return () => {
			active = false;
		};
	}, []);

	const login = async (payload) => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Login failed");
			setSession({ isLoggedIn: true, ...data });
			return data;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async () => {
		await fetch("/api/auth/logout", {
			method: "POST",
			credentials: "include",
		});
		setSession({ isLoggedIn: false });
	};

	const refresh = async () => {
		const s = await getSession();
		setSession(s);
		return s;
	};

	return (
		<SessionContext.Provider
			value={{ session, isLoading, login, logout, refresh }}
		>
			{children}
		</SessionContext.Provider>
	);
}

export function useSession() {
	const ctx = useContext(SessionContext);
	if (!ctx) throw new Error("useSession must be used within SessionProvider");
	return ctx;
}