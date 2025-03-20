import { useEffect, useState } from "react";
import { API_BACKEND_URL } from "../config";
import axios from "axios";

interface Website {
    id: string;
    url: string;
    ticks: {
        id: string;
        createdAt: string;
        status: string;
        latency: number;
    }[];
}

export function useWebsites() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [error, setError] = useState<string | null>(null);

    async function refreshWebsites() {
        try {
            const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`);
            setWebsites(response.data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch websites:', error);
            setWebsites([]);
            setError('Failed to fetch websites. Please ensure the API server is running.');
        }
    }

    useEffect(() => {
        refreshWebsites();

        const interval = setInterval(() => {
            refreshWebsites();
        }, 1000 * 60 * 10);

        return () => clearInterval(interval);
    }, []);

    return { websites, refreshWebsites, error };
}