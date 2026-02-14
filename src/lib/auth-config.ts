import { ResourcesConfig } from 'aws-amplify';

const domain = process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN || "us-east-1k6ijg6zrw.auth.us-east-1.amazoncognito.com";
const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const clientId = process.env.NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID || "38attuf7obuhqfaui2fe9br5j5";
const userPoolId = process.env.NEXT_PUBLIC_AWS_COGNITO_POOL_ID || "us-east-1_k6IJg6zRW";

export const authConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId,
            userPoolClientId: clientId,
            loginWith: {
                oauth: {
                    domain,
                    scopes: ['email', 'openid', 'profile'],
                    redirectSignIn: [`${redirectUrl}/`],
                    redirectSignOut: [`${redirectUrl}/`],
                    responseType: 'code'
                }
            }
        }
    }
};