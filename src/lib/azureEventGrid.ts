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
// @file   azureEventGrid.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:33 -07:00
*/


import { EventGridPublisherClient, AzureKeyCredential } from "@azure/eventgrid";

// Create a new Event Grid client
export const EventGridClient = new EventGridPublisherClient(process.env.EVENT_GRID_ENDPOINT as string, "EventGrid", new AzureKeyCredential(process.env.EVENT_GRID_KEY as string));

// Send an event to Event Grid
export async function sendEvent({
  subject,
  data,
  dataVersion = "1.0",
}: {
  subject: string,
  data: any,
  dataVersion?: string
}) {
  await EventGridClient.send([{
    eventType: "ASCA.AURA.GATEWAY",
    subject: `asca/aura/gateway/${subject}`,
    dataVersion: dataVersion,
    data: data,
  }]);
}