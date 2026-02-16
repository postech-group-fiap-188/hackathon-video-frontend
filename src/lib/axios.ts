import axios from 'axios';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://fiap-lab.com.br',
});

api.interceptors.request.use(async (config) => {
    try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error fetching auth session:', error);
    }
    return config;
}, (error) => {
    throw error;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                await signOut();
            } catch (signOutError) {
                console.error('Error during automatic sign out:', signOutError);
            }
            globalThis.location.href = '/';
        }
        throw error;
    }
);

export default api;

