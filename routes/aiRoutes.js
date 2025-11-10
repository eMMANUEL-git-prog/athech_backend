import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";
import fs from "fs";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message, mode, role, athleteType } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 🧭 Role-based behavior
    let systemPrompt = "";
    if (role === "athlete")
      systemPrompt = "You are a friendly AI athletics coach.";
    if (role === "coach")
      systemPrompt =
        "You are an assistant for managing athletes’ performance data.";
    if (role === "admin")
      systemPrompt =
        "You are an administrative AI that helps manage athletes, camps, and alerts.";

    // 🍎 Diet generation mode
    if (mode === "diet" && athleteType) {
      const prompt = `
      ${systemPrompt}
      Generate a 3-day diet plan for a ${athleteType} athlete in Kenya.
      Include: breakfast, lunch, dinner, and supplements.
      Keep it realistic to local foods (e.g. ugali, sukuma wiki, beans, milk, eggs, chapati).
      Format clearly with short explanations per meal.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // 🧾 Create PDF
      const pdf = new PDFDocument();
      const fileName = `diet-${athleteType}-${Date.now()}.pdf`;
      const filePath = `./generated/${fileName}`;
      const stream = fs.createWriteStream(filePath);
      pdf.pipe(stream);

      pdf
        .fontSize(20)
        .text(`Diet Plan for ${athleteType.toUpperCase()} Athlete`, {
          align: "center",
        });
      pdf.moveDown();
      pdf.fontSize(12).text(text);
      pdf.end();

      stream.on("finish", () => {
        res.json({
          message: "Diet plan generated successfully",
          dietText: text,
          pdfUrl: `http://localhost:5000/api/ai/download/${fileName}`,
        });
      });
      return;
    }

    // 💬 Normal chat mode
    const result = await model.generateContent(`${systemPrompt}\n${message}`);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ message: "AI service error" });
  }
});

// 🧾 Serve generated PDFs
router.get("/download/:fileName", (req, res) => {
  const filePath = `./generated/${req.params.fileName}`;
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

export default router;
