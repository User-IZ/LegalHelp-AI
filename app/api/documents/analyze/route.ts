// app/api/documents/analyze/route.ts
/*import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractPDFText, extractPDFTextAdvanced, extractPDFWithOCR } from '@/lib/pdfExtractor';

export const runtime = 'nodejs';

type RequestBody = {
  fileContent?: string;
  fileName?: string;
  apiKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { fileContent, fileName = 'uploaded.pdf', apiKey } = body;

    if (!fileContent || !apiKey) {
      return NextResponse.json({ error: 'File content and API key are required' }, { status: 400 });
    }

    // Handle "data:application/pdf;base64,..." or raw base64
    const base64 = fileContent.includes(',') ? fileContent.split(',')[1] : fileContent;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid base64 file content' }, { status: 400 });
    }

    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'Empty PDF file received' }, { status: 400 });
    }

    const maxBytes = 20 * 1024 * 1024;
    if (arrayBuffer.byteLength > maxBytes) {
      return NextResponse.json({ error: 'File too large. Maximum allowed is 20MB.' }, { status: 400 });
    }

    // Check header
    const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5));
    const pdfHeader = String.fromCharCode(...headerBytes);
    if (!pdfHeader.startsWith('%PDF')) {
      return NextResponse.json({ error: 'File is not a valid PDF document' }, { status: 400 });
    }

    console.log('Processing PDF file:', fileName);

    let documentText = '';

    // Step 1: simple
    documentText = await extractPDFText(arrayBuffer as ArrayBuffer);

    // Step 2: advanced
    if (!documentText || documentText.length < 50 || documentText.includes('No readable text found')) {
      console.log('Simple extraction failed, trying advanced...');
      try {
        documentText = await extractPDFTextAdvanced(arrayBuffer as ArrayBuffer);
      } catch (e) {
        console.warn('Advanced extraction failed:', e);
      }
    }

    // Step 3: OCR
    if (!documentText || documentText.length < 50) {
      console.log('Advanced extraction also failed, trying OCR...');
      try {
        documentText = await extractPDFWithOCR(
            buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
        );

      } catch (e) {
        console.warn('OCR extraction failed:', e);
      }
    }

    if (!documentText || documentText.trim().length < 10) {
      return NextResponse.json({
        error:
          'No readable text found in the PDF. The file may be a scanned/image PDF that requires OCR. Please provide a text-based PDF or ensure OCR is enabled.',
      }, { status: 400 });
    }

    // Truncate if too long
    const maxChars = 120_000;
    if (documentText.length > maxChars) {
      console.warn(`Truncating document text from ${documentText.length} to ${maxChars} chars`);
      documentText = documentText.slice(0, maxChars);
    }

    const analysisPrompt = `You are a professional legal document analyzer. Please analyze the following document and provide a comprehensive legal analysis.

DOCUMENT CONTENT:
${documentText}

Please provide your analysis in JSON format:
{
  "documentType": "...",
  "summary": "...",
  "keyPoints": ["..."],
  "legalConcerns": ["..."],
  "recommendations": ["..."]
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(analysisPrompt);
    const aiText = result?.response?.text?.();

    if (!aiText) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
    }

    try {
      const cleaned = aiText.replace(/```json\s*|```/g, '').trim();
      const analysis = JSON.parse(cleaned);
      return NextResponse.json({
        analysis: {
          documentType: analysis.documentType || 'Legal Document',
          summary: analysis.summary || 'Analysis complete.',
          keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
          legalConcerns: Array.isArray(analysis.legalConcerns) ? analysis.legalConcerns : [],
          recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        },
      });
    } catch (err) {
      console.error('AI JSON parse error:', err);
      return NextResponse.json({
        analysis: {
          documentType: 'Legal Document',
          summary: 'AI output could not be parsed as JSON.',
          keyPoints: ['Document processed'],
          legalConcerns: ['Manual review recommended'],
          recommendations: ['Check raw AI output'],
          rawAIResponsePreview: aiText.slice(0, 250),
        },
      });
    }
  } catch (error: any) {
    console.error('Document analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze document' }, { status: 500 });
  }
}
*/


/*

// app/api/documents/analyze/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

type RequestBody = {
  fileContent?: string; // base64 encoded PDF
  fileName?: string;
  apiKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { fileContent, fileName = "uploaded.pdf", apiKey } = body;

    if (!fileContent || !apiKey) {
      return NextResponse.json(
        { error: "File content and API key are required" },
        { status: 400 }
      );
    }

    // Handle "data:application/pdf;base64,..." or raw base64
    const base64 = fileContent.includes(",")
      ? fileContent.split(",")[1]
      : fileContent;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, "base64");
    } catch {
      return NextResponse.json(
        { error: "Invalid base64 file content" },
        { status: 400 }
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Empty PDF file received" },
        { status: 400 }
      );
    }

    const maxBytes = 20 * 1024 * 1024; // 20 MB
    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed is 20MB." },
        { status: 400 }
      );
    }

    // 🔹 Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    // 🔹 Ask Gemini to analyze the PDF directly
    const prompt = `You are a professional legal document analyzer. 
Please analyze this PDF and provide a structured JSON response with:
{
  "documentType": "...",
  "summary": "...",
  "keyPoints": ["..."],
  "legalConcerns": ["..."],
  "recommendations": ["..."]
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: buffer.toString("base64"),
        },
      },
      { text: prompt },
    ]);

    const aiText = result.response.text();

    // 🔹 Try parsing Gemini’s output as JSON
    try {
      const cleaned = aiText.replace(/```json\s*|```/g, "").trim();
      const analysis = JSON.parse(cleaned);
      return NextResponse.json({
        analysis: {
          documentType: analysis.documentType || "Legal Document",
          summary: analysis.summary || "Analysis complete.",
          keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
          legalConcerns: Array.isArray(analysis.legalConcerns)
            ? analysis.legalConcerns
            : [],
          recommendations: Array.isArray(analysis.recommendations)
            ? analysis.recommendations
            : [],
        },
      });
    } catch (err) {
      console.warn("AI JSON parse error:", err);
      return NextResponse.json({
        analysis: {
          documentType: "Legal Document",
          summary: "AI output could not be parsed as JSON.",
          keyPoints: ["Document processed"],
          legalConcerns: ["Manual review recommended"],
          recommendations: ["Check raw AI output"],
          rawAIResponsePreview: aiText.slice(0, 250),
        },
      });
    }
  } catch (error: any) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze document" },
      { status: 500 }
    );
  }
}
*/


import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

type RequestBody = {
  fileContent?: string; // base64 encoded PDF
  fileName?: string;
  apiKey?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    const { fileContent, fileName = "uploaded.pdf", apiKey } = body;

    if (!fileContent || !apiKey) {
      return NextResponse.json(
        { error: "File content and API key are required" },
        { status: 400 }
      );
    }

    // Handle "data:application/pdf;base64,..." or raw base64
    const base64 = fileContent.includes(",")
      ? fileContent.split(",")[1]
      : fileContent;

    let buffer: Buffer;
    try {
      buffer = Buffer.from(base64, "base64");
    } catch {
      return NextResponse.json(
        { error: "Invalid base64 file content" },
        { status: 400 }
      );
    }

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Empty PDF file received" },
        { status: 400 }
      );
    }

    const maxBytes = 20 * 1024 * 1024; // 20 MB
    if (buffer.length > maxBytes) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed is 20MB." },
        { status: 400 }
      );
    }

    // ✅ Initialize Gemini 2.5 Flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });

    // ✅ Simplified + Human-friendly Legal Prompt
    const prompt = `
You are a helpful legal assistant. Your task is to read and explain the attached PDF 
in clear and everyday English so that a normal person with no legal background 
can easily understand it.

Please analyze the PDF and respond only in the following JSON format (no extra text):

{
  "documentType": "Type of document (for example: court judgment, agreement, contract, or notice)",
  "summary": "Summarize what this document is about in simple English — who is involved, what happened, and what was decided or agreed upon.",
  "keyPoints": [
    "List 5-12 main points in plain English, keeping sentences short and clear.",
    "Avoid legal words like 'herein', 'thereof', 'petitioners', etc."
  ],
  "legalConcerns": [
    There must be atleast 4 points "If there are any issues or problems, explain them simply — what might go wrong or what one should be careful about."
  ],
  "recommendations": [
    "Give practical next steps or advice to the accused as well as other party — for example, what someone should do next or watch out for or how can a person get out from that situation"
  ]
}

Guidelines:
- Use **clear, natural, conversational English** (like explaining to a friend but little in detail).
- If giving formal language give in new point and explain it in simple words (eg- Section 420: cheating and dishonestly done by person)
- Don’t add disclaimers or unnecessary introductions.
- Output must be valid JSON only.
`;

    // ✅ Send both the PDF and the prompt
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: buffer.toString("base64"),
        },
      },
      { text: prompt },
    ]);

    const aiText = result.response.text();

    try {
      const cleaned = aiText.replace(/```json\s*|```/g, "").trim();
      const analysis = JSON.parse(cleaned);
      return NextResponse.json({
        analysis: {
          documentType: analysis.documentType || "Legal Document",
          summary: analysis.summary || "Analysis complete.",
          keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
          legalConcerns: Array.isArray(analysis.legalConcerns)
            ? analysis.legalConcerns
            : [],
          recommendations: Array.isArray(analysis.recommendations)
            ? analysis.recommendations
            : [],
        },
      });
    } catch (err) {
      console.warn("AI JSON parse error:", err);
      return NextResponse.json({
        analysis: {
          documentType: "Legal Document",
          summary: "AI output could not be parsed as JSON.",
          keyPoints: ["Document processed"],
          legalConcerns: ["Manual review recommended"],
          recommendations: ["Check raw AI output"],
          rawAIResponsePreview: aiText.slice(0, 250),
        },
      });
    }
  } catch (error: any) {
    console.error("Document analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze document" },
      { status: 500 }
    );
  }
}