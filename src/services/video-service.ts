import axios from 'axios';
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

export const uploadVideos = async (files: File[], onProgress?: (progress: number) => void): Promise<void> => {
    const payload = {
        files: files.map(file => ({
            originalFileName: file.name,
            contentType: file.type
        }))
    };

    const response = await api.post<any>('/videos/upload', payload);

    const filesResponse = response.data.items || response.data.files || (Array.isArray(response.data) ? response.data : null);

    if (!Array.isArray(filesResponse)) {
        throw new TypeError('Formato de resposta inválido: esperava-se uma lista de itens.');
    }

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    const loadedBytes = new Array(files.length).fill(0);

    const uploadPromises = filesResponse.map((fileData: any, index: number) => {
        const file = files[index];

        const uploadUrl = fileData.uploadUrl || fileData.url || fileData.presignedUrl;

        if (!uploadUrl) {
            throw new Error(`URL de upload não encontrada para o arquivo ${file.name}`);
        }

        return axios.put(uploadUrl, file, {
            headers: {
                'Content-Type': file.type || 'application/octet-stream'
            },
            onUploadProgress: (progressEvent) => {
                if (onProgress) {
                    loadedBytes[index] = progressEvent.loaded;
                    const totalLoaded = loadedBytes.reduce((acc, val) => acc + val, 0);
                    const progress = Math.min(Math.round((totalLoaded * 100) / totalSize), 100);
                    onProgress(progress);
                }
            }
        });
    });

    await Promise.all(uploadPromises);
};
