import { useState, useRef, useEffect } from "react";
import '../style.css'

const API_KEY = "5e98aa35b9c768a7f888be07f39d7fa4";
const MIN_CODE = 3;
const MAX_CODE = 10;

const css = `

`;

const LABELS = { ready: "Ready", busy: "Uploading...", done: "Uploaded", fail: "Failed" };

// returns an error message, or "" when the code is valid
function validateCode(value) {
  if (!value) return "Code is required";
  if (!/^\d+$/.test(value)) return "Code must contain digits only";
  if (value.length < MIN_CODE) return `Code must be at least ${MIN_CODE} digits`;
  if (value.length > MAX_CODE) return `Code must be at most ${MAX_CODE} digits`;
  return "";
}

export default function ImageUpload() {
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false); // show code errors after first blur/submit
  const [nonDigit, setNonDigit] = useState(false); // user typed a non-digit character
  const [image, setImage] = useState(null); // { file, url, status }
  const [imageError, setImageError] = useState("");
  const [link, setLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [shake, setShake] = useState({ code: false, image: false });
  const [toast, setToast] = useState({ show: false, text: "", err: false });

  const fileRef = useRef(null);
  const codeRef = useRef(null);
  const toastTimer = useRef(null);
  const imageRef = useRef(null);
  imageRef.current = image;

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      if (imageRef.current) URL.revokeObjectURL(imageRef.current.url);
    },
    []
  );

  const codeError = nonDigit
    ? "Code must contain digits only"
    : touched
    ? validateCode(code)
    : "";
  const codeValid = !validateCode(code);

  // toast visible for exactly 3 seconds
  function showToast(text, err = false) {
    clearTimeout(toastTimer.current);
    setToast({ show: true, text, err });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      3000
    );
  }

  function onCodeChange(e) {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "");
    setNonDigit(raw !== digits);
    setCode(digits.slice(0, MAX_CODE));
  }

  // single image only
  function pickFile(list) {
    const all = Array.from(list);
    const file = all.find((f) => f.type.startsWith("image/"));
    if (!file) {
      if (all.length) {
        setImageError("Only image files are allowed");
        showToast("Images only!", true);
      }
      return;
    }
    if (all.length > 1) showToast("Only one image is allowed. Using the first one.", true);
    if (image) URL.revokeObjectURL(image.url);
    setImage({ file, url: URL.createObjectURL(file), status: "ready" });
    setImageError("");
    setLink("");
  }

  function validateAll() {
    const ce = validateCode(code);
    const ie = image ? "" : "Image is required";
    setTouched(true);
    setNonDigit(false);
    setImageError(ie);
    if (ce || ie) {
      setShake({ code: !!ce, image: !!ie });
      setTimeout(() => setShake({ code: false, image: false }), 400);
      if (ce) codeRef.current?.focus();
      showToast(
        ce && ie ? "Enter a code and choose an image" : ce || ie,
        true
      );
      return false;
    }
    return true;
  }

  async function handleUpload() {
    if (!validateAll()) return;

    if (image.status === "done") {
      showToast("This image is already uploaded. Choose another one.", true);
      return;
    }

    setBusy(true);
    setImage((i) => ({ ...i, status: "busy" }));

    try {
      const formData = new FormData();
      formData.append("image", image.file);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${API_KEY}`,
        { method: "POST", body: formData }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Upload failed");
      }

      setLink(result.data.url);
      setImage((i) => ({ ...i, status: "done" }));
      console.log(result.data.url);
      showToast("Connected to internet successfully");
    } catch (error) {
      console.error(error);
      setImage((i) => ({ ...i, status: "fail" }));
      showToast("Upload failed. Check your connection and try again.", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="iu-page">
      <style>{css}</style>

      <div className="iu-aurora" aria-hidden="true">
        <div className="iu-blob iu-b1" />
        <div className="iu-blob iu-b2" />
        <div className="iu-blob iu-b3" />
      </div>

      <main className="iu-card">
        <h1 className="iu-title">CafeConnect</h1>
        <p className="iu-sub">Enter your code, Upload the qr Code, Connect to the internet</p>

        <label className="iu-field" htmlFor="iu-code">
          Code ({MIN_CODE} to {MAX_CODE} digits)
        </label>
        <div className="iu-code-wrap">
          <input
            id="iu-code"
            ref={codeRef}
            className={`iu-code ${codeError ? "invalid" : ""} ${
              code && codeValid && !codeError ? "valid" : ""
            } ${shake.code ? "shake" : ""}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={MAX_CODE}
            placeholder="Enter code"
            value={code}
            onChange={onCodeChange}
            onBlur={() => {
              setTouched(true);
              setNonDigit(false);
            }}
            aria-invalid={!!codeError}
            aria-describedby="iu-code-msg"
          />
          <div
            id="iu-code-msg"
            className={codeError ? "iu-error" : "iu-hint"}
            role={codeError ? "alert" : undefined}
          >
            {codeError || (code ? `${code.length} / ${MAX_CODE}` : "")}
          </div>
        </div>

<div
  className={`iu-drop ${over ? "over" : ""} ${imageError ? "invalid" : ""} ${
    shake.image ? "shake" : ""
  }`}
  tabIndex={0}
  role="button"
  aria-label="Choose an image"
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileRef.current?.click();
    }
  }}
  onDragOver={(e) => {
    e.preventDefault();
    setOver(true);
  }}
  onDragLeave={() => setOver(false)}
  onDrop={(e) => {
    e.preventDefault();
    setOver(false);
    pickFile(e.dataTransfer.files);
  }}
>
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" stroke="url(#iu-g)" aria-hidden="true">
            <defs>
              <linearGradient id="iu-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
          </svg>
          <b>{image ? "Click or drop to replace the QR CODE" : "Drop the QR code here or click to browse"}</b>
          <span>PNG, JPG, GIF, WEBP</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            tabIndex={-1}
            onChange={(e) => {
              pickFile(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div className="iu-error" role={imageError ? "alert" : undefined}>
          {imageError}
        </div>

        {image && (
          <div className={`iu-preview ${image.status}`}>
            <img src={image.url} alt="Selected" />
            <div className="iu-st">{LABELS[image.status]}</div>
          </div>
        )}

        <button className="iu-go" onClick={handleUpload} disabled={busy}>
          {busy ? "Connecting..." : "Connect"}
        </button>

        {link && (
          <a className="iu-result" href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>
        )}
      </main>

      <div className={`iu-toast ${toast.err ? "err" : ""} ${toast.show ? "show" : ""}`} role="status" aria-live="polite">
        <span className="iu-dot" />
        <span>{toast.text}</span>
      </div>
    </div>
  );
}