import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import toast from 'react-hot-toast';
import LoadingCircle from '../components/loading_circle';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await authService.check_cookie_user();
                if (response.status === "success") {
                    setUser(response.user);
                    toast.success(response.message);
                } else {
                    setUser(null);
                    toast.error(response.message);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                toast.error("An error occurred while fetching user data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (credentials) => {
        const response = await authService.login_user(credentials);
        if (response.status === "success") {
            setUser(response.user);
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
        return response;
    };

    const logout = async () => {
        const response = await authService.logout_user();
        if (response.status === "success") {
            setUser(null);
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
        console.log(user)
        return response;
    };

    if (loading) {
        return <LoadingCircle />;
    }

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);