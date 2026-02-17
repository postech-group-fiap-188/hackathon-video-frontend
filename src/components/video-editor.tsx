"use client"

import * as React from "react"
import {
    IconFileTypeZip,
    IconPlayerPlayFilled,
    IconPlayerPauseFilled,
    IconChevronLeft,
    IconVideo,
    IconRotateClockwise,
    IconPlayerSkipBack,
    IconPlayerSkipForward,
    IconBulb
} from "@tabler/icons-react"
import { toast } from "sonner"
import { uploadVideos } from "@/services/video-service"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"

interface VideoEditorProps {
    readonly videoFiles: File[]
    readonly onBack: () => void
    readonly onProcessComplete?: (files: File[]) => void
}

export function VideoEditor({ videoFiles, onBack, onProcessComplete }: VideoEditorProps) {
    const [currentVideoIndex, setCurrentVideoIndex] = React.useState(0)
    const videoFile = videoFiles[currentVideoIndex] || null

    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [currentTime, setCurrentTime] = React.useState(0)
    const [duration, setDuration] = React.useState(0)

    const [isProcessing, setIsProcessing] = React.useState(false)
    const [uploadProgress, setUploadProgress] = React.useState(0)

    React.useEffect(() => {
        if (videoRef.current) {
            setIsPlaying(false)
            setCurrentTime(0)
            setDuration(0)

            if (videoFile) {
                const url = URL.createObjectURL(videoFile)
                videoRef.current.src = url
                return () => URL.revokeObjectURL(url)
            }
        }
    }, [videoFile])

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const handleGenerateZip = async () => {
        setIsProcessing(true)
        try {
            await uploadVideos(videoFiles, (progress) => {
                setUploadProgress(progress)
            })
            toast.success("Processamento iniciado!", {
                description: `Os vídeos foram enviados para a fila de processamento.`
            })

            if (onProcessComplete) {
                onProcessComplete(videoFiles)
            }
            onBack()
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Erro ao enviar vídeos", {
                description: "Não foi possível enviar os vídeos para processamento."
            })
        } finally {
            setIsProcessing(false)
        }
    }

    if (!videoFile) return null

    return (
        <div className="flex flex-col gap-4 h-auto lg:h-[calc(100vh-4rem)] p-4 lg:p-6 overflow-y-auto lg:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <IconChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold leading-tight">Visualização de Vídeos</h2>
                        <p className="text-sm text-muted-foreground">{videoFiles.length} vídeo(s) selecionado(s)</p>
                    </div>
                </div>

                {isProcessing ? (
                    <div className="w-full md:w-auto md:min-w-[240px]">
                        <Field className="w-full">
                            <FieldLabel htmlFor="progress-upload" className="flex justify-between text-xs font-semibold mb-1">
                                <span>Enviando arquivos...</span>
                                <span className="ml-auto font-mono">{Math.round(uploadProgress)}%</span>
                            </FieldLabel>
                            <Progress value={uploadProgress} id="progress-upload" className="h-2" />
                        </Field>
                    </div>
                ) : (
                    <Button
                        className="relative w-full md:w-auto px-8 h-11 transition-all rounded-lg shadow-lg hover:shadow-xl shadow-primary/20 overflow-hidden font-semibold"
                        onClick={handleGenerateZip}
                        disabled={isProcessing}
                    >
                        <span className="relative flex items-center justify-center gap-2">
                            <IconFileTypeZip className="h-4 w-4" /> Enviar para Processamento
                        </span>
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:flex-1 lg:min-h-0">
                <div className="lg:col-span-3 flex flex-col gap-6 lg:h-full lg:min-h-0">
                    <div className="relative w-full aspect-video lg:aspect-auto lg:flex-1 bg-black rounded-xl overflow-hidden shadow-2xl group min-h-0">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain"
                            onLoadedMetadata={handleLoadedMetadata}
                            onTimeUpdate={handleTimeUpdate}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        >
                            <track kind="captions" />
                        </video>

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-4">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
                                    {isPlaying ? <IconPlayerPauseFilled className="h-6 w-6" /> : <IconPlayerPlayFilled className="h-6 w-6" />}
                                </Button>

                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="range"
                                        min={0}
                                        max={duration || 100}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={(e) => {
                                            if (videoRef.current) {
                                                videoRef.current.currentTime = Number.parseFloat(e.target.value)
                                            }
                                        }}
                                        className="w-full h-1.5 rounded-full cursor-pointer accent-primary bg-white/30 hover:bg-white/50 transition-all focus:outline-none"
                                    />
                                    <div className="flex justify-between text-[10px] text-white/80 font-mono">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!isPlaying && currentTime === 0 && (
                            <button
                                type="button"
                                className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 cursor-pointer border-none outline-none"
                                onClick={togglePlay}
                            >
                                <div className="bg-primary/90 text-primary-foreground p-5 rounded-full shadow-2xl backdrop-blur-sm transform transition-transform hover:scale-110">
                                    <IconPlayerPlayFilled className="h-8 w-8" />
                                </div>
                            </button>
                        )}
                    </div>

                    <div className="flex justify-center items-center gap-6 py-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => {
                                        if (videoRef.current) videoRef.current.currentTime = 0;
                                    }}>
                                        <IconRotateClockwise className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Reiniciar</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => {
                                        if (videoRef.current) videoRef.current.currentTime -= 5;
                                    }}>
                                        <IconPlayerSkipBack className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Voltar 5s</p></TooltipContent>
                            </Tooltip>

                            <Button variant="default" size="icon" className="h-16 w-16 rounded-full shadow-xl shadow-primary/20" onClick={togglePlay}>
                                {isPlaying ? <IconPlayerPauseFilled className="h-8 w-8" /> : <IconPlayerPlayFilled className="h-8 w-8" />}
                            </Button>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={() => {
                                        if (videoRef.current) videoRef.current.currentTime += 5;
                                    }}>
                                        <IconPlayerSkipForward className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Avançar 5s</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">
                    <Card className="border-none shadow-md flex flex-col flex-1 min-h-0 overflow-hidden">
                        <CardHeader className="pb-3 shrink-0">
                            <CardTitle className="text-base font-medium">Fila de Upload</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden p-4 pt-0 w-full">
                            {videoFiles.map((file, index) => (
                                <Button
                                    key={`${file.name}-${file.lastModified}`}
                                    variant={currentVideoIndex === index ? "secondary" : "ghost"}
                                    className="justify-start font-normal h-auto py-3 shrink-0 w-full max-w-full"
                                    onClick={() => setCurrentVideoIndex(index)}
                                >
                                    <IconVideo className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    <span className="truncate text-left flex-1 min-w-0 pr-4 text-sm">{file.name}</span>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/10 border-primary/20 shadow-none border">
                        <CardContent className="p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <IconBulb className="h-4 w-4 text-primary" />
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Dica</h4>
                            </div>
                            <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                                Você pode visualizar cada vídeo antes do envio clicando na lista acima. O processamento será feito para todos os vídeos da fila.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
