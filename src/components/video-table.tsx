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

export type VideoStatus = "Pending" | "Processing" | "Done" | "Error"

export interface Video {
    id: string
    filename: string
    status: VideoStatus
    submittedAt: string
    downloadUrl?: string | null
}

interface VideoTableProps {
    readonly data: Video[]
}

export function VideoTable({ data: initialData }: VideoTableProps) {
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
        await new Promise(resolve => setTimeout(resolve, 1000))
        setData([...initialData])
        setIsRefreshing(false)
    }

    const filteredData = React.useMemo(() => {
        return data.filter(video => {
            if (statusFilter === "all") return true
            if (statusFilter === "processing") return video.status === "Processing" || video.status === "Pending"
            if (statusFilter === "done") return video.status === "Done"
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

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1.5">
                    <CardTitle>Vídeos Recentes</CardTitle>
                    <CardDescription>
                        Lista dos seus vídeos processados e seus status.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    <IconRefresh className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">

                <Tabs defaultValue="all" value={statusFilter} onValueChange={(val) => {
                    setStatusFilter(val)
                    setCurrentPage(1)
                }}>
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="processing">Processando</TabsTrigger>
                        <TabsTrigger value="done">Concluídos</TabsTrigger>
                        <TabsTrigger value="error">Com Erro</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vídeo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Enviado Em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((video) => (
                                    <TableRow key={video.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <IconVideo className="h-5 w-5 text-muted-foreground" />
                                            {video.filename}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(video.status)}</TableCell>
                                        <TableCell>
                                            <span suppressHydrationWarning>
                                                {new Date(video.submittedAt).toLocaleString('pt-BR')}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {video.status === "Done" && video.downloadUrl ? (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a href={video.downloadUrl} download>
                                                        <IconDownload className="h-4 w-4 mr-2" /> Baixar ZIP
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Nenhum vídeo encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Linhas por página</span>
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

                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Página {currentPage} de {totalPages || 1}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Anterior</span>
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
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
