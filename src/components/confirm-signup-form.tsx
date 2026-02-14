"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { confirmSignUp, resendSignUpCode } from "aws-amplify/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { RefreshCwIcon } from "lucide-react"

export function ConfirmSignUpForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""
    const [code, setCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(60)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    async function handleVerify(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const { isSignUpComplete } = await confirmSignUp({
                username: email,
                confirmationCode: code
            })

            if (isSignUpComplete) {

                router.push("/")
            }
        } catch (err) {

            const message = err instanceof Error ? err.message : "Falha na verificação";
            setError(message || "Falha na verificação. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    async function handleResendCode() {
        if (!email) return
        setError(null)
        setMessage(null)
        try {
            const output = await resendSignUpCode({ username: email })
            setMessage(`Código reenviado com sucesso para: ${output.destination}`)
            setCountdown(60);
        } catch (err) {

            const message = err instanceof Error ? err.message : "Erro ao reenviar código"
            setError(message || "Erro ao reenviar código.")
        }
    }

    if (!email) {
        return (
            <Card className="mx-auto max-w-md">
                <CardContent className="pt-6">
                    <p>Email não fornecido. Por favor, tente fazer login novamente.</p>
                    <Button onClick={() => router.push("/")} className="mt-4 w-full">Voltar para Login</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <form onSubmit={handleVerify}>
            <Card className="mx-auto max-w-md">
                <CardHeader>
                    <CardTitle>Verifique seu login</CardTitle>
                    <CardDescription>
                        Digite o código de verificação enviado para o seu email:{" "}
                        <span className="font-medium">{email}</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Field>
                            <div className="flex items-center justify-between mb-2">
                                <FieldLabel htmlFor="otp-verification">
                                    Código de Verificação
                                </FieldLabel>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={loading || countdown > 0}
                                >
                                    <RefreshCwIcon className={cn("mr-2 h-4 w-4", countdown > 0 && "animate-spin")} />
                                    {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar Código"}
                                </Button>
                            </div>
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={code} onChange={(val) => setCode(val)} id="otp-verification" required>
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            {message && <p className="text-green-600 text-sm mt-2">{message}</p>}

                        </Field>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
                        {loading ? "Verificando..." : "Verificar"}
                    </Button>

                </CardFooter>
            </Card>
        </form>
    )
}
