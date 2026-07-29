import nodemailer from 'nodemailer'

const createTransporter = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const testAccount = await nodemailer.createTestAccount()
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    })
  }
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:   { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  })
}

export const sendEmail = async (opts: { to: string; subject: string; html: string }) => {
  const transporter = await createTransporter()
  const from = process.env.MAIL_FROM || '"JobBoard" <noreply@jobboard.com>'
  const info  = await transporter.sendMail({ from, ...opts })
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n📧 Email Preview →', nodemailer.getTestMessageUrl(info), '\n')
  }
}

const wrap = (body: string) => `
<!DOCTYPE html><html lang="th">
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 20px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
<tr><td style="background:#4f46e5;padding:28px;text-align:center">
  <p style="margin:0;font-size:22px;font-weight:800;color:#fff">JobBoard</p>
</td></tr>
<tr><td style="padding:36px 32px">${body}</td></tr>
<tr><td style="background:#f9fafb;padding:14px 32px;text-align:center">
  <p style="margin:0;font-size:12px;color:#9ca3af">© 2025 JobBoard Thailand</p>
</td></tr>
</table></td></tr></table></body></html>`

const btn = (url: string, label: string) =>
  `<div style="text-align:center;margin:28px 0">
    <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
       padding:13px 30px;border-radius:12px;font-size:15px;font-weight:600">${label}</a>
   </div>`

export const buildVerificationEmail = (name: string, url: string) => ({
  subject: 'ยืนยันอีเมลของคุณ — JobBoard',
  html: wrap(`
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#111827">สวัสดี ${name}! 👋</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6">
      ขอบคุณที่สมัครใช้งาน JobBoard กรุณายืนยันอีเมลของคุณเพื่อเริ่มใช้งาน
    </p>
    ${btn(url, 'ยืนยันอีเมล')}
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center">ลิงก์หมดอายุใน <strong>24 ชั่วโมง</strong></p>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0"/>
    <p style="margin:0;font-size:13px;color:#9ca3af">ถ้าไม่ได้สมัครสมาชิก คุณสามารถเพิกเฉยต่ออีเมลนี้ได้</p>
  `),
})

export const buildPasswordResetEmail = (name: string, url: string) => ({
  subject: 'รีเซ็ตรหัสผ่าน — JobBoard',
  html: wrap(`
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:700;color:#111827">รีเซ็ตรหัสผ่าน</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6">
      สวัสดี ${name}, เราได้รับคำขอรีเซ็ตรหัสผ่านของคุณ กดปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่
    </p>
    ${btn(url, 'รีเซ็ตรหัสผ่าน')}
    <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center">ลิงก์หมดอายุใน <strong>1 ชั่วโมง</strong></p>
    <hr style="border:none;border-top:1px solid #f3f4f6;margin:20px 0"/>
    <p style="margin:0;font-size:13px;color:#9ca3af">ถ้าไม่ได้ขอรีเซ็ต ไม่ต้องทำอะไร รหัสผ่านเดิมยังคงใช้ได้</p>
  `),
})
