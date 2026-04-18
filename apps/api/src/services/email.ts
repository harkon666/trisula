import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Trisula <onboarding@resend.dev>';

export interface VerifyEmailParams {
    email: string;
    fullName: string;
    verificationToken: string;
    baseUrl?: string;
}

export async function sendVerificationEmail({ email, fullName, verificationToken, baseUrl = 'http://localhost:3000' }: VerifyEmailParams) {
    // baseUrl is the FRONTEND URL, not API
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Verifikasi Email Anda - Trisula',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Halo, ${fullName}!</h2>
                <p>Terima kasih telah mendaftar sebagai Agent di Trisula.</p>
                <p>Silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Verifikasi Email
                    </a>
                </div>
                <p>Atau salin dan tempel link ini ke browser Anda:</p>
                <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
                <p style="color: #666; font-size: 12px;">Link ini akan kadaluarsa dalam 24 jam.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">Jika Anda tidak merasa mendaftar di Trisula, abaikan email ini.</p>
            </div>
        `,
    });

    if (error) {
        console.error('[EMAIL SERVICE] Send verification failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('[EMAIL SERVICE] Verification email sent:', data?.id);
    return data;
}
