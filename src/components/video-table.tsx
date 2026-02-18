"use client"

import * as React from "react"
import {
    IconDownload,
    IconLoader,
    IconAlertCircle,
    IconCheck,
    IconVideo,
    IconRefresh,
    IconChevronLeft,
    IconChevronRight
} from "@tabler/icons-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export type VideoStatus = "Pending" | "Processing" | "Done" | "Error" | "Succeeded"

export interface Video {
    id: string
    filename: string
    status: VideoStatus
    submittedAt: string
    downloadUrl?: string | null
}

interface VideoTableProps {
    readonly data: Video[]
    readonly onGenerateZip?: (id: string, filename: string) => Promise<void>
    readonly onRefresh?: () => Promise<void>
    readonly processingZipIds?: Set<string>
    readonly isLoading?: boolean
}

export function VideoTable({ data: initialData, onGenerateZip, onRefresh, processingZipIds = new Set(), isLoading }: VideoTableProps) {
    const [data, setData] = React.useState(initialData)
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    const [currentPage, setCurrentPage] = React.useState(1)
    const [pageSize, setPageSize] = React.useState(10)
    const [statusFilter, setStatusFilter] = React.useState("all")

    React.useEffect(() => {
        setData(initialData)
    }, [initialData])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        if (onRefresh) {
            await onRefresh()
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
            setData([...initialData])
        }
        setIsRefreshing(false)
    }

    const filteredData = React.useMemo(() => {
        return data.filter(video => {
            if (statusFilter === "all") return true
            if (statusFilter === "processing") return video.status === "Processing" || video.status === "Pending"
            if (statusFilter === "done") return video.status === "Done" || video.status === "Succeeded"
            if (statusFilter === "error") return video.status === "Error"
            return true
        })
    }, [data, statusFilter])

    const totalPages = Math.ceil(filteredData.length / pageSize)
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return filteredData.slice(startIndex, startIndex + pageSize)
    }, [filteredData, currentPage, pageSize])

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const getStatusBadge = (status: VideoStatus) => {
        switch (status) {
            case "Done":
                return (
                    <Badge variant="outline" className="border-green-500 text-green-500 gap-1">
                        <IconCheck className="h-3 w-3" /> Concluído
                    </Badge>
                )
            case "Succeeded":
                return (
                    <Badge variant="outline" className="border-green-600 text-green-600 gap-1">
                        <IconCheck className="h-3 w-3" /> Processado
                    </Badge>
                )
            case "Processing":
            case "Pending":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-500 gap-1">
                        <IconLoader className="h-3 w-3 animate-spin" /> Processando
                    </Badge>
                )
            case "Error":
                return (
                    <Badge variant="destructive" className="gap-1">
                        <IconAlertCircle className="h-3 w-3" /> Erro
                    </Badge>
                )
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const renderTableContent = () => {
        let tableContent;

        if (isLoading) {
            tableContent = Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-5 w-full max-w-[120px] sm:max-w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-[80px] sm:w-[100px] ml-auto" /></TableCell>
                </TableRow>
            ));
        } else if (paginatedData.length === 0) {
            tableContent = (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Nenhum vídeo encontrado.
                    </TableCell>
                </TableRow>
            );
        } else {
            tableContent = paginatedData.map((video) => {
                const isSucceeded = video.status === "Succeeded";
                const isDoneWithUrl = video.status === "Done" && video.downloadUrl;
                const isGeneratingZip = processingZipIds.has(video.id);

                return (
                    <TableRow key={video.id}>
                        <TableCell className="font-medium min-w-0 max-w-[140px] sm:max-w-[280px]">
                            <span className="flex items-center gap-2 min-w-0">
                                <IconVideo className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <span className="truncate" title={video.filename}>{video.filename}</span>
                            </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{getStatusBadge(video.status)}</TableCell>
                        <TableCell className="hidden whitespace-nowrap sm:table-cell">
                            <span suppressHydrationWarning>
                                {new Date(video.submittedAt).toLocaleString('pt-BR')}
                            </span>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                            {isSucceeded && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onGenerateZip?.(video.id, video.filename)}
                                    disabled={isGeneratingZip}
                                    className="inline-flex"
                                >
                                    {isGeneratingZip ? (
                                        <>
                                            <IconLoader className="h-4 w-4 mr-1 sm:mr-2 animate-spin shrink-0" /> <span className="hidden sm:inline">Gerando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconDownload className="h-4 w-4 mr-1 sm:mr-2 shrink-0" /> <span className="hidden sm:inline">Gerar ZIP</span>
                                        </>
                                    )}
                                </Button>
                            )}

                            {isDoneWithUrl ? (
                                <Button variant="ghost" size="sm" asChild className="inline-flex">
                                    <a href={video.downloadUrl!} download>
                                        <IconDownload className="h-4 w-4 mr-1 sm:mr-2 shrink-0" /> <span className="hidden sm:inline">Baixar ZIP</span>
                                    </a>
                                </Button>
                            ) : !isSucceeded && (
                                <span className="text-muted-foreground text-sm">-</span>
                            )}
                        </TableCell>
                    </TableRow>
                );
            });
        }
        return tableContent;
    }

    return (
        <Card className="min-w-0 overflow-hidden">
            <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5 min-w-0">
                    <CardTitle>Vídeos Recentes</CardTitle>
                    <CardDescription>
                        Lista dos seus vídeos processados e seus status.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="shrink-0">
                    <IconRefresh className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 min-w-0">

                <Tabs defaultValue="all" value={statusFilter} onValueChange={(val) => {
                    setStatusFilter(val)
                    setCurrentPage(1)
                }}>
                    <TabsList className="grid h-auto min-h-9 w-full grid-cols-2 gap-1.5 p-1.5 sm:inline-flex sm:h-9 sm:w-auto sm:flex-row sm:gap-1 sm:p-[3px]">
                        <TabsTrigger value="all" className="min-w-0 whitespace-normal px-2 py-1.5 text-xs sm:whitespace-nowrap sm:py-1 sm:text-sm sm:flex-none">Todos</TabsTrigger>
                        <TabsTrigger value="processing" className="min-w-0 whitespace-normal px-2 py-1.5 text-xs sm:whitespace-nowrap sm:py-1 sm:text-sm sm:flex-none">Processando</TabsTrigger>
                        <TabsTrigger value="done" className="min-w-0 whitespace-normal px-2 py-1.5 text-xs sm:whitespace-nowrap sm:py-1 sm:text-sm sm:flex-none">Concluídos</TabsTrigger>
                        <TabsTrigger value="error" className="min-w-0 whitespace-normal px-2 py-1.5 text-xs sm:whitespace-nowrap sm:py-1 sm:text-sm sm:flex-none">Com Erro</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vídeo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden sm:table-cell">Enviado Em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {renderTableContent()}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="whitespace-nowrap">Linhas por página</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(val) => {
                            setPageSize(Number(val))
                            setCurrentPage(1)
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
                    <div className="flex min-w-0 items-center justify-center text-sm font-medium">
                        Página {currentPage} de {totalPages || 1}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Anterior</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 shrink-0"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <span className="sr-only">Próximo</span>
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
