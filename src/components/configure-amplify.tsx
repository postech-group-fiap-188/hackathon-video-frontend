"use client";

import { useEffect } from "react";
import { authConfig } from "@/lib/auth-config";
import { Amplify } from 'aws-amplify';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import { usePathname, useRouter } from "next/navigation";

Amplify.configure(authConfig, { ssr: false });

const publicPaths = ["/", "/signup", "/forgot-password", "/reset-password", "/confirm-signup"];

export default function ConfigureAmplifyClientSide() {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Tenta buscar a sessão atual
                const session = await fetchAuthSession();

                // Se não houver tokens e não estiver em uma rota pública, redireciona
                if (!session.tokens && !publicPaths.includes(pathname)) {
                    await signOut();
                    router.push("/");
                }
            } catch (error) {
                console.error("Session check failed:", error);
                if (!publicPaths.includes(pathname)) {
                    await signOut();
                    router.push("/");
                }
            }
        };

        checkSession();
    }, [pathname, router]);

    return null;
}

