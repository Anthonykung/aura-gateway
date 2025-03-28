
# Copyright (c) 2025 Anthony Kung <hi@anth.dev> (anth.dev)
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @file   Dockerfile
# @author Anthony Kung <hi@anth.dev> (anth.dev)
# @date   Created on March 27 2025, 22:47 -07:00


# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Run Prisma generate
COPY prisma ./prisma
RUN npx prisma generate --no-engine

COPY . .
RUN npm run build

# Final stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install

# Run Prisma generate
COPY prisma ./prisma
RUN npx prisma generate --no-engine

EXPOSE 443
CMD ["node", "dist/discord.js"]