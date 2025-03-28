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
// @file   discord.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:34 -07:00
*/

import { DiscordWebSocket } from './lib/discordWebSocket';

// Import credentials
const { DISCORD_TOKEN } = process.env;

// Discord API version 10 gateway URL
const gatewayUrl = 'wss://gateway.discord.gg/?v=10&encoding=json';

// Establish a new WebSocket connection
const discordWebSocket = new DiscordWebSocket(gatewayUrl, DISCORD_TOKEN as string);

