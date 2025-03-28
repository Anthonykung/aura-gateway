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
// @file   azureStorage.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:55 -07:00
*/

import { BlobServiceClient } from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING as string;
if (!connectionString) throw Error('Azure Storage connectionString not found');

// Create a new BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Define container client
const containerClient = blobServiceClient.getContainerClient("aura-audio");

// Upload a blob to the container and allow url access
export async function uploadBlob(blobName: string, blob: Blob) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(blob, { blobHTTPHeaders: { blobContentType: blob.type } });
  console.log(`Uploaded blob ${blobName}`);
}

// Download a blob from the container
export async function downloadBlob(blobName: string) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);
  const blob = await downloadBlockBlobResponse.blobBody;
  console.log(`Downloaded blob ${blobName}`);

  return blob;
}

// Generate a SAS url for the blob and the access URL
export async function generateSasUrl(blobName: string) {
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const sasUrl = await blockBlobClient.generateSasUrl({
    permissions: {
      add: false,
      create: false,
      delete: false,
      deleteVersion: false,
      execute: false,
      move: false,
      permanentDelete: false,
      read: true,
      setImmutabilityPolicy: false,
      tag: false,
      write: false,
    },
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + 43200),  // 12 hours
  });

  return sasUrl;
}