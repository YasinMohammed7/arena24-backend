import { Injectable } from '@nestjs/common';
import * as Pusher from 'pusher';

@Injectable()
export class SmsService {
  private pusher: Pusher;

  constructor() {
    this.pusher = new Pusher({
      appId: '648333',
      key: '18zpxt4lp7bzwhnzrjck',
      secret: 'dff0faphetf6pdolte9c',
      cluster: 'mt1',
      useTLS: true,
      host: 'lzf.ro',
    });
  }

  async sendVerificationCode(contact: string, code: string) {
    const url = process.env.MOBILE_API_BASE_URL;
    const apiKey = process.env.MOBILE_API_KEY;
    if (!url) throw new Error("MOBILE_API_BASE_URL missing");
    if (!apiKey) throw new Error("MOBILE_API_KEY missing");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          phone_number: contact,
          message: `Your verification code is: ${code}`,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`SMS API error ${res.status}: ${text}`);
      }

      const data = await res.json().catch(() => ({}));
      return data;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw error;
    }
  }
}