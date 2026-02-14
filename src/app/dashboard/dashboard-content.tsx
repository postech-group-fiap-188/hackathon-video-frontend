"use client"

import * as React from "react"
import { VideoUpload } from "@/components/video-upload"
import { VideoTable, Video } from "@/components/video-table"
import { VideoEditor } from "@/components/video-editor"
import videos from "./videos.json"

export function DashboardContent() {
    const [selectedVideos, setSelectedVideos] = React.useState<File[]>([])
    const [videosState, setVideosState] = React.useState<Video[]>(videos as Video[])

    const handleVideoSelect = (files: File[]) => {
        setSelectedVideos(files)
    }

    const handleBack = () => {
        setSelectedVideos([])
    }

    const handleProcessComplete = (files: File[]) => {
        const newVideos: Video[] = files.map((file, i) => ({
            id: `new-${Date.now()}-${i}`,
            filename: file.name,
            status: "Processing",
            submittedAt: new Date().toISOString(),
        }))

        setVideosState(prev => [...newVideos, ...prev])
        setSelectedVideos([])
    }

    if (selectedVideos.length > 0) {
        return (
            <VideoEditor
                videoFiles={selectedVideos}
                onBack={handleBack}
                onProcessComplete={handleProcessComplete}
            />
        )
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="grid gap-6">
                <VideoUpload onVideoSelect={handleVideoSelect} />
                <VideoTable data={videosState} />
            </div>
        </div>
    )
}
