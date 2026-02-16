import api from '@/lib/axios';

export interface BackendVideo {
    id: string;
    user: {
        props: {
            id: string;
            attributes: Record<string, unknown>;
        }
    };
    inputBucket: string;
    inputKey: string;
    originalFileName: string;
    contentType: string;
    size: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    outputBucket?: string;
    outputKey?: string;
    downloadUrl?: string;
}

export interface ZipUrlResponse {
    downloadUrl: string;
    bucket: string;
    key: string;
}

export interface VideoListResponse {
    items: BackendVideo[];
}

export const fetchVideos = async (): Promise<BackendVideo[]> => {
    try {
        const response = await api.get<VideoListResponse>('/videos');
        return response.data.items;
    } catch (error) {
        console.error('Error fetching videos:', error);
        throw error;
    }
};

export const generateZipUrl = async (videoId: string): Promise<string> => {
    try {
        const response = await api.get<ZipUrlResponse>(`/videos/${videoId}/processed-zip`);
        return response.data.downloadUrl;
    } catch (error) {
        console.error('Error generating zip url:', error);
        throw error;
    }
};

export const uploadVideos = async (files: File[]): Promise<void> => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('videos', file);
    });

    try {
        await api.post('/videos/upload', formData);
    } catch (error) {
        console.error('Error uploading videos:', error);
        throw error;
    }
};
