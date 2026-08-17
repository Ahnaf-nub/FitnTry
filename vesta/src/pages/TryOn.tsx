import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { StepIndicator } from "@/components/tryon/StepIndicator";
import { UploadDropzone } from "@/components/tryon/UploadDropzone";
import { CameraCapture } from "@/components/tryon/CameraCapture";
import { ImagePreview } from "@/components/tryon/ImagePreview";
import { CategoryTabs } from "@/components/tryon/CategoryTabs";
import { GarmentGrid } from "@/components/tryon/GarmentGrid";
import { TryOnControls } from "@/components/tryon/TryOnControls";
import { GenerateButton } from "@/components/tryon/GenerateButton";
import { ProcessingModal } from "@/components/tryon/ProcessingModal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useTryOnStore } from "@/hooks/useTryOnStore";
import { garments as garmentCatalog, garmentCategories, genders } from "@/data/garments";
import { Garment, GarmentCategory, Gender } from "@/types/tryOn";
import { createTryOn, validateImageFile } from "@/services";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: "01", label: "Your Photo" },
  { n: "02", label: "Choose Outfit" },
  { n: "03", label: "Preview" },
];

export default function TryOn() {
  const navigate = useNavigate();
  const { push } = useToast();
  const {
    userImage, setUserImage,
    garment, setGarment,
    bodyArea, setBodyArea,
    style, setStyle,
    status, setStatus,
    jobId, setJobId,
    setResultImage,
    error, setError,
  } = useTryOnStore();

  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [category, setCategory] = useState<GarmentCategory | "All">("All");
  const [gender, setGender] = useState<Gender | "All">("All");
  const [customGarments, setCustomGarments] = useState<Garment[]>([]);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<"upload" | "camera">("upload");

  const allGarments = useMemo(() => [...customGarments, ...garmentCatalog], [customGarments]);
  const filteredGarments = useMemo(
    () =>
      allGarments.filter(
        (g) =>
          (category === "All" || g.category === category) &&
          (gender === "All" || !g.gender || g.gender === gender)
      ),
    [allGarments, category, gender]
  );

  function goToStep(i: number) {
    setStepError(null);
    setStep(i);
    setMaxReached((m) => Math.max(m, i));
  }

  function handlePhotoFile(file: File) {
    const validation = validateImageFile(file);
    if (validation) {
      setStepError(validation.message);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUserImage(reader.result as string);
      setStepError(null);
    };
    reader.readAsDataURL(file);
  }

  function handleGarmentFile(file: File) {
    const validation = validateImageFile(file);
    if (validation) {
      setStepError(validation.message);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const custom: Garment = {
        id: `custom_${Date.now()}`,
        name: "Your upload",
        category: "Full Looks",
        price: 0,
        image: reader.result as string,
        tag: "New",
      };
      setCustomGarments((c) => [custom, ...c]);
      setGarment(custom);
      setShowCustomUpload(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!userImage) {
      setStepError("Add a photo before generating your try-on.");
      return;
    }
    if (!garment) {
      setStepError("Choose a garment before generating your try-on.");
      return;
    }
    setStepError(null);
    setError(null);
    setStatus("processing");
    try {
      const { jobId: id } = await createTryOn({
        userImage,
        garmentImage: garment.image,
        garmentCategory: garment.category,
        gender: garment.gender,
      });
      setJobId(id);
    } catch (e) {
      setStatus("failed");
      setError(e as any);
    }
  }

  function handleComplete(resultImage: string) {
    setResultImage(resultImage);
    setStatus("completed");
    push({ kind: "success", title: "Your look is ready", description: `${garment?.name} generated successfully.` });
    navigate("/result");
  }

  function handleGenerationError(err: { message: string }) {
    setStatus("failed");
    setError(err as any);
    setJobId(null);
  }

  return (
    <div className="container-FitnTry py-10 sm:py-14">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to home
      </button>

      <div className="mb-10 max-w-xl">
        <p className="eyebrow mb-2">Virtual dressing room</p>
        <h1 className="font-display text-3xl sm:text-4xl">Build your try-on</h1>
      </div>

      <div className="mb-10">
        <StepIndicator steps={STEPS} current={step} maxReached={maxReached} onStepClick={goToStep} />
      </div>

      {error && status === "failed" && (
        <div className="mb-8">
          <Alert
            title="We couldn't create your look this time."
            description={error.message}
            onRetry={handleGenerate}
          />
        </div>
      )}

      {stepError && (
        <div className="mb-8">
          <Alert title={stepError} />
        </div>
      )}

      {/* STEP 1 — PHOTO */}
      {step === 0 && (
        <div className="mx-auto max-w-2xl animate-fade-up">
          {!userImage ? (
            <>
              <div className="mb-4 flex justify-center gap-2">
                <button
                  onClick={() => setPhotoSource("upload")}
                  className={cn(
                    "rounded-sm border px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                    photoSource === "upload"
                      ? "border-ink bg-ink text-canvas"
                      : "border-line-strong text-ink-soft hover:border-ink/40"
                  )}
                >
                  Upload a photo
                </button>
                <button
                  onClick={() => setPhotoSource("camera")}
                  className={cn(
                    "rounded-sm border px-4 py-1.5 text-[12.5px] font-medium transition-colors",
                    photoSource === "camera"
                      ? "border-ink bg-ink text-canvas"
                      : "border-line-strong text-ink-soft hover:border-ink/40"
                  )}
                >
                  Use camera
                </button>
              </div>

              {photoSource === "upload" ? (
                <>
                  <UploadDropzone onFile={handlePhotoFile} label="Drop your photo here, or browse" />
                  <p className="mt-4 text-center text-[12.5px] text-ink-faint">
                    Use a clear, well-lit photo for the best result.
                  </p>
                </>
              ) : (
                <CameraCapture onCapture={handlePhotoFile} onCancel={() => setPhotoSource("upload")} />
              )}
            </>
          ) : (
            <ImagePreview
              image={userImage}
              onReplace={() => setUserImage(null)}
              onRemove={() => setUserImage(null)}
              onContinue={() => goToStep(1)}
            />
          )}
        </div>
      )}

      {/* STEP 2 — GARMENT */}
      {step === 1 && (
        <div className="animate-fade-up">
          <div className="mb-4">
            <CategoryTabs categories={genders} active={gender} onChange={setGender} />
          </div>

          <div className="mb-6">
            <CategoryTabs categories={garmentCategories} active={category} onChange={setCategory} />
          </div>

          <GarmentGrid
            garments={filteredGarments}
            selectedId={garment?.id}
            onSelect={setGarment}
            onUploadOwn={() => setShowCustomUpload((v) => !v)}
          />

          {showCustomUpload && (
            <div className="mt-6 max-w-md">
              <UploadDropzone onFile={handleGarmentFile} label="Upload a garment photo" compact />
            </div>
          )}

          <div className="mt-10 flex justify-between border-t border-line pt-6">
            <Button variant="ghost" onClick={() => goToStep(0)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => goToStep(2)} disabled={!garment}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 — CUSTOMIZE + GENERATE */}
      {step === 2 && userImage && garment && (
        <div className="mx-auto max-w-xl animate-fade-up">
          <TryOnControls
            bodyArea={bodyArea}
            onBodyAreaChange={setBodyArea}
            style={style}
            onStyleChange={setStyle}
          />

          <div className="mt-10">
            <GenerateButton
              userImage={userImage}
              garment={garment}
              onGenerate={handleGenerate}
              disabled={status === "processing"}
              loading={status === "processing"}
            />
          </div>

          <div className="mt-6 flex justify-start">
            <Button variant="ghost" onClick={() => goToStep(1)}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      )}

      {status === "processing" && jobId && garment && (
        <ProcessingModal
          jobId={jobId}
          garmentImage={garment.image}
          onComplete={handleComplete}
          onError={handleGenerationError}
        />
      )}
    </div>
  );
}
