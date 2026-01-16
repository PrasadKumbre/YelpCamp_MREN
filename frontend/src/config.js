
const getApiBaseUrl = () => {
    let url = import.meta.env.VITE_BACKEND_URL || "";
    // Remove trailing slash if present to avoid double slashes
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    return url;
};

const API_BASE_URL = getApiBaseUrl();

export default API_BASE_URL;
