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
// @file   azure.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:33 -07:00
*/

import { isUnexpected } from "@azure-rest/ai-content-safety";
import { AzureKeyCredential } from "@azure/core-auth";
import * as ContentSafety from "@azure-rest/ai-content-safety";

const ContentSafetyClient = ContentSafety.default;

// Get endpoint and key from environment variables
const endpoint = process.env.AZURE_CONTENT_SAFETY_ENDPOINT;
const key = process.env.AZURE_CONTENT_SAFETY_KEY_PRIMARY;

const credential = new AzureKeyCredential(key as string);
const client = ContentSafetyClient(endpoint as string, credential);

if (!endpoint || !key) {
  throw new Error("Missing AZURE_CONTENT_SAFETY_ENDPOINT or AZURE_CONTENT_SAFETY_KEY_PRIMARY environment variables");
}

export async function azureContentSafety({
  text,
  image,
} : {
  text?: string;
  image?: string;
}) {
  if (text) {
    const analyzeTextOption = { text };
    const analyzeTextParameters = { body: analyzeTextOption };

    const result = await client.path("/text:analyze").post(analyzeTextParameters);

    if (isUnexpected(result)) {
      throw new Error("Unexpected response from API");
    }

    result.body.categoriesAnalysis.forEach((analysis) => {
      console.log(`${analysis.category} severity: ${analysis.severity}`);
    });

    // Return if severity is high
    if (result.body.categoriesAnalysis.some((analysis) => {
      if (analysis.severity) {
        return (analysis.severity >= 4);
      }
    })) {
      return true;
    }
    else {
      return false;
    }
  }
  else if (image) {
    // Download image from URL
    const response = await fetch(image);
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const base64Image = imageBuffer.toString("base64");
    const analyzeImageOption = { image: { content: base64Image } };
    const analyzeImageParameters = { body: analyzeImageOption };

    const result = await client.path("/image:analyze").post(analyzeImageParameters);

    if (isUnexpected(result)) {
      throw result;
    }
    for (let i = 0; i < result.body.categoriesAnalysis.length; i++) {
      const imageCategoriesAnalysisOutput = result.body.categoriesAnalysis[i];
      console.log(
        imageCategoriesAnalysisOutput.category,
        " severity: ",
        imageCategoriesAnalysisOutput.severity
      );
    }

    // Return if severity is high
    if (result.body.categoriesAnalysis.some((analysis) => {
      if (analysis.severity) {
        return (analysis.severity >= 4);
      }
    })) {
      return true;
    }
    else {
      return false;
    }
  }
}