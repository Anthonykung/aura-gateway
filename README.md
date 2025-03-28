# Advanced Universal Recreational Activities (AURA) Gateway

**AURA Gateway** is the Discord gateway service for the **Advanced Universal Recreational Activities (AURA)** bot. It acts as a relay between Discord and the AURA Processing API via **Azure Service Bus**.

The gateway receives events from the Discord WebSocket API and forwards them to the AURA Processing API through Azure Service Bus. An Azure Function then relays these events via HTTPS to the AURA API, which processes the logic and sends a response back. The gateway receives this response and forwards it to the Discord client.

## 🧭 Architecture Overview

```
Discord Client
      ⬇
AURA Gateway (this repo)
      ⬇
Azure Service Bus
      ⬇
Azure Function Relay
      ⬇
AURA Processing API
      ⬇
Azure Service Bus
      ⬇
AURA Gateway → Discord Client
```

## ✨ Features

- Listens to Discord Gateway events
- Relays events to the AURA Processing API via Azure Service Bus
- Returns processed responses back to Discord
- Deployable as an **Azure Container App**
- Written in Node.js with modular service structure

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/anthonykung/aura-gateway.git
cd aura-gateway
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in the required credentials such as Discord bot token, Azure Service Bus connection string, etc.

### 3. Install dependencies

```bash
npm install
# or
yarn install
```

### 4. Build the project

```bash
npm run build
# or
yarn build
```

### 5. Start the gateway

```bash
npm start
# or
yarn start
```

> Note: You'll need valid Azure and Discord credentials in `.env` for it to function correctly.

## 🛠 Deployment

This project is deployed using **Azure Container Apps**. You can deploy with a single command:

```bash
./publish.sh
```

The script will:
- Build the container image
- Push to **Azure Container Registry**
- Upload environment secrets
- Deploy the container to **Azure Container Apps**

> Note: You may need to set up Azure Container Apps and Azure Container Registry beforehand.

## 💡 Notes

- 🤖 Some parts of this project were written with the help of **GitHub Copilot VS Code Extension**, so you may encounter code that's unconventional or quirky, but hey it works and it cuts down the development time 😉

- Yes there are more elegant ways to handle the Azure Service Bus connection, but well it's fast and easy so... 🤷‍♂️

- This gateway is designed to be part of a scalable, event-driven ecosystem and relies heavily on Azure and Discord services.

## 📄 License

Licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

---

Thanks for checking out AURA Gateway! 🎮✨