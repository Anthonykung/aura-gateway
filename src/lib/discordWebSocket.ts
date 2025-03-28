/*
// Copyright (c) 2025 Anthony Kung <hi@anth.dev> (anth.dev)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @file   discordWebSocket.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:33 -07:00
*/

import WebSocket from 'ws';
import { sendMessage, subscribeMessage } from './azureServiceBus';

export class DiscordWebSocket {
  private discord: WebSocket | null = null;
  private sessionId: string | null = null;
  private sequenceNumber: number | null = null;
  private reconnectionAttempts = 0;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private connectionStatus = false;

  constructor(
    private url: string,
    private token: string,
    private intents = (1 << 0) | (1 << 1) | (1 << 9) | (1 << 10) | (1 << 12) | (1 << 13) | (1 << 15),
    private reconnectionUrl: string | null = null
  ) {
    subscribeMessage(this.sendResponse.bind(this));
    this.connect();
  }

  private connect() {
    if (this.reconnectionUrl && ++this.reconnectionAttempts > 5) {
      console.error('Failed to reconnect after 5 attempts');
      this.resetReconnection();
      return;
    }

    this.discord = new WebSocket(this.reconnectionUrl || this.url);
    this.discord.on('open', this.onOpen.bind(this));
    this.discord.on('message', this.onMessage.bind(this));
    this.discord.on('close', this.onClose.bind(this));
    this.discord.on('error', this.onError.bind(this));
  }

  private onOpen() {
    console.log('Connected to Discord Gateway');
    this.connectionStatus = true;
    const payload = this.reconnectionUrl
      ? { op: 6, d: { token: this.token, session_id: this.sessionId, seq: this.sequenceNumber } }
      : {
          op: 2,
          d: {
            token: this.token,
            intents: this.intents,
            shard: [0, 1],
            properties: { os: 'linux', browser: 'anthonian', device: 'anthonian' },
            presence: { activities: [{ name: "ASCA Initiative", type: 0 }], afk: false },
          },
        };
    this.discord?.send(JSON.stringify(payload));
  }

  private onMessage(data: string) {
    const payload = JSON.parse(data);
    console.log('Received payload:', payload);
    sendMessage({ body: { op: payload.op, d: payload.d, s: payload.s, t: payload.t } });

    if (payload.op === 10) this.setupHeartbeat(payload.d.heartbeat_interval);
    else if (payload.op === 11) console.log('Heartbeat ACK received');
    else if (payload.op === 9) this.handleInvalidSession(payload.d);
    else if (payload.op === 7) this.discord?.close();
    else if (payload.op === 0) this.sequenceNumber = payload.s;
  }

  private setupHeartbeat(interval: number) {
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    this.reconnectInterval = setInterval(() => {
      this.discord?.send(JSON.stringify({ op: 1, d: null }));
    }, interval);
  }

  private handleInvalidSession(resumable: boolean) {
    console.log('Invalid Session, re-identifying');
    if (!resumable) this.reconnectionUrl = null;
    this.discord?.close();
  }

  private sendResponse(data: string) {
    try {
      const payload = JSON.parse(data);
      console.log('Sending response:', payload);
      if (payload.success) {
        this.discord?.send(payload.body);
        return true;
      }
      console.error('Failed to send response:', payload.body);
      return false;
    } catch (error) {
      console.error('Failed to send response:', error);
      return false;
    }
  }

  private onClose() {
    console.log('Disconnected from Discord Gateway');
    this.connectionStatus = false;
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    this.connect();
  }

  private onError(error: Error) {
    console.error('WebSocket error:', error);
    this.discord?.close();
  }

  private resetReconnection() {
    this.reconnectionUrl = null;
    this.reconnectionAttempts = 0;
  }

  public getConnectionStatus() {
    return this.connectionStatus;
  }
}