"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Step = {
  id: number;
  label: string;
  icon: string;
};

type MoodOption = {
  value: string;
  label: string;
  emoji: string;
};

interface FormState {
  nama: string;
  usia: string;
  jenisKelamin: string;
  statusPernikahan: string;
  pekerjaan: string;
  domisili: string;
  keluhanUtama: string[];
  keluhanLainnya: string;
  durasiKeluhan: string;
  intensitas: number;
  pernahKonsultasi: string;
  riwayatTerapi: string;
  riwayatMedis: string;
  konsumsiObat: string;
  namaObat: string;
  riwayatKeluarga: string;
  mood: string;
  polaTidur: string;
  jamTidur: number;
  nafsuMakan: string;
  aktivitasSosial: string;
  deskripsi: string;
  tujuan: string;
  harapan: string;
  preferensi: string;
  tambahan: string;
}

type UpdateForm = <K extends keyof FormState>(
  field: K,
  value: FormState[K],
) => void;

type StepProps = {
  data: FormState;
  update: UpdateForm;
};

type Step2Props = StepProps & {
  toggleKeluhan: (item: string) => void;
};

type LabelProps = {
  children: React.ReactNode;
  required?: boolean;
};

type FieldProps = {
  label: string;
  required?: boolean;
  children: React.ReactNode;
};

type PillRadioProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

type SectionHeaderProps = {
  badge: string;
  title: string;
  desc: string;
};

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;
type SelectInputProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  children: React.ReactNode;
};
type TextareaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const STEPS: Step[] = [
  { id: 1, label: "Data Diri", icon: "👤" },
  { id: 2, label: "Keluhan", icon: "💬" },
  { id: 3, label: "Riwayat", icon: "📋" },
  { id: 4, label: "Kondisi Kini", icon: "🧠" },
  { id: 5, label: "Harapan", icon: "✨" },
];

const KELUHAN_LIST = [
  "Kecemasan / Anxiety",
  "Depresi / Sedih berkepanjangan",
  "Stres berlebihan",
  "Masalah tidur (insomnia)",
  "Trauma masa lalu",
  "Masalah hubungan / relasi",
  "Masalah keluarga",
  "Masalah pekerjaan / karier",
  "Krisis identitas diri",
  "Fobia atau ketakutan tertentu",
  "Gangguan makan",
  "Kecanduan (gadget, substansi, dll)",
  "Pikiran menyakiti diri sendiri",
  "Kesulitan konsentrasi",
  "Lainnya",
];

const DURASI_LIST = [
  "Kurang dari 1 minggu",
  "1 – 4 minggu",
  "1 – 3 bulan",
  "3 – 6 bulan",
  "Lebih dari 6 bulan",
  "Lebih dari 1 tahun",
];

const MOOD_LIST: MoodOption[] = [
  { value: "sangat_buruk", label: "Sangat Buruk", emoji: "😞" },
  { value: "buruk", label: "Buruk", emoji: "😔" },
  { value: "biasa", label: "Biasa Saja", emoji: "😐" },
  { value: "baik", label: "Baik", emoji: "🙂" },
  { value: "sangat_baik", label: "Sangat Baik", emoji: "😊" },
];

// ─── Atomic UI ────────────────────────────────────────────────────────────────

function Label({ children, required }: LabelProps) {
  return (
    <label className="block text-sm font-bold text-blue-900 mb-2">
      {children}
      {required && <span className="text-orange-500 ml-1">*</span>}
    </label>
  );
}

function TextInput({ ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm bg-white
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        transition-all placeholder:text-gray-400"
    />
  );
}

function SelectInput({ children, ...props }: SelectInputProps) {
  return (
    <select
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm bg-white
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        transition-all cursor-pointer"
    >
      {children}
    </select>
  );
}

function TextareaInput({ ...props }: TextareaInputProps) {
  return (
    <textarea
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-800 text-sm bg-white
        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        transition-all placeholder:text-gray-400 resize-none leading-relaxed"
    />
  );
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div className="mb-5">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}

function PillRadio({ options, value, onChange }: PillRadioProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 active:scale-95
            ${
              value === opt
                ? "bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-200"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-900"
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({ badge, title, desc }: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <span className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
        {badge}
      </span>
      <h2 className="text-3xl font-black text-blue-900 tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-lg">{desc}</p>
    </div>
  );
}

// ─── Step Panels ─────────────────────────────────────────────────────────────

function Step1({ data, update }: StepProps) {
  return (
    <div>
      <SectionHeader
        badge="Langkah 1 dari 5"
        title="Data Diri"
        desc="Informasi ini bersifat rahasia dan hanya digunakan untuk keperluan konsultasi."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Field label="Nama Lengkap" required>
          <TextInput
            placeholder="Masukkan nama lengkap"
            value={data.nama}
            onChange={(e) => update("nama", e.target.value)}
          />
        </Field>
        <Field label="Usia" required>
          <TextInput
            type="number"
            placeholder="Contoh: 24"
            min="10"
            max="100"
            value={data.usia}
            onChange={(e) => update("usia", e.target.value)}
          />
        </Field>
        <Field label="Jenis Kelamin" required>
          <SelectInput
            value={data.jenisKelamin}
            onChange={(e) => update("jenisKelamin", e.target.value)}
          >
            <option value="" disabled selected>
              Pilih jenis kelamin
            </option>
            <option>Laki-laki</option>
            <option>Perempuan</option>
            <option>Prefer tidak menyebutkan</option>
          </SelectInput>
        </Field>
        <Field label="Status Pernikahan">
          <SelectInput
            value={data.statusPernikahan}
            onChange={(e) => update("statusPernikahan", e.target.value)}
          >
            <option value="" disabled selected>
              Pilih status
            </option>
            <option>Belum menikah</option>
            <option>Menikah</option>
            <option>Bercerai</option>
            <option>Janda / Duda</option>
          </SelectInput>
        </Field>
        <Field label="Pekerjaan">
          <TextInput
            placeholder="Contoh: Mahasiswa, Karyawan Swasta"
            value={data.pekerjaan}
            onChange={(e) => update("pekerjaan", e.target.value)}
          />
        </Field>
        <Field label="Domisili">
          <TextInput
            placeholder="Kota tempat tinggal Anda"
            value={data.domisili}
            onChange={(e) => update("domisili", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );
}

function Step2({ data, update, toggleKeluhan }: Step2Props) {
  return (
    <div>
      <SectionHeader
        badge="Langkah 2 dari 5"
        title="Keluhan Utama"
        desc="Pilih satu atau lebih kondisi yang ingin Anda bicarakan. Tidak ada jawaban yang salah."
      />

      <Field label="Apa yang Anda rasakan saat ini?" required>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          {KELUHAN_LIST.map((k) => {
            const active = data.keluhanUtama.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKeluhan(k)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium text-left
                  transition-all duration-200 active:scale-[0.98]
                  ${
                    active
                      ? "bg-blue-50 border-blue-400 text-blue-900 font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-900"
                  }`}
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all
                  ${active ? "bg-blue-900" : "border-2 border-gray-300"}`}
                >
                  {active && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M5 12l4 4 10-10"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {k}
              </button>
            );
          })}
        </div>
      </Field>

      {data.keluhanUtama.includes("Lainnya") && (
        <Field label="Jelaskan keluhan lainnya">
          <TextareaInput
            rows={3}
            placeholder="Ceritakan keluhan Anda di sini..."
            value={data.keluhanLainnya}
            onChange={(e) => update("keluhanLainnya", e.target.value)}
          />
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Field label="Sudah berapa lama dirasakan?" required>
          <SelectInput
            value={data.durasiKeluhan}
            onChange={(e) => update("durasiKeluhan", e.target.value)}
          >
            <option value="" disabled selected>
              Pilih durasi
            </option>
            {DURASI_LIST.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </SelectInput>
        </Field>
        <Field
          label={`Seberapa mengganggu aktivitas Anda? (${data.intensitas}/10)`}
        >
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs text-gray-400 w-12 shrink-0">Ringan</span>
            <input
              type="range"
              min={1}
              max={10}
              value={data.intensitas}
              onChange={(e) => update("intensitas", Number(e.target.value))}
              className="flex-1 accent-blue-900 cursor-pointer"
            />
            <span className="text-xs text-gray-400 w-10 shrink-0 text-right">
              Berat
            </span>
          </div>
          <div className="flex justify-between mt-1 px-14">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <span
                key={n}
                className={`text-[10px] font-bold transition-colors
                ${n === data.intensitas ? "text-blue-900" : "text-gray-300"}`}
              >
                {n}
              </span>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Step3({ data, update }: StepProps) {
  return (
    <div>
      <SectionHeader
        badge="Langkah 3 dari 5"
        title="Riwayat Kesehatan"
        desc="Informasi ini membantu psikolog memahami latar belakang Anda secara menyeluruh."
      />

      <Field
        label="Apakah Anda pernah berkonsultasi dengan psikolog/psikiater sebelumnya?"
        required
      >
        <PillRadio
          options={["Ya, pernah", "Tidak pernah", "Sedang dalam terapi"]}
          value={data.pernahKonsultasi}
          onChange={(v) => update("pernahKonsultasi", v)}
        />
      </Field>

      {data.pernahKonsultasi === "Ya, pernah" && (
        <Field label="Ceritakan singkat pengalaman terapi sebelumnya">
          <TextareaInput
            rows={3}
            placeholder="Kapan, berapa lama, dan bagaimana hasilnya..."
            value={data.riwayatTerapi}
            onChange={(e) => update("riwayatTerapi", e.target.value)}
          />
        </Field>
      )}

      <Field label="Apakah ada kondisi medis/fisik yang sedang Anda alami?">
        <TextInput
          placeholder="Contoh: Diabetes, hipertensi, atau tulis 'Tidak ada'"
          value={data.riwayatMedis}
          onChange={(e) => update("riwayatMedis", e.target.value)}
        />
      </Field>

      <Field
        label="Apakah Anda sedang mengonsumsi obat-obatan tertentu?"
        required
      >
        <PillRadio
          options={["Ya", "Tidak"]}
          value={data.konsumsiObat}
          onChange={(v) => update("konsumsiObat", v)}
        />
      </Field>

      {data.konsumsiObat === "Ya" && (
        <Field label="Nama obat yang dikonsumsi">
          <TextInput
            placeholder="Nama obat dan dosisnya"
            value={data.namaObat}
            onChange={(e) => update("namaObat", e.target.value)}
          />
        </Field>
      )}

      <Field label="Apakah ada anggota keluarga dengan riwayat gangguan mental?">
        <TextInput
          placeholder="Contoh: Ibu dengan depresi, atau tulis 'Tidak ada'"
          value={data.riwayatKeluarga}
          onChange={(e) => update("riwayatKeluarga", e.target.value)}
        />
      </Field>
    </div>
  );
}

function Step4({ data, update }: StepProps) {
  return (
    <div>
      <SectionHeader
        badge="Langkah 4 dari 5"
        title="Kondisi Saat Ini"
        desc="Bagaimana keadaan Anda belakangan ini? Jawab sejujur mungkin, tidak ada yang menghakimi."
      />

      <Field label="Bagaimana mood Anda hari ini?" required>
        <div className="flex gap-3 flex-wrap mt-1">
          {MOOD_LIST.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => update("mood", m.value)}
              className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl border-2
                transition-all duration-200 active:scale-95 min-w-20
                ${
                  data.mood === m.value
                    ? "border-blue-900 bg-blue-50 shadow-lg shadow-blue-100"
                    : "border-gray-200 bg-white hover:border-blue-200"
                }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  data.mood === m.value ? "text-blue-900" : "text-gray-500"
                }`}
              >
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        <Field label="Pola tidur Anda">
          <SelectInput
            value={data.polaTidur}
            onChange={(e) => update("polaTidur", e.target.value)}
          >
            <option value="" disabled selected>
              Pilih kondisi tidur
            </option>
            <option>Tidur nyenyak dan cukup</option>
            <option>Susah tidur (insomnia)</option>
            <option>Tidur terlalu banyak</option>
            <option>Sering terbangun malam</option>
            <option>Jadwal tidur tidak teratur</option>
          </SelectInput>
        </Field>
        <Field label={`Rata-rata jam tidur: ${data.jamTidur} jam/malam`}>
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs text-gray-400">2j</span>
            <input
              type="range"
              min={2}
              max={12}
              value={data.jamTidur}
              onChange={(e) => update("jamTidur", Number(e.target.value))}
              className="flex-1 accent-blue-900 cursor-pointer"
            />
            <span className="text-xs text-gray-400">12j</span>
          </div>
        </Field>
        <Field label="Nafsu makan Anda">
          <SelectInput
            value={data.nafsuMakan}
            onChange={(e) => update("nafsuMakan", e.target.value)}
          >
            <option value="" disabled selected>
              Pilih kondisi
            </option>
            <option>Normal seperti biasa</option>
            <option>Berkurang drastis</option>
            <option>Meningkat drastis</option>
            <option>Tidak menentu</option>
          </SelectInput>
        </Field>
        <Field label="Aktivitas sosial Anda">
          <SelectInput
            value={data.aktivitasSosial}
            onChange={(e) => update("aktivitasSosial", e.target.value)}
          >
            <option value="" disabled selected>
              Pilih kondisi
            </option>
            <option>Aktif dan bersemangat</option>
            <option>Mulai menarik diri</option>
            <option>Sangat menghindari orang</option>
            <option>Normal tapi terasa berat</option>
          </SelectInput>
        </Field>
      </div>

      <Field
        label="Ceritakan kondisi Anda saat ini secara lebih detail"
        required
      >
        <TextareaInput
          rows={5}
          placeholder="Apa yang Anda rasakan belakangan ini? Ceritakan dengan bebas dan jujur. Semua informasi ini bersifat rahasia dan tidak akan dibagikan kepada siapapun selain psikolog Anda..."
          value={data.deskripsi}
          onChange={(e) => update("deskripsi", e.target.value)}
        />
      </Field>
    </div>
  );
}

function Step5({ data, update }: StepProps) {
  return (
    <div>
      <SectionHeader
        badge="Langkah 5 dari 5"
        title="Tujuan & Harapan"
        desc="Memahami harapan Anda membantu psikolog merancang pendekatan yang paling tepat untuk Anda."
      />

      <Field label="Apa tujuan utama Anda berkonsultasi?" required>
        <SelectInput
          value={data.tujuan}
          onChange={(e) => update("tujuan", e.target.value)}
        >
          <option value="" disabled selected>
            Pilih tujuan utama
          </option>
          <option>Mencari solusi dari masalah spesifik</option>
          <option>Memahami diri sendiri lebih baik</option>
          <option>Mendapatkan dukungan emosional</option>
          <option>Mengembangkan strategi coping</option>
          <option>Memperbaiki hubungan dengan orang lain</option>
          <option>Mengatasi trauma masa lalu</option>
          <option>Hanya ingin didengarkan dulu</option>
        </SelectInput>
      </Field>

      <Field label="Apa harapan Anda setelah menjalani konsultasi?" required>
        <TextareaInput
          rows={4}
          placeholder="Contoh: Saya ingin merasa lebih tenang, bisa mengelola emosi dengan baik, dan kembali menjalani aktivitas sehari-hari dengan normal..."
          value={data.harapan}
          onChange={(e) => update("harapan", e.target.value)}
        />
      </Field>

      <Field label="Preferensi sesi konsultasi">
        <PillRadio
          options={[
            "Online (Video Call)",
            "Tatap Muka (Offline)",
            "Keduanya bisa",
          ]}
          value={data.preferensi}
          onChange={(v) => update("preferensi", v)}
        />
      </Field>

      <Field label="Ada informasi tambahan yang ingin Anda sampaikan?">
        <TextareaInput
          rows={3}
          placeholder="Hal-hal lain yang ingin psikolog ketahui sebelum sesi dimulai..."
          value={data.tambahan}
          onChange={(e) => update("tambahan", e.target.value)}
        />
      </Field>

      <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 mt-2">
        <svg
          className="w-6 h-6 text-blue-700 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <p className="text-sm text-blue-700 leading-relaxed">
          Semua informasi yang Anda berikan <strong>bersifat rahasia</strong>{" "}
          dan hanya dapat diakses oleh psikolog yang menangani Anda. Kami
          menjaga privasi Anda 100% aman sesuai standar etika profesi.
        </p>
      </div>
    </div>
  );
}

export default function PreConsultationForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    nama: "",
    usia: "",
    jenisKelamin: "",
    statusPernikahan: "",
    pekerjaan: "",
    domisili: "",

    keluhanUtama: [],
    keluhanLainnya: "",
    durasiKeluhan: "",
    intensitas: 5,

    pernahKonsultasi: "",
    riwayatTerapi: "",
    riwayatMedis: "",
    konsumsiObat: "",
    namaObat: "",
    riwayatKeluarga: "",

    mood: "",
    polaTidur: "",
    jamTidur: 7,
    nafsuMakan: "",
    aktivitasSosial: "",
    deskripsi: "",

    tujuan: "",
    harapan: "",
    preferensi: "",
    tambahan: "",
  });

  const router = useRouter();

  const update: UpdateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleKeluhan = (item: string) =>
    setForm((prev) => ({
      ...prev,
      keluhanUtama: prev.keluhanUtama.includes(item)
        ? prev.keluhanUtama.filter((k: string) => k !== item)
        : [...prev.keluhanUtama, item],
    }));

  const canNext = () => {
    if (step === 1) return form.nama && form.usia && form.jenisKelamin;
    if (step === 2) return form.keluhanUtama.length > 0 && form.durasiKeluhan;
    if (step === 3) return form.pernahKonsultasi && form.konsumsiObat;
    if (step === 4) return form.mood && form.deskripsi;
    if (step === 5) return form.tujuan && form.harapan;
    return true;
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  async function analyzeApi(form: FormState) {
    try {
      const response = await fetch("/api/ai-psikolog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "analyze", form }),
      });
      if (!response.ok) {
        throw new Error("Gagal menganalisis data");
      }
    } catch (error) {
      console.error("Error saat analisis:", error);
    }
  }
  const handleSubmit = async () => {
    try {
      await analyzeApi(form);
      setSubmitted(true);

      setTimeout(() => {
        router.push("/listpsikolog");
      }, 1500);
    } catch (error) {
      console.error("Error saat submit:", error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-4xl p-10 text-center shadow-xl border border-blue-50">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-blue-900"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="inline-block py-1 px-4 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">
            Formulir Terkirim
          </span>
          <h2 className="text-3xl font-black text-blue-900 tracking-tight mb-3">
            Terima Kasih!
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Psikolog kami akan mempelajari informasi yang Anda berikan sebelum
            sesi dimulai, sehingga konsultasi lebih personal dan tepat sasaran.
          </p>
          <div className="bg-blue-50 rounded-2xl p-4 mb-8 text-sm text-blue-700 leading-relaxed">
            Konfirmasi jadwal akan dikirimkan melalui <strong>WhatsApp</strong>{" "}
            atau <strong>Email</strong> Anda dalam 1×24 jam.
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              router.push("/listpsikolog");
            }}
            className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold text-base
              hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-200"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black text-blue-900 tracking-tighter"
          >
            pendengarMu
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-sm text-gray-400 font-medium">
              Formulir Pre-Konsultasi
            </span>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {step} / {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <div className="relative h-1.5 bg-gray-200 rounded-full mb-6">
            <div
              className="absolute left-0 top-0 h-full bg-blue-900 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold
                  transition-all duration-300 border-2
                  ${
                    step > s.id
                      ? "bg-blue-900 border-blue-900 text-white"
                      : step === s.id
                        ? "bg-white border-blue-900 text-blue-900 shadow-lg shadow-blue-100"
                        : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {step > s.id ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12l4 4 10-10"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    s.icon
                  )}
                </div>
                <span
                  className={`text-[11px] font-semibold hidden sm:block transition-colors
                  ${step === s.id ? "text-blue-900" : "text-gray-400"}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-4xl shadow-sm border border-gray-100 p-8 sm:p-10">
          {step === 1 && <Step1 data={form} update={update} />}
          {step === 2 && (
            <Step2 data={form} update={update} toggleKeluhan={toggleKeluhan} />
          )}
          {step === 3 && <Step3 data={form} update={update} />}
          {step === 4 && <Step4 data={form} update={update} />}
          {step === 5 && <Step5 data={form} update={update} />}

          <div
            className={`flex items-center pt-8 mt-6 border-t border-gray-100
            ${step === 1 ? "justify-end" : "justify-between"}`}
          >
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200
                  text-gray-600 text-sm font-semibold
                  hover:border-blue-300 hover:text-blue-900 transition-all active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12H5M12 5l-7 7 7 7"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Kembali
              </button>
            )}

            {step < STEPS.length ? (
              <button
                onClick={() => canNext() && setStep(step + 1)}
                disabled={!canNext()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm
                  transition-all active:scale-95
                  ${
                    canNext()
                      ? "bg-blue-900 text-white hover:bg-blue-800 shadow-lg shadow-blue-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Lanjut
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canNext()}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm
                  transition-all active:scale-95
                  ${
                    canNext()
                      ? "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Kirim Formulir
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          Butuh bantuan darurat? Hubungi{" "}
          <span className="font-bold text-blue-900">119 ext 8</span> — Hotline
          Kesehatan Jiwa Nasional
        </p>
      </div>
    </div>
  );
}
