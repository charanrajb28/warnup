import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const key = "AIzaSyAu3F_rtP4RxwdztweQHj5vbdQW8S-G9_U"; // the key provided by the user earlier

async function main() {
  try {
    const ai = new GoogleGenerativeAI(key);
    // Actually the SDK doesn't expose listModels. We can fetch it manually.
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

main();
