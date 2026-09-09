const resolveApiBaseUrl = () => {
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    if (typeof window === 'undefined') {
        return 'http://localhost:8090/api';
    }

    const { hostname, port } = window.location;
    const esLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    if (esLocal) {
        return 'http://localhost:8090/api';
    }

    if (port === '3000' || hostname.includes('-3000.')) {
        return '/api';
    }

    return 'http://localhost:8090/api';
};

const API_BASE_URL = resolveApiBaseUrl();

export const apiUrl = (path = '') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export default API_BASE_URL;
