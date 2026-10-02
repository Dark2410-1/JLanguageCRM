import nodemailer from "nodemailer";

// SMTP Sozlamalari (Masalan, Gmail, SendGrid yoki Yandex uchun)
// Agar env da SMTP_HOST bo'lmasa, test uchun Ethereal Email ishlatiladi yoki shunchaki log qilinadi.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // 465 uchun true, 587 uchun false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, token: string) {
  // Haqiqiy hostni topish
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const htmlContent = `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f1015; color: #e2e8f0; border-radius: 16px; border: 1px solid #1a1b23;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #8B5CF6; font-size: 28px; font-weight: bold; margin: 0;">JLanguage</h1>
      <p style="color: #a0aab2; font-size: 14px; margin-top: 5px;">Neo-Tokyo Yapon tili maktabi</p>
    </div>
    
    <div style="background-color: #050505; border: 1px solid #1a1b23; border-radius: 12px; padding: 30px;">
      <h2 style="color: #e2e8f0; font-size: 20px; margin-top: 0;">Parolni tiklash 🔑</h2>
      <p style="color: #a0aab2; font-size: 16px; line-height: 1.6;">
        Siz JLanguage platformasiga kirish parolingizni tiklash bo'yicha so'rov yubordingiz. Agar bu siz bo'lmasangiz, shunchaki bu xatni e'tiborsiz qoldiring.
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #8B5CF6; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; padding: 16px 32px; border-radius: 12px; box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);">
          Parolni tiklash
        </a>
      </div>
      
      <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 0;">
        Bu havola 30 daqiqa davomida amal qiladi.
      </p>
    </div>
  </div>
  `;

  // Haqiqiy SMTP bo'lmaganida log qilib turish
  if (!process.env.SMTP_USER) {
    console.log("==========================================");
    console.log("MOCK EMAIL JONATILDI:");
    console.log("To:", to);
    console.log("Link:", resetLink);
    console.log("==========================================");
    return true; // Mock success
  }

  try {
    const info = await transporter.sendMail({
      from: `"JLanguage Support" <${process.env.SMTP_USER}>`,
      to,
      subject: "JLanguage - Parolni tiklash",
      html: htmlContent,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Email yuborishda xatolik:", error);
    return false;
  }
}
