<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService
{
    protected string $token;
    protected string $chatId;

    public function __construct()
    {
        $this->token  = config('services.telegram.bot_token');
        $this->chatId = config('services.telegram.chat_id');
    }

    /**
     * Send a plain text message to the configured chat.
     */
    public function send(string $message): void
    {
        if (!$this->token || !$this->chatId) {
            Log::warning('Telegram credentials not configured.');
            return;
        }

        try {
            Http::post("https://api.telegram.org/bot{$this->token}/sendMessage", [
                'chat_id'    => $this->chatId,
                'text'       => $message,
                'parse_mode' => 'HTML',
            ]);
        } catch (\Exception $e) {
            // Log but don't throw — a failed notification shouldn't break the request
            Log::error('Telegram notification failed: ' . $e->getMessage());
        }
    }

    /**
     * Send an overtime request notification.
     */
    public function sendOvertimeNotification(
        string $employeeName,
        string $date,
        ?string $jamMulai,
        ?string $jamSelesai,
        ?string $reason
    ): void {
        $time = $jamMulai && $jamSelesai
            ? "{$jamMulai} - {$jamSelesai}"
            : ($jamMulai ?? '—');

        $message = "🕐 <b>Pengajuan Lembur Baru</b>\n\n"
            . "👤 <b>Karyawan:</b> {$employeeName}\n"
            . "📅 <b>Tanggal:</b> {$date}\n"
            . "⏰ <b>Waktu:</b> {$time}\n"
            . "📝 <b>Alasan:</b> " . ($reason ?: '—');

        $this->send($message);
    }
}