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
// @file   azureAudio.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 27 2025, 15:33 -07:00
*/

import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason, CancellationReason } from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = SpeechConfig.fromSubscription(process.env.AZURE_SPEECH_KEY as string, process.env.AZURE_SPEECH_REGION as string);
speechConfig.speechRecognitionLanguage = "en-US";

// Recognize speech from MediaStream
export class SpeechRecognitionService {
  private recognizer: SpeechRecognizer | null = null;
  private audioConfig: AudioConfig;
  private finalResult: string | null = null;
  private interimResult: string | null = null;
  private onRecognizingCallback: ((s: any, e: any) => void) | null = null;

  constructor(options: {
    stream: MediaStream;
  }) {
    this.audioConfig = AudioConfig.fromStreamInput(options.stream);
  }

  public async startRecognition(): Promise<void> {
    if (this.recognizer) {
      console.warn("Recognition already started.");
      return;
    }

    this.recognizer = new SpeechRecognizer(speechConfig, this.audioConfig);

    this.recognizer.recognizing = (s, e) => {
      console.log(`RECOGNIZING: Text=${e.result.text}`);
      this.interimResult = e.result.text;
    };

    // this.recognizer.recognized = (s, e) => {
    //   if (e.result.reason === ResultReason.RecognizedSpeech) {
    //     console.log(`RECOGNIZED: Text=${e.result.text}`);
    //     this.finalResult = e.result.text;
    //   } else if (e.result.reason === ResultReason.NoMatch) {
    //     console.log("NOMATCH: Speech could not be recognized.");
    //   }
    // };

    // Bind a callback to the recognizer's recognized event
    this.recognizer.recognized.bind(this.onRecognizingCallback);

    this.recognizer.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`);

      if (e.reason === CancellationReason.Error) {
        console.log(`CANCELED: ErrorCode=${e.errorCode}`);
        console.log(`CANCELED: ErrorDetails=${e.errorDetails}`);
      }

      this.stopRecognition();
    };

    this.recognizer.sessionStopped = (s, e) => {
      console.log("Session stopped event.");
      this.stopRecognition();
    };

    await new Promise<void>((resolve, reject) => {
      this.recognizer!.startContinuousRecognitionAsync(resolve, reject);
    });
  }

  public async stopRecognition(): Promise<void> {
    if (!this.recognizer) {
      console.warn("No active recognition to stop.");
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.recognizer!.stopContinuousRecognitionAsync(() => {
        console.log("Recognition stopped.");
        this.recognizer = null;
        resolve();
      }, reject);
    });
  }

  public getFinalResult(): string | null {
    return this.finalResult;
  }

  public getInterimResult(): string | null {
    return this.interimResult;
  }

  // Bind a callback to the recognizer's recognizing event
  public onRecognizing(callback: (text: string) => void): void {
    this.onRecognizingCallback = (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`);
        this.finalResult = e.result.text;
        callback(e.result.text);
      } else if (e.result.reason === ResultReason.NoMatch) {
        console.log("NOMATCH: Speech could not be recognized.");
      }
    };
  }
}