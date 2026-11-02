<?php

namespace App\Http\Requests\Concerns;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Mengganti pesan generik "failed to upload" dengan pesan spesifik
 * berdasarkan kode error PHP, sekaligus mencatatnya ke log.
 *
 * Latar: Validator Laravel (Validator.php) memetakan SEMUA kegagalan
 * upload (UPLOAD_ERR_INI_SIZE, PARTIAL, NO_TMP_DIR, CANT_WRITE, ...)
 * ke satu rule `uploaded`. Tanpa pemetaan ini, file 8 KB yang gagal
 * karena upload terputus pun dilaporkan seolah "melebihi batas".
 */
trait ReportsCoverUploadErrors
{
    /**
     * @throws ValidationException
     */
    protected function failedValidation(Validator $validator): void
    {
        $file = $this->file('cover_image');

        if ($file instanceof UploadedFile && ! $file->isValid()
            && $validator->errors()->has('cover_image')) {
            Log::warning('Cover image upload failed.', [
                'error' => $file->getError(),
                'error_message' => $file->getErrorMessage(),
                'client_name' => $file->getClientOriginalName(),
                'client_mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'user_id' => $this->user()?->id,
                'path' => $this->path(),
            ]);

            $errors = $validator->errors();
            $errors->forget('cover_image');
            $errors->add('cover_image', $this->coverUploadErrorMessage($file->getError()));
        }

        parent::failedValidation($validator);
    }

    private function coverUploadErrorMessage(int $error): string
    {
        return match ($error) {
            UPLOAD_ERR_INI_SIZE => 'Gambar sampul melebihi batas upload server.',
            UPLOAD_ERR_FORM_SIZE => 'Gambar sampul melebihi batas ukuran form.',
            UPLOAD_ERR_PARTIAL => 'Gambar sampul terputus saat diunggah. Silakan coba lagi.',
            UPLOAD_ERR_NO_FILE => 'Gambar sampul tidak terkirim. Silakan pilih ulang filenya.',
            UPLOAD_ERR_NO_TMP_DIR => 'Server tidak dapat menampung unggahan (folder temporary hilang). Hubungi admin.',
            UPLOAD_ERR_CANT_WRITE => 'Server gagal menyimpan berkas unggahan. Hubungi admin.',
            UPLOAD_ERR_EXTENSION => 'Unggahan dihentikan oleh ekstensi PHP di server. Hubungi admin.',
            default => 'Gambar sampul gagal diunggah.',
        };
    }
}
