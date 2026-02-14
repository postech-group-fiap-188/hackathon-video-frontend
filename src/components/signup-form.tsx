"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState, useEffect } from "react"
import Link from "next/link"
import "@/lib/auth-config";
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
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
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { RefreshCwIcon } from "lucide-react"

const signupSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'SIGNUP' | 'CONFIRM'>('SIGNUP');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  async function handleSignUp(data: SignupFormValues) {
    setError(null);
    try {
      const { isSignUpComplete } = await signUp({
        username: data.email,
        password: data.password,
        options: {
          userAttributes: {
            email: data.email,
            name: data.name
          }
        }
      });

      if (!isSignUpComplete) {
        setEmail(data.email);
        setStep('CONFIRM');
        setCountdown(60);
      } else {
        router.push('/');
      }
    } catch (error: unknown) {

      const msg = error instanceof Error ? error.message : "Erro ao criar conta.";
      setError(msg);
    }
  }

  async function handleConfirmVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      })

      if (isSignUpComplete) {
        router.push("/")
      }
    } catch (err: unknown) {

      const msg = err instanceof Error ? err.message : "Falha na verificação. Tente novamente.";
      setError(msg);
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
    } catch (err: unknown) {

      const msg = err instanceof Error ? err.message : "Erro ao reenviar código.";
      setError(msg);
    }
  }

  if (step === 'CONFIRM') {
    return (
      <form onSubmit={handleConfirmVerify} className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Verifique seu login</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Digite o código de verificação enviado para o seu email: <span className="font-medium">{email}</span>.
          </p>
        </div>

        <FieldGroup>
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

          <Field>
            <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
              {loading ? "Verificando..." : "Verificar"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleSignUp)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Crie sua conta</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Preencha o formulário abaixo para criar sua conta
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input
            id="name"
            placeholder="Seu nome completo"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </Field>
        <Field>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          <FieldDescription>
            Deve ter pelo menos 8 caracteres.
          </FieldDescription>
        </Field>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Field>
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Conta"}
          </Button>
          <FieldDescription className="px-6 text-center mt-4">
            Já tem uma conta? <Link href="/" className="underline underline-offset-4">Entrar</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
