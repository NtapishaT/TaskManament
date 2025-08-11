import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "taskmanagement.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

function ensureCertificateIfNeeded() {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
        const res = child_process.spawnSync('dotnet', [
            'dev-certs',
            'https',
            '--export-path',
            certFilePath,
            '--format',
            'Pem',
            '--no-password',
        ], { stdio: 'inherit' });
        if (res.status !== 0) {
            // Fallback to http dev server
            return;
        }
    }
}

ensureCertificateIfNeeded();

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7242';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '^/api': {
                target,
                secure: false
            },
            '^/weatherforecast': {
                target,
                secure: false
            }
        },
        port: 5173,
        https: fs.existsSync(keyFilePath) && fs.existsSync(certFilePath) ? {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        } : undefined
    }
})
