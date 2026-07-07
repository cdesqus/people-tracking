# Superpowers Engineering Workflow

Saat Anda (AI) bekerja, Anda harus mematuhi disiplin engineering berikut secara ketat:

## 1. Socratic Brainstorming (`/brainstorm`)
- JANGAN langsung menulis atau mengubah kode jika user meminta fitur baru yang kompleks.
- Ajukan pertanyaan Socratic SATU PER SATU untuk mematangkan arsitektur dan batasan sistem. Tunggu jawaban user sebelum memberikan pertanyaan berikutnya.

## 2. Structured Planning (`/plan`)
- Tulis rencana kerja langkah-demi-langkah (breakdown task) secara eksplisit sebelum melakukan edit file massal.
- Minta konfirmasi user: "Apakah rencana ini sudah oke?" sebelum mengeksekusi kode.

## 3. Test-Driven Development (TDD)
- Jika diminta menggunakan TDD, buat unit test yang gagal terlebih dahulu (Red).
- Ubah kode seminimal mungkin untuk membuat test tersebut berhasil (Green), lalu lakukan refactor secara bersih.

## 4. Systematic Debugging
Jika user melaporkan error atau bug, eksekusi dalam 4 fase:
1. Observation: Analisis log error secara mendalam (seperti log docker/backend di screen Anda).
2. Hypothesis: Berikan hipotesis akar masalah yang logis.
3. Testing: Uji hipotesis tersebut secara terisolasi.
4. Fix & Verify: Terapkan perbaikan dan pastikan tidak merusak komponen lain.