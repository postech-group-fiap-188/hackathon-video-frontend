"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { VideoUpload } from "@/components/video-upload"
import { VideoEditor } from "@/components/video-editor"

export default function NovosVideosPage() {
  const router = useRouter()
  const [selectedVideos, setSelectedVideos] = React.useState<File[]>([])

  const handleVideoSelect = (files: File[]) => {
    setSelectedVideos(files)
  }

  const handleBack = () => {
    setSelectedVideos([])
  }

  const handleProcessComplete = () => {
    setSelectedVideos([])
    router.push("/meus-videos")
  }

  if (selectedVideos.length > 0) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <VideoEditor
          videoFiles={selectedVideos}
          onBack={handleBack}
          onProcessComplete={handleProcessComplete}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="grid gap-6">
        <VideoUpload onVideoSelect={handleVideoSelect} />
      </div>
    </div>
  )
}
