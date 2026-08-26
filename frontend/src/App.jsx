import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ThemeProvider } from "./context/theme";
import { SessionProvider } from "./context/session";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Links from "./pages/Links";
import CreateLink from "./pages/CreateLink";
import EditLink from "./pages/EditLink";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";

export default function App() {
	return (
		<ThemeProvider>
			<SessionProvider>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/dashboard" element={<DashboardLayout />}>
							<Route index element={<Dashboard />} />
							<Route path="links" element={<Links />} />
							<Route path="links/create" element={<CreateLink />} />
							<Route path="links/:id" element={<EditLink />} />
						</Route>
						<Route path="*" element={<NotFound />} />
					</Routes>
					<ToastContainer
						position="top-right"
						autoClose={4000}
						theme="colored"
					/>
				</BrowserRouter>
			</SessionProvider>
		</ThemeProvider>
	);
}