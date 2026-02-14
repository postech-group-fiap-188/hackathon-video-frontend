"use client"

import * as React from "react"
import { IconUpload } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface VideoUploadProps {
    readonly onVideoSelect?: (files: File[]) => void
}

export function VideoUpload({ onVideoSelect }: VideoUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [isDragging, setIsDragging] = React.useState(false)
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files))
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('video/'))
            if (files.length > 0) {
                setSelectedFiles(files)
            } else {
                toast.error("Por favor, solte apenas arquivos de vídeo.")
            }
        }
    }

    const handleZoneClick = () => {
        fileInputRef.current?.click()
    }

    const handleContinue = async () => {
        if (selectedFiles.length > 0) {
            setIsUploading(true)
            await new Promise(resolve => setTimeout(resolve, 500))

            if (onVideoSelect) {
                onVideoSelect(selectedFiles)
            } else {
                toast.success("Vídeos preparados")
            }
            setIsUploading(false)
        } else {
            toast.error("Por favor, selecione pelo menos um vídeo.")
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Processar Novos Vídeos</CardTitle>
                <CardDescription>
                    Faça o upload dos seus vídeos aqui para iniciar a configuração de extração.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <button
                    type="button"
                    className={`
                        relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
                        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleZoneClick}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleZoneClick()
                        }
                    }}
                >
                    <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="video/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="flex flex-col items-center justify-center p-6 text-center gap-4">
                        <div className={`p-4 rounded-full bg-background shadow-sm ring-1 ring-inset ring-border transition-transform ${isDragging ? "scale-110" : ""}`}>
                            <IconUpload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {selectedFiles.length > 0 ? (
                                    <span className="text-primary font-bold">
                                        {selectedFiles.length} arquivo(s) selecionado(s)
                                    </span>
                                ) : (
                                    <>
                                        Arraste vídeos ou <span className="text-primary hover:underline">clique para selecionar</span>
                                    </>
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Suporta MP4, MOV, AVI (Múltiplos arquivos)
                            </p>
                        </div>
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2">
                            {selectedFiles.slice(0, 3).map((file, i) => (
                                <div key={`${file.name}-${i}`} className="text-[10px] bg-background/80 backdrop-blur border px-2 py-1 rounded-md truncate max-w-[120px]">
                                    {file.name}
                                </div>
                            ))}
                            {selectedFiles.length > 3 && (
                                <div className="text-[10px] bg-background/80 backdrop-blur border px-2 py-1 rounded-md">
                                    +{selectedFiles.length - 3} mais
                                </div>
                            )}
                        </div>
                    )}
                </button>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    onClick={handleContinue}
                    disabled={isUploading || selectedFiles.length === 0}
                >
                    {isUploading ? (
                        <>Abrindo Editor...</>
                    ) : (
                        <>
                            Continuar para Configuração
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}
