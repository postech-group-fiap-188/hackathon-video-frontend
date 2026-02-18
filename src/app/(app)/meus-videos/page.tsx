"use client"

import * as React from "react"
import { VideoTable, Video, VideoStatus } from "@/components/video-table"
import { fetchVideos, BackendVideo, generateZipUrl } from "@/services/video-service"
import { toast } from "sonner"

export default function MeusVideosPage() {
  const [videosState, setVideosState] = React.useState<Video[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [processingZipIds, setProcessingZipIds] = React.useState<Set<string>>(new Set())

  const mapBackendVideoToVideo = React.useCallback((bv: BackendVideo): Video => {
    const statusMap: Record<string, VideoStatus> = {
      PENDING: "Pending",
      PROCESSING: "Processing",
      DONE: "Done",
      SUCCEEDED: "Succeeded",
      ERROR: "Error",
    }
    const status = statusMap[bv.status] || "Pending"
    return {
      id: bv.id,
      filename: bv.originalFileName,
      status,
      submittedAt: bv.createdAt,
      downloadUrl: bv.downloadUrl ?? null,
    }
  }, [])

  const loadVideos = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const items = await fetchVideos()
      setVideosState(items.map(mapBackendVideoToVideo))
    } catch (error) {
      console.error("Failed to load videos", error)
    } finally {
      setIsLoading(false)
    }
  }, [mapBackendVideoToVideo])

  React.useEffect(() => {
    loadVideos()
  }, [loadVideos])

  const handleGenerateZip = async (videoId: string) => {
    setProcessingZipIds((prev) => new Set(prev).add(videoId))
    try {
      const downloadUrl = await generateZipUrl(videoId)
      if (downloadUrl) {
        const link = document.createElement("a")
        link.href = downloadUrl
        link.setAttribute("download", "")
        document.body.appendChild(link)
        link.click()
        link.remove()
        toast.success("Download Concluído!")
      }
    } catch (error) {
      console.error("Failed to generate zip", error)
      toast.error("Ocorreu um erro ao gerar o arquivo ZIP.")
    } finally {
      setProcessingZipIds((prev) => {
        const updated = new Set(prev)
        updated.delete(videoId)
        return updated
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="grid gap-6">
        <VideoTable
          data={videosState}
          isLoading={isLoading}
          onGenerateZip={handleGenerateZip}
          onRefresh={loadVideos}
          processingZipIds={processingZipIds}
        />
      </div>
    </div>
  )
}
