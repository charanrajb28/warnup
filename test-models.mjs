import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyAu3F_rtP4RxwdztweQHj5vbdQW8S-G9_U"; // the key provided by the user earlier

async function main() {
  try {
    new GoogleGenerativeAI(key); // init to ensure SDK loading works
    // Actually the SDK doesn't expose listModels. We can fetch it manually.
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

main();
