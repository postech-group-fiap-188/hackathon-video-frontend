"use client"

import * as React from "react"
import {
    IconSettings,

    IconFileTypeZip,
    IconScissors,
    IconPlayerPlayFilled,
    IconPlayerPauseFilled,
    IconChevronLeft,
    IconVideo,
    IconRotateClockwise,
    IconPlayerSkipBack,
    IconPlayerSkipForward
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

    const [startTime, setStartTime] = React.useState(0)
    const [endTime, setEndTime] = React.useState(0)

    const [frequency, setFrequency] = React.useState("1")
    const [resolution, setResolution] = React.useState("720p")

    const [isProcessing, setIsProcessing] = React.useState(false)

    const stripes = React.useMemo(() => Array.from({ length: 50 }).map((_, i) => ({ id: `stripe-${i}` })), [])

    React.useEffect(() => {
        if (videoRef.current) {
            setIsPlaying(false)
            setCurrentTime(0)
            setDuration(0)
            setStartTime(0)
            setEndTime(0)

            if (videoFile) {
                const url = URL.createObjectURL(videoFile)
                videoRef.current.src = url
                return () => URL.revokeObjectURL(url)
            }
        }
    }, [videoFile])

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const d = videoRef.current.duration
            setDuration(d)
            if (endTime === 0 || endTime > d) {
                setEndTime(d)
            }
            if (startTime > d) setStartTime(0)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
            if (videoRef.current.currentTime > endTime) {
                videoRef.current.pause()
                setIsPlaying(false)
            }
        }
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                if (videoRef.current.currentTime >= endTime) {
                    videoRef.current.currentTime = startTime
                }
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
        await new Promise(resolve => setTimeout(resolve, 3000))
        toast.success("Processamento iniciado!", {
            description: `Os vídeos foram enviados para a fila de processamento.`
        })

        if (onProcessComplete) {
            onProcessComplete(videoFiles)
        }

        setIsProcessing(false)
        onBack()
    }



    if (!videoFile) return null



    return (
        <div className="flex flex-col gap-4 h-auto lg:h-[calc(100vh-4rem)] p-4 lg:p-6 overflow-y-auto lg:overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <IconChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">Editor de Extração</h2>
                    <p className="text-sm text-muted-foreground">{videoFiles.length} vídeo(s) selecionado(s)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0">
                <div className="lg:col-span-2 flex flex-col gap-6 lg:h-full lg:min-h-0">

                    <div className="relative w-full aspect-video lg:aspect-auto lg:flex-1 bg-black rounded-xl overflow-hidden shadow-lg group min-h-0">
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
                        <button
                            type="button"
                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none outline-none"
                            onClick={togglePlay}
                        >
                            <div className="bg-primary/90 text-primary-foreground p-4 rounded-full shadow-2xl backdrop-blur-sm transform transition-transform hover:scale-110">
                                {isPlaying ? <IconPlayerPauseFilled className="h-8 w-8" /> : <IconPlayerPlayFilled className="h-8 w-8" />}
                            </div>
                        </button>

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
                            className="absolute bottom-4 left-4 right-4 w-[calc(100%-2rem)] h-1.5 rounded-full cursor-pointer accent-primary bg-white/20 hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <Card className="border-none shadow-md shrink-0">
                        <CardContent className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <IconScissors className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-lg">Intervalo de Captura</h3>
                            </div>

                            <div className="flex items-center justify-between px-8">
                                <div className="flex flex-col items-center bg-muted/50 px-4 py-2 rounded-lg text-center min-w-[100px] border border-border/50">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Início</span>
                                    <span className="text-xl font-mono text-primary font-bold">{formatTime(startTime)}</span>
                                </div>
                                <div className="flex flex-col items-center bg-muted/50 px-4 py-2 rounded-lg text-center min-w-[100px] border border-border/50">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Fim</span>
                                    <span className="text-xl font-mono text-primary font-bold">{formatTime(endTime)}</span>
                                </div>
                            </div>

                            <div className="relative w-full mt-2 select-none px-8">
                                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-2 rounded-full overflow-hidden flex gap-[2px] opacity-20 pointer-events-none">
                                    {stripes.map((stripe) => (
                                        <div key={stripe.id} className="flex-1 bg-foreground/20 rounded-full" />
                                    ))}
                                </div>

                                <Slider
                                    value={[startTime, endTime]}
                                    max={duration}
                                    step={0.1}
                                    minStepsBetweenThumbs={0.1}
                                    onValueChange={(vals) => {
                                        const [newStart, newEnd] = vals
                                        setStartTime(newStart)
                                        setEndTime(newEnd)

                                        setEndTime(newEnd)

                                        if (videoRef.current) {
                                            if (Math.abs(newStart - startTime) > 0.01) {
                                                videoRef.current.currentTime = newStart
                                            } else if (Math.abs(newEnd - endTime) > 0.01) {
                                                videoRef.current.currentTime = newEnd
                                            }
                                        }
                                    }}
                                    className="cursor-pointer py-2"
                                />

                            </div>

                            <TooltipProvider>
                                <div className="flex justify-center items-center gap-4 mt-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => {
                                                if (videoRef.current) videoRef.current.currentTime = startTime;
                                            }}>
                                                <IconRotateClockwise className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Reiniciar</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => {
                                                if (videoRef.current) videoRef.current.currentTime -= 5;
                                            }}>
                                                <IconPlayerSkipBack className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Voltar 5s</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="default" size="icon" className="h-10 w-10 rounded-full" onClick={togglePlay}>
                                                {isPlaying ? <IconPlayerPauseFilled className="h-5 w-5" /> : <IconPlayerPlayFilled className="h-5 w-5" />}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{isPlaying ? "Pausar" : "Reproduzir"}</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" size="icon" onClick={() => {
                                                if (videoRef.current) videoRef.current.currentTime += 5;
                                            }}>
                                                <IconPlayerSkipForward className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Avançar 5s</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>

                            <p className="text-xs text-center text-muted-foreground mt-0 uppercase tracking-widest opacity-60">
                                Arraste as alças para selecionar o trecho do vídeo
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-6 lg:h-full lg:min-h-0">

                    <Card className="border-none shadow-md shrink-0">
                        <CardContent className="p-6 flex flex-col gap-6">
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <IconSettings className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-lg">Definições do ZIP</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground tracking-wider font-bold">Frequência de Captura</Label>
                                    <Select value={frequency} onValueChange={setFrequency}>
                                        <SelectTrigger className="h-12 text-base font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 imagem por segundo</SelectItem>
                                            <SelectItem value="5">5 imagens por segundo</SelectItem>
                                            <SelectItem value="keyframes">Apenas Keyframes</SelectItem>
                                            <SelectItem value="all">Frame a frame (Alta densidade)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground tracking-wider font-bold">Resolução das Imagens</Label>
                                    <Select value={resolution} onValueChange={setResolution}>
                                        <SelectTrigger className="h-12 text-base font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="720p">720p (1280x720)</SelectItem>
                                            <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                                            <SelectItem value="480p">480p (854x480)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-2 shrink-0 mt-auto">
                                <Button
                                    className="relative w-full h-11 transition-all rounded-lg shadow-lg hover:shadow-xl shadow-primary/20 overflow-hidden"
                                    onClick={handleGenerateZip}
                                    disabled={isProcessing}
                                >
                                    <div
                                        className={`absolute inset-y-0 left-0 bg-white/25 transition-[width] ease-linear ${isProcessing ? 'w-full duration-[3000ms]' : 'w-0 duration-300'}`}
                                    />
                                    <span className="relative flex items-center justify-center gap-2">
                                        {isProcessing ? (
                                            <>Processando...</>
                                        ) : (
                                            <>
                                                <IconFileTypeZip className="h-4 w-4" /> Processar
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-md flex flex-col flex-1 min-h-0 overflow-hidden">
                        <CardHeader className="pb-3 shrink-0">
                            <CardTitle className="text-base font-medium">Arquivos Selecionados</CardTitle>
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
                                    <span className="truncate text-left flex-1 min-w-0 pr-4">{file.name}</span>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    )
}
