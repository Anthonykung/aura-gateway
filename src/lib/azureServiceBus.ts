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
// @file   azureServiceBus.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:33 -07:00
*/


import type { ServiceBusMessage, ServiceBusMessageBatch } from "@azure/service-bus";
import { ServiceBusClient } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";

// Define the connection string
const connectionString = process.env.AZURE_SERVICE_BUS_CONNECTION_STRING as string;

// Create a Service Bus client using the connection string to the Service Bus namespace
const sbClient = new ServiceBusClient(connectionString);

// Create a sender for the queue
const sender = sbClient.createSender("aura-gateway-sender");

// Create a receiver for the queue
const receiver = sbClient.createReceiver("aura-gateway-receiver");

// Send a message to the queue
export async function sendMessage(message: ServiceBusMessage | ServiceBusMessageBatch) {
  try {
    await sender.sendMessages(message);
    console.log("Sent message:", message);
  }
  catch (error) {
    console.error("Error occurred while sending message:", error);
  }
}

// Subscribe to messages from the queue
export async function subscribeMessage(handleEvent: (message: any) => boolean) {
  try {
    receiver.subscribe({
      processMessage: async (msg) => {
        console.log("Received message:", msg.body);
        const success = handleEvent(JSON.stringify(msg.body));
        if (success) {
          await receiver.completeMessage(msg);
        }
        else {
          await receiver.abandonMessage(msg);
        }
      },
      processError: async (err) => {
        console.error("Error occurred while receiving message:", err);
      },
    }, {
      maxConcurrentCalls: 100,
    });
  }
  catch (error) {
    console.error("Error occurred while subscribing to messages:", error);
  }
}

// Close the connection to the Service Bus namespace
export async function closeConnection() {
  try {
    await sender.close();
    await receiver.close();
    await sbClient.close();
    console.log("Connection to Service Bus namespace closed");
  }
  catch (error) {
    console.error("Error occurred while closing connection:", error);
  }
}