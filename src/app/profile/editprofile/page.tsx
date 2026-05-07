"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { FileUploaderRegular } from "@uploadcare/react-uploader";

type PsychiatristInfo = {
  certificate?: string;
  experience?: number;
  about?: string;
  price?: number;
  mode?: string;
  speciality?: string[];
  imageUrl?: string;
  imageId?: string;
  roleSpecialist?: string;
  scheduleDays?: string[];
  scheduleTimes?: string[];
  paket?: { type: "videocall" | "chat-only" | "offline"; price: number }[];
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIMES = Array.from({ length: 8 }, (_, i) => {
  const h = 9 + i;
  return {
    value: `${String(h).padStart(2, "0")}:00`,
    label: `${String(h).padStart(2, "0")}:00 – ${String(h).padStart(2, "0")}:50`,
  };
});

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section-card">
      <h2 className="section-title">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "psychiatrist">("user");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [psychiatristInfo, setPsychiatristInfo] = useState<PsychiatristInfo>(
    {}
  );
  const [newSpeciality, setNewSpeciality] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
        const d = data.data;
        setName(d.name || "");
        setEmail(d.email || "");
        setRole(d.role || "user");
        setPhoneNumber(d.phoneNumber || "");
        setAddress(d.address || "");
        setPsychiatristInfo(d.psychiatristInfo || {});
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phoneNumber,
          address,
          psychiatristInfo: {
            ...psychiatristInfo,
            speciality: psychiatristInfo.speciality || [],
            scheduleDays: psychiatristInfo.scheduleDays || [],
            scheduleTimes: psychiatristInfo.scheduleTimes || [],
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      Swal.close();
      await Swal.fire({ icon: "success", title: "Profil berhasil disimpan!" });
      setSuccess("Profil diperbarui");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      Swal.close();
      await Swal.fire({
        icon: "error",
        title: "Gagal menyimpan",
        text: message,
      });
    }
  }

  function toggleDay(day: string) {
    setPsychiatristInfo((prev) => {
      const set = new Set(prev.scheduleDays || []);
      set.has(day) ? set.delete(day) : set.add(day);
      return { ...prev, scheduleDays: Array.from(set) };
    });
  }

  function toggleTime(value: string) {
    setPsychiatristInfo((prev) => {
      const set = new Set(prev.scheduleTimes || []);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, scheduleTimes: Array.from(set) };
    });
  }

  function setPaketPrice(
    type: "videocall" | "chat-only" | "offline",
    price: number
  ) {
    setPsychiatristInfo((prev) => {
      const others = (prev.paket || []).filter((p) => p.type !== type);
      return { ...prev, paket: [...others, { type, price }] };
    });
  }

  function addSpeciality() {
    const val = newSpeciality.trim();
    if (!val) return;
    setPsychiatristInfo((prev) => ({
      ...prev,
      speciality: Array.from(new Set([...(prev.speciality || []), val])),
    }));
    setNewSpeciality("");
  }

  function removeSpeciality(idx: number) {
    setPsychiatristInfo((prev) => ({
      ...prev,
      speciality: (prev.speciality || []).filter((_, i) => i !== idx),
    }));
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Memuat profil…</p>
      </div>
    );
  }

  const paketPrice = (type: "videocall" | "chat-only" | "offline") =>
    (psychiatristInfo.paket?.find((p) => p.type === type)?.price ?? "") as any;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #f5f6fa;
          --surface: #ffffff;
          --surface-2: #f8f9fc;
          --border: #e4e7ef;
          --border-focus: #6c8cff;
          --text-primary: #1a1d2e;
          --text-secondary: #5a6278;
          --text-muted: #9aa0b4;
          --accent: #5b7cff;
          --accent-hover: #4a6aee;
          --accent-light: #eef1ff;
          --accent-soft: #dce3ff;
          --danger: #ff4d6a;
          --danger-light: #fff0f3;
          --success: #22c55e;
          --success-light: #f0fdf4;
          --tag-bg: #eef1ff;
          --tag-text: #4a6aee;
          --radius: 12px;
          --radius-sm: 8px;
          --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
          --shadow: 0 4px 16px rgba(0,0,0,.08);
        }

        body { background: var(--bg); font-family: 'Nunito', 'Segoe UI', sans-serif; color: var(--text-primary); }

        .page-wrapper { max-width: 780px; margin: 0 auto; padding: 36px 20px 60px; }

        .page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 32px; }
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: var(--accent);
          text-decoration: none; padding: 6px 12px; border-radius: 8px;
          background: var(--accent-light); transition: background .15s;
        }
        .back-btn:hover { background: var(--accent-soft); }
        .page-title { font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -.5px; }

        .alert {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px; border-radius: var(--radius-sm);
          font-size: 14px; font-weight: 600; margin-bottom: 20px;
        }
        .alert-error { background: var(--danger-light); color: var(--danger); border: 1px solid #ffc5cf; }
        .alert-success { background: var(--success-light); color: var(--success); border: 1px solid #bbf7d0; }

        .section-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 28px; margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }
        .section-title {
          font-size: 15px; font-weight: 700; color: var(--text-secondary);
          text-transform: uppercase; letter-spacing: .6px; margin-bottom: 20px;
          padding-bottom: 14px; border-bottom: 1px solid var(--border);
        }

        .field-group { margin-bottom: 18px; }
        .field-group:last-child { margin-bottom: 0; }
        .field-label { display: block; font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: .2px; }
        .field-input, .field-textarea {
          width: 100%; padding: 10px 14px; border: 1.5px solid var(--border);
          border-radius: var(--radius-sm); font-size: 14px; color: var(--text-primary);
          background: var(--surface); outline: none;
          transition: border-color .15s, box-shadow .15s; font-family: inherit;
        }
        .field-input:focus, .field-textarea:focus {
          border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(108,140,255,.12);
        }
        .field-input:disabled { background: var(--surface-2); color: var(--text-muted); cursor: not-allowed; }
        .field-textarea { resize: vertical; min-height: 90px; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        @media (max-width: 560px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }

        .paket-card { background: var(--surface-2); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 14px; }
        .paket-icon { font-size: 22px; margin-bottom: 6px; }
        .paket-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }

        .tags-wrapper { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .tag-pill { display: inline-flex; align-items: center; gap: 6px; background: var(--tag-bg); color: var(--tag-text); font-size: 13px; font-weight: 600; padding: 5px 12px; border-radius: 999px; }
        .tag-remove { background: none; border: none; cursor: pointer; font-size: 15px; color: var(--danger); line-height: 1; display: flex; align-items: center; padding: 0; }
        .tag-add-row { display: flex; gap: 8px; margin-top: 6px; }
        .tag-add-btn { padding: 10px 18px; background: var(--accent); color: #fff; border: none; border-radius: var(--radius-sm); font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background .15s; }
        .tag-add-btn:hover { background: var(--accent-hover); }

        .toggle-grid-days { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
        .toggle-grid-times { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 10px; }
        @media (max-width: 500px) {
          .toggle-grid-days { grid-template-columns: repeat(2, 1fr); }
          .toggle-grid-times { grid-template-columns: repeat(2, 1fr); }
        }
        .toggle-chip {
          padding: 8px 4px; text-align: center; font-size: 13px; font-weight: 700;
          border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          cursor: pointer; transition: all .15s; user-select: none;
          color: var(--text-secondary); background: var(--surface-2);
        }
        .toggle-chip:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
        .toggle-chip.active { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(91,124,255,.30); }

        .image-upload-row { display: flex; align-items: center; gap: 20px; margin-top: 6px; }
        .avatar-preview { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-soft); box-shadow: var(--shadow-sm); flex-shrink: 0; }
        .avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; background: var(--accent-light); display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }

        .submit-bar { display: flex; justify-content: flex-end; margin-top: 8px; }
        .submit-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 32px; background: var(--accent); color: #fff;
          border: none; border-radius: var(--radius-sm); font-size: 15px;
          font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(91,124,255,.35);
          transition: background .15s, transform .1s, box-shadow .15s; letter-spacing: .2px;
        }
        .submit-btn:hover { background: var(--accent-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(91,124,255,.40); }
        .submit-btn:active { transform: translateY(0); }

        .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; color: var(--text-muted); font-size: 14px; font-weight: 600; }
        .spinner { width: 36px; height: 36px; border: 3px solid var(--accent-soft); border-top-color: var(--accent); border-radius: 50%; animation: spin .7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-wrapper">
        {/* ── Header ── */}
        <div className="page-header">
          <Link href="/profile" className="back-btn">
            ← Kembali
          </Link>
          <h1 className="page-title">Edit Profil</h1>
        </div>

        {/* ── Alerts ── */}
        {error && <div className="alert alert-error">⚠ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        <form onSubmit={handleSave}>
          {/* ── Basic Info ── */}
          <SectionCard title="Informasi Dasar">
            <div className="grid-2">
              <Field label="Nama Lengkap">
                <input
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama kamu"
                />
              </Field>
              <Field label="Email">
                <input className="field-input" value={email} disabled />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Nomor Telepon">
                <input
                  className="field-input"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62..."
                />
              </Field>
              <Field label="Alamat">
                <input
                  className="field-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kota, Provinsi"
                />
              </Field>
            </div>
          </SectionCard>
          {/* ── Psychiatrist Info ── */}
          {role === "psychiatrist" && (
            <>
              {/* Identity */}
              <SectionCard title="Identitas Profesional">
                <div className="grid-2">
                  <Field label="Nomor Sertifikat">
                    <input
                      className="field-input"
                      value={psychiatristInfo.certificate || ""}
                      onChange={(e) =>
                        setPsychiatristInfo((p) => ({
                          ...p,
                          certificate: e.target.value,
                        }))
                      }
                      placeholder="SP-XXXX"
                    />
                  </Field>
                  <Field label="Peran / Spesialisasi">
                    <input
                      className="field-input"
                      value={psychiatristInfo.roleSpecialist || ""}
                      onChange={(e) =>
                        setPsychiatristInfo((p) => ({
                          ...p,
                          roleSpecialist: e.target.value,
                        }))
                      }
                      placeholder="Psikiater Klinis"
                    />
                  </Field>
                </div>
                <div className="grid-2">
                  <Field label="Pengalaman (tahun)">
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      value={psychiatristInfo.experience || ""}
                      onChange={(e) =>
                        setPsychiatristInfo((p) => ({
                          ...p,
                          experience: Number(e.target.value),
                        }))
                      }
                      placeholder="5"
                    />
                  </Field>
                  <Field label="Harga Dasar (Rp)">
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      value={psychiatristInfo.price || ""}
                      onChange={(e) =>
                        setPsychiatristInfo((p) => ({
                          ...p,
                          price: Number(e.target.value),
                        }))
                      }
                      placeholder="150000"
                    />
                  </Field>
                </div>
                <Field label="Tentang Saya">
                  <textarea
                    className="field-textarea"
                    value={psychiatristInfo.about || ""}
                    onChange={(e) =>
                      setPsychiatristInfo((p) => ({
                        ...p,
                        about: e.target.value,
                      }))
                    }
                    placeholder="Ceritakan pengalaman dan pendekatan konsultasi kamu…"
                  />
                </Field>
              </SectionCard>

              {/* Packages */}
              <SectionCard title="Paket Konsultasi">
                <div className="grid-3">
                  {(
                    [
                      { type: "videocall", icon: "📹", label: "Video Call" },
                      { type: "chat-only", icon: "💬", label: "Chat Only" },
                      { type: "offline", icon: "🏥", label: "Offline" },
                    ] as const
                  ).map(({ type, icon, label }) => (
                    <div className="paket-card" key={type}>
                      <div className="paket-icon">{icon}</div>
                      <div className="paket-label">{label}</div>
                      <input
                        className="field-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={paketPrice(type)}
                        onChange={(e) =>
                          setPaketPrice(type, Number(e.target.value || 0))
                        }
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Specialities */}
              <SectionCard title="Spesialisasi">
                <div className="tag-add-row">
                  <input
                    className="field-input"
                    value={newSpeciality}
                    onChange={(e) => setNewSpeciality(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addSpeciality();
                      }
                    }}
                    placeholder="Ketik lalu tekan Enter atau tombol Tambah…"
                  />
                  <button
                    type="button"
                    className="tag-add-btn"
                    onClick={addSpeciality}
                  >
                    Tambah
                  </button>
                </div>
                {(psychiatristInfo.speciality || []).length > 0 && (
                  <div className="tags-wrapper">
                    {(psychiatristInfo.speciality || []).map((tag, i) => (
                      <span key={i} className="tag-pill">
                        {tag}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => removeSpeciality(i)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </SectionCard>

              {/* Schedule */}
              <SectionCard title="Jadwal Konsultasi">
                <Field label="Hari Tersedia">
                  <div className="toggle-grid-days">
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        className={`toggle-chip${
                          (psychiatristInfo.scheduleDays || []).includes(day)
                            ? " active"
                            : ""
                        }`}
                        onClick={() => toggleDay(day)}
                      >
                        {day.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                </Field>
                <Field label="Jam Tersedia">
                  <div className="toggle-grid-times">
                    {TIMES.map(({ value, label }) => (
                      <div
                        key={value}
                        className={`toggle-chip${
                          (psychiatristInfo.scheduleTimes || []).includes(value)
                            ? " active"
                            : ""
                        }`}
                        onClick={() => toggleTime(value)}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </Field>
              </SectionCard>

              {/* Photo */}
              <SectionCard title="Foto Profil">
                <div className="image-upload-row">
                  {psychiatristInfo.imageUrl ? (
                    <Image
                      src={psychiatristInfo.imageUrl}
                      alt="profile"
                      width={80}
                      height={80}
                      className="avatar-preview"
                    />
                  ) : (
                    <div className="avatar-placeholder">👤</div>
                  )}
                  <div>
                    <FileUploaderRegular
                      pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_KEY!}
                      maxLocalFileSizeBytes={5000000}
                      imgOnly={true}
                      onFileUploadSuccess={(file) => {
                        const fullUrl = file.cdnUrl; // ← cukup ini saja!

                        console.log("FINAL URL:", fullUrl);

                        setPsychiatristInfo((p) => ({
                          ...p,
                          imageUrl: fullUrl,
                          imageId: file.uuid,
                        }));
                      }}
                      onFileUploadFailed={(err) => {
                        setError("Upload gambar gagal: " + err.message);
                      }}
                    />
                  </div>
                </div>
              </SectionCard>
            </>
          )}{" "}
          {/* ← closes {role === "psychiatrist" && ( */}
          {/* ── Save ── */}
          <div className="submit-bar">
            <button type="submit" className="submit-btn">
              💾 Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
