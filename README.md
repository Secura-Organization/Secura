# Secura Vault

Secura is an Electron-based secure vault application for managing passwords and sensitive data. It combines **Electron**, **React**, **TypeScript**, **Zustand**, and **Tailwind/Radix UI** to provide a secure, responsive, and user-friendly interface.

---

## Table of Contents

- [Features](#features)  
- [Architecture](#architecture)  
- [Security Model (Important)](#security-model-important)  
- [Getting Started](#getting-started)  
- [Project Structure](#project-structure)  
- [Vault Backend](#vault-backend)  
- [UI Components](#ui-components)  
- [Screens](#screens)  
- [Utilities & Stores](#utilities--stores)  
- [Types](#types)  
- [License](#license)  

---

## Features

- **Secure vault** with AES-256-GCM encryption  
- **Master password** unlock with secure in-memory session (main process)  
- CRUD operations for secrets: add, edit, delete  
- Categorized secrets with search and filter  
- Custom **frameless window** with title bar controls  
- Radix + Tailwind UI primitives (buttons, inputs, switches, modals)  
- Auto-lock, clipboard timeout  
- React Router-based navigation  

---

## Architecture

```mermaid
flowchart LR
  MainProcess["Main Process - Electron"] -->|IPC Channels| VaultModules["Vault Backend"]
  MainProcess -->|Preload Load| Preload["Preload Script"]
  Preload -->|Exposed APIs| Renderer["Renderer Process (React)"]
  Renderer -->|window.vault.*| VaultModules
  Renderer -->|window.electronAPI| MainProcess
```

---

## Security Model (Important)

Secura is designed so that **all encryption/decryption and session key handling happen inside the Electron Main Process**, not inside the renderer.

- The renderer **never receives the raw session key**
- The renderer only calls high-level vault APIs exposed through the preload layer (`window.vault.*`)
- The main process holds the derived key in memory and performs:
  - vault unlock
  - encryption/decryption
  - read/write operations
- The renderer only receives already-decrypted secret data needed for UI rendering

This reduces the attack surface in case the renderer is compromised (XSS, dependency injection, devtools, etc.).

---

## Core flow

1. User enters master password in the renderer
2. Renderer calls `vault.unlock(...)` via preload API
3. Main process invokes `unlockVault(...)`
4. Main process derives and stores the session key **in-memory**
5. Renderer requests secrets through vault APIs
6. Main process decrypts secrets and returns safe data to the renderer → displayed in UI

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- Electron-compatible OS

### Installation

```bash
git clone https://github.com/yourusername/secura.git
cd secura
npm install
```

### Running

```bash
# Start Electron app
npm run dev
```

### Build

```bash
npm run build
npm run package
```

---

## Project Structure

### Main Process

- `src/main/index.ts` – Entry point, creates frameless window, sets up IPC channels for vault operations and window controls, manages app lifecycle.

### Preload

- `src/preload/index.ts` – Bridges main and renderer safely using `contextBridge`.
- `src/preload/index.d.ts` – TypeScript types for `window.electronAPI` and `window.vault`.

### Renderer

- `src/renderer/src/main.tsx` – Entrypoint rendering `<App>` with `HashRouter`.
- `src/renderer/index.html` – HTML scaffold for root div.

---

## Vault Backend

- `crypto.ts` – Key derivation via Argon2id (310k iterations)
- `vaultUnlock.ts` – Initial vault setup & unlock logic
- `vaultStore.ts` – CRUD operations: read, write, encrypt, decrypt secrets

---

## UI Components

### Primitives (`src/renderer/src/components/ui`)

- **Button** – styled with variants (size, intent, disabled, ghost)  
- **Input / Textarea / Label / Select / Switch** – Tailwind + Radix  
- **Icons** – Maps secret type to Lucide icons  
- **Modals & Dialogs**
  - **AddEditSecretModal** – add/edit secret with validation & password strength  
  - **DeleteConfirmDialog** – confirm deletion  
  - **CustomTitleBar** – frameless window controls  
  - **EmptyDetails / SecretDetails** – secret detail views  

### Lists

- **SecretsList** – sidebar with filtering, search, add button  
- **Sidebar** – category navigation + settings + lock vault  
- **VaultLogo** – branding component  

---

## Screens

- **UnlockVault.tsx** – Master password entry, unlock logic  
- **VaultScreen.tsx** – Main vault UI: sidebar, secret list, secret details  
- **SettingsScreen.tsx** – Preferences: auto-lock, clipboard timeout, biometric toggle  

---

## Utilities & Stores

- `utils.ts` – helper functions (e.g., `cn` for classNames)  
- `masterPasswordStore.ts` – Zustand store: vault unlocked state (no raw session key in renderer)  
- `secretTypes.ts` – Maps secret types to human-readable labels  

---

## Types

- `global.d.ts` – Extends global Window with electron & vault  
- `vault.ts` – Core vault types:

| Type           | Description |
|----------------|-------------|
| SecretType     | union of secret categories |
| Secret         | secret object with id, name, value, metadata |
| VaultSettings  | user preferences |
| ViewMode       | 'list' or 'details' |
| Category       | secret filter categories |
