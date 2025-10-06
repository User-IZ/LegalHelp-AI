/*
CODE PHASE 1

import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, documentType } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "vkyc-documents",
      public_id: `${documentType || "doc"}-${Date.now()}`,
    });

    console.log("Uploaded to Cloudinary:", uploadResponse.secure_url);
    return res.status(200).json({ url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
*/



/*
CODE PHASE 2

// pages/api/vkyc/upload-photos.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, documentType } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No file provided" });
    }

    // ✅ Detect PDF by base64 or documentType
    const isPDF =
      image.startsWith("data:application/pdf") ||
      (documentType && documentType.toLowerCase().includes("pdf"));

    // ✅ Upload properly
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: isPDF ? "legal-documents" : "vkyc-documents",
      public_id: `${documentType || "file"}-${Date.now()}`,
      resource_type: isPDF ? "raw" : "image", // 🧠 Force raw for PDFs
      format: isPDF ? "pdf" : undefined,
    });

    console.log("✅ Uploaded to Cloudinary:", uploadResponse.secure_url);

    return res.status(200).json({
      url: uploadResponse.secure_url,
      resourceType: uploadResponse.resource_type,
    });

  } catch (error: any) {
    console.error("❌ Cloudinary upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
*/

// pages/api/vkyc/upload-photos.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const config = {
  api: { bodyParser: { sizeLimit: "20mb" } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, documentType } = req.body;
    if (!image) return res.status(400).json({ error: "No file provided" });

    const isPDF = image.startsWith("data:application/pdf");

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: isPDF ? "legal-documents" : "vkyc-documents",
      public_id: `${documentType || "doc"}-${Date.now()}`,
      resource_type: isPDF ? "raw" : "image", // ✅ Key fix
    });

    console.log("✅ Uploaded to Cloudinary:", uploadResponse.secure_url);

    return res.status(200).json({
      url: uploadResponse.secure_url,
      resourceType: uploadResponse.resource_type,
    });

  } catch (error: any) {
    console.error("❌ Cloudinary upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
