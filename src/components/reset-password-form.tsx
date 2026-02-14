"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import "@/lib/auth-config";
import { confirmResetPassword } from 'aws-amplify/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"


const resetPasswordSchema = z.object({
    code: z.string().min(6, "Código deve ter 6 dígitos"),
    newPassword: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentProps<"form">) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');

    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isValid, isSubmitting },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
    })

    if (!email) {
        return (
            <div className={cn("flex flex-col gap-6 text-center", className)} {...props}>
                <p className="text-red-500">Email não fornecido. Por favor, inicie o processo novamente.</p>
                <Link href="/" className="underline underline-offset-4">Voltar para Login</Link>
            </div>
        )
    }

    async function handleResetPassword(data: ResetPasswordFormValues) {
        setError(null);
        try {
            await confirmResetPassword({
                username: email!,
                confirmationCode: data.code,
                newPassword: data.newPassword
            });

            router.push('/');
        } catch (err: unknown) {
            console.error("Erro ao resetar senha:", err);
            const message = err instanceof Error ? err.message : "Erro ao redefinir senha.";
            setError(message);
        }
    }

    return (
        <form onSubmit={handleSubmit(handleResetPassword)} className={cn("flex flex-col gap-6", className)} {...props}>
            <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="text-2xl font-bold">Redefinir Senha</h1>
                    <p className="text-muted-foreground text-sm text-balance">
                        Digite o código enviado para <strong>{email}</strong> e sua nova senha.
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="code">Código de Verificação</FieldLabel>
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            onChange={(value) => setValue("code", value, { shouldValidate: true })}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                    {errors.code && <p className="text-red-500 text-xs mt-1 text-center">{errors.code.message}</p>}
                </Field>

                <Field>
                    <FieldLabel htmlFor="newPassword">Nova Senha</FieldLabel>
                    <Input
                        id="newPassword"
                        type="password"
                        placeholder="Nova senha"
                        {...register("newPassword")}
                        className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                    <FieldDescription>
                        Deve ter pelo menos 8 caracteres.
                    </FieldDescription>
                </Field>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Field>
                    <Button type="submit" disabled={!isValid || isSubmitting}>
                        {isSubmitting ? "Redefinindo..." : "Redefinir Senha"}
                    </Button>
                    <FieldDescription className="px-6 text-center mt-4">
                        <Link href="/" className="underline underline-offset-4">Voltar para Login</Link>
                    </FieldDescription>
                </Field>
            </FieldGroup>
        </form>
    )
}
