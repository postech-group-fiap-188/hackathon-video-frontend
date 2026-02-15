"use client"

import { Suspense } from "react"
import { ConfirmSignUpForm } from "@/components/confirm-signup-form"
import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "@/components/ui/mode-toggle"

function ConfirmSignUpContent() {
    return <ConfirmSignUpForm />
}

export default function ConfirmPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <Image src="/fiap-lab.svg" alt="Fiap Lab" width={32} height={32} />
                        Fiap Lab
                    </Link>
                    <ModeToggle />
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <Suspense fallback={<div>Loading...</div>}>
                            <ConfirmSignUpContent />
                        </Suspense>
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <Image
                    src="/banner-login.png"
                    alt="Image"
                    fill
                    priority
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>
        </div>
    )
}
