"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import "@/lib/auth-config";
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { RefreshCwIcon } from "lucide-react"

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Email inválido" }),
})

const resetPasswordSchema = z.object({
    code: z.string().min(6, { message: "Código deve ter 6 dígitos" }),
    password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
})

export function ForgotPasswordForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter()
    const [step, setStep] = useState<"request" | "confirm">("request")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const requestForm = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    })

    async function onRequestSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        setLoading(true)
        setError(null)
        setMessage(null)
        try {
            await resetPassword({ username: values.email })
            setEmail(values.email)
            setStep("confirm")
            setMessage("Código enviado para o seu email.")
            setCountdown(60)
        } catch (err) {
            console.error(err)
            const msg = err instanceof Error ? err.message : "Falha ao enviar código";
            setError(msg || "Falha ao enviar código. Verifique o email.")
        } finally {
            setLoading(false)
        }
    }

    const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { code: "", password: "", confirmPassword: "" },
    })

    async function onResetSubmit(values: z.infer<typeof resetPasswordSchema>) {
        setLoading(true)
        setError(null)
        setMessage(null)
        try {
            await confirmResetPassword({
                username: email,
                confirmationCode: values.code,
                newPassword: values.password,
            })
            setMessage("Senha redefinida com sucesso! Redirecionando...")
            setTimeout(() => router.push("/"), 2000)
        } catch (err) {
            console.error(err)
            const msg = err instanceof Error ? err.message : "Falha na redefinição";
            setError(msg || "Falha na redefinição de senha.")
        } finally {
            setLoading(false)
        }
    }

    async function handleResendCode() {
        if (!email) return
        setError(null)
        setMessage(null)
        try {
            await resetPassword({ username: email })
            setMessage("Código reenviado com sucesso! Verifique seu email.")
            setCountdown(60)
        } catch (err) {
            console.error("Erro ao reenviar código:", err)
            const msg = err instanceof Error ? err.message : "Erro ao reenviar";
            setError(msg || "Erro ao reenviar código.")
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">
                        {step === "request" ? "Esqueceu a senha?" : "Redefinir Senha"}
                    </CardTitle>
                    <CardDescription>
                        {step === "request"
                            ? "Digite seu email para receber um código de redefinição."
                            : `Digite o código enviado para ${email} e sua nova senha.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === "request" ? (
                        <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Email</FieldLabel>
                                    <Input
                                        placeholder="m@example.com"
                                        {...requestForm.register("email")}
                                    />
                                    {requestForm.formState.errors.email && (
                                        <p className="text-sm text-red-500">{requestForm.formState.errors.email.message}</p>
                                    )}
                                </Field>

                                {error && <p className="text-sm text-red-500">{error}</p>}
                                {message && <p className="text-sm text-green-500">{message}</p>}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Enviando..." : "Enviar Código"}
                                </Button>

                                <FieldDescription className="text-center">
                                    Lembrou sua senha?{" "}
                                    <Link href="/" className="underline underline-offset-4">
                                        Entrar
                                    </Link>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    ) : (
                        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel>Código de Verificação</FieldLabel>
                                    <div className="flex justify-center">
                                        <InputOTP
                                            maxLength={6}
                                            disabled={loading}
                                            value={resetForm.watch("code")}
                                            onChange={(value) => resetForm.setValue("code", value)}
                                        >
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
                                    {resetForm.formState.errors.code && (
                                        <p className="text-sm text-red-500 text-center">{resetForm.formState.errors.code.message}</p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel>Nova Senha</FieldLabel>
                                    <Input
                                        type="password"
                                        placeholder="Mínimo 8 caracteres"
                                        {...resetForm.register("password")}
                                    />
                                    {resetForm.formState.errors.password && (
                                        <p className="text-sm text-red-500">{resetForm.formState.errors.password.message}</p>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel>Confirmar Nova Senha</FieldLabel>
                                    <Input
                                        type="password"
                                        placeholder="Confirme a senha"
                                        {...resetForm.register("confirmPassword")}
                                    />
                                    {resetForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-red-500">{resetForm.formState.errors.confirmPassword.message}</p>
                                    )}
                                </Field>

                                {error && <p className="text-sm text-red-500">{error}</p>}
                                {message && <p className="text-sm text-green-500">{message}</p>}

                                <div className="flex justify-between items-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleResendCode}
                                        disabled={countdown > 0}
                                    >
                                        <RefreshCwIcon className={cn("mr-2 h-4 w-4", countdown > 0 && "animate-spin")} />
                                        {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar Código"}
                                    </Button>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Redefinindo..." : "Redefinir Senha"}
                                </Button>

                                <FieldDescription className="text-center">
                                    <Link href="/" className="underline underline-offset-4">
                                        Voltar ao Login
                                    </Link>
                                </FieldDescription>
                            </FieldGroup>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
