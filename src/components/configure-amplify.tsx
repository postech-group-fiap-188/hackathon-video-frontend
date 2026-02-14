"use client";

import { authConfig } from "@/lib/auth-config";
import { Amplify } from 'aws-amplify';


Amplify.configure(authConfig, { ssr: false });

export default function ConfigureAmplifyClientSide() {
    return null;
}
