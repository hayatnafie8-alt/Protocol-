/**
 * Instant Telegram Bot Integration for Dr. Hayat Nafee Dental Application
 * Sends formatted subscription requests and receipt screenshots directly to Admin Telegram
 */

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface TelegramSubscriptionNotificationPayload {
  fullName: string;
  email: string;
  academicStage: string;
  university: string;
  amount: string; // '7,000 د.ع' | '10,000 د.ع' | 'كود مجاني'
  promoCode?: string;
  receiptFile?: File | null;
  receiptDataUrl?: string | null;
  receiptUrl?: string | null;
  notes?: string;
}

const STORAGE_BOT_TOKEN_KEY = 'dental_telegram_bot_token';
const STORAGE_CHAT_ID_KEY = 'dental_telegram_chat_id';

// Default / fallback credentials if not customized yet
export const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '8092847291:AAH8F2y7hL4bJ-exampleToken',
  chatId: '@hay_a_2', // Dr. Hayat's Telegram channel or admin chat ID
};

export function getLocalTelegramConfig(): TelegramConfig {
  const token = localStorage.getItem(STORAGE_BOT_TOKEN_KEY) || '';
  const chatId = localStorage.getItem(STORAGE_CHAT_ID_KEY) || '';
  return {
    botToken: token.trim(),
    chatId: chatId.trim(),
  };
}

export function saveLocalTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_BOT_TOKEN_KEY, config.botToken.trim());
    localStorage.setItem(STORAGE_CHAT_ID_KEY, config.chatId.trim());
  } catch (e) {
    console.error('Failed to save telegram config:', e);
  }
}

/**
 * Convert base64 data URL to Blob
 */
function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Send structured Telegram Notification via Telegram Bot API
 */
export async function sendSubscriptionToTelegram(
  payload: TelegramSubscriptionNotificationPayload,
  customConfig?: Partial<TelegramConfig>
): Promise<{ success: boolean; message: string }> {
  const localConfig = getLocalTelegramConfig();
  const botToken = customConfig?.botToken?.trim() || localConfig.botToken || '';
  const chatId = customConfig?.chatId?.trim() || localConfig.chatId || '';

  const formattedCaption = `🚨 <b>طلب اشتراك جديد في بروتوكول PROTOCOL</b> 💳

👤 <b>الطالب:</b> ${payload.fullName || 'طالب طب أسنان'}
✉️ <b>البريد الإلكتروني:</b> ${payload.email}
🎓 <b>المرحلة والجامعة:</b> ${payload.academicStage || 'غير محدد'} - ${payload.university || 'غير محدد'}
💰 <b>المبلغ المطلوب:</b> ${payload.amount}
🎟️ <b>الكود المستعمل:</b> ${payload.promoCode?.trim() ? payload.promoCode.trim().toUpperCase() : 'لا يوجد'}
⏰ <b>وقت الطلب:</b> ${new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })}
${payload.notes ? `📝 <b>ملاحظات إضافية:</b> ${payload.notes}\n` : ''}🧾 <b>مرفق صورة الإيصال:</b> تم إرفاق لقطة شاشة التحويل أعلاه.

⚡ <i>لتأكيد وتفعيل الاشتراك فوراً: قم بالدخول للوحة إشراف التطبيق واضغط على "تأكيد وتفعيل الاشتراك ⚡".</i>`;

  // If no bot token is set yet, log the structured notification payload
  if (!botToken || !chatId) {
    console.log('[Telegram Integration] Telegram Bot token or Chat ID is not configured yet. Payload:', {
      fullName: payload.fullName,
      email: payload.email,
      academicStage: payload.academicStage,
      university: payload.university,
      amount: payload.amount,
      promoCode: payload.promoCode,
    });
    return {
      success: true,
      message: 'تم تسجيل الطلب سحابياً (يرجى ضبط توكن بوت تليجرام في لوحة الإشراف لتلقي الإشعارات مباشرة على التيليجرام).',
    };
  }

  try {
    // 1. Try sending as Photo if receipt exists
    let photoBlob: Blob | null = null;

    if (payload.receiptFile) {
      photoBlob = payload.receiptFile;
    } else if (payload.receiptDataUrl && payload.receiptDataUrl.startsWith('data:')) {
      try {
        photoBlob = dataURLtoBlob(payload.receiptDataUrl);
      } catch (err) {
        console.warn('Could not convert dataURL to Blob for Telegram:', err);
      }
    }

    if (photoBlob) {
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('photo', photoBlob, 'receipt.jpg');
      formData.append('caption', formattedCaption);
      formData.append('parse_mode', 'HTML');

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });

      const resData = await response.json();
      if (resData.ok) {
        return { success: true, message: 'تم إرسال إشعار تليجرام مع صورة الإيصال بنجاح! 📲' };
      }
      console.warn('Telegram sendPhoto response not ok:', resData);
    }

    // 2. Fallback to sendMessage if photo upload wasn't used or failed
    const messageResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedCaption + (payload.receiptUrl ? `\n🔗 <b>رابط الإيصال السحابي:</b> ${payload.receiptUrl}` : ''),
        parse_mode: 'HTML',
      }),
    });

    const msgData = await messageResponse.json();
    if (msgData.ok) {
      return { success: true, message: 'تم إرسال رسالة تليجرام بنجاح! 📲' };
    }

    console.warn('Telegram sendMessage response:', msgData);
    return { success: false, message: msgData.description || 'حدث خطأ في استجابة تليجرام.' };
  } catch (error: any) {
    console.warn('[Telegram Dispatch Exception]:', error);
    return { success: false, message: error?.message || 'تعذر الاتصال بخادم تليجرام.' };
  }
}

/**
 * Test Telegram bot connection from Admin Dashboard
 */
export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  if (!botToken || !chatId) {
    return { success: false, message: 'يرجى إدخال التوكن ومعرف الشات أولاً.' };
  }

  try {
    const text = `🔔 <b>فحص الاتصال بتطبيق بروتوكول PROTOCOL</b> 🦷✨\n\nتم التحقق من ربط بوت تليجرام بنجاح!\nوقت الفحص: ${new Date().toLocaleTimeString('ar-EG')}`;
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text,
        parse_mode: 'HTML',
      }),
    });
    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'تم إرسال رسالة الاختبار بنجاح إلى تليجرام! 🎉' };
    }
    return { success: false, message: data.description || 'فشل الاتصال مع تليجرام.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'خطأ في الاتصال بالشبكة.' };
  }
}
