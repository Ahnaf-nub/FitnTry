import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, RotateCcw, Share2, ShoppingBag, Download, Layers, X } from "lucide-react";
import { BeforeAfterSlider } from "@/components/results/BeforeAfterSlider";
import { RecommendationCard } from "@/components/results/RecommendationCard";
import { GarmentGrid } from "@/components/tryon/GarmentGrid";
import { UploadDropzone } from "@/components/tryon/UploadDropzone";
import { ProcessingModal } from "@/components/tryon/ProcessingModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useTryOnStore } from "@/hooks/useTryOnStore";
import { recommendations } from "@/data/recommendations";
import { garments } from "@/data/garments";
import { formatPrice } from "@/lib/utils";
import { Garment, RecommendationItem } from "@/types/tryOn";
import { createTryOn, validateImageFile } from "@/services";
import EmptyState from "@/components/ui/EmptyState";

const bagCatalog = garments.filter((g) => g.category === "Bags");

export default function Result() {
  const navigate = useNavigate();
  const { push } = useToast();
  const { userImage, garment, resultImage, style, saveCurrentLook, resetWorkflow, setGarment, setResultImage } =
    useTryOnStore();
  const [saved, setSaved] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [showBagPicker, setShowBagPicker] = useState(false);
  const [showBagUpload, setShowBagUpload] = useState(false);
  const [bagJobId, setBagJobId] = useState<string | null>(null);
  const [pendingBag, setPendingBag] = useState<Garment | null>(null);
  const [addedBag, setAddedBag] = useState<Garment | null>(null);
  const [preBagImage, setPreBagImage] = useState<string | null>(null);

  if (!resultImage || !garment || !userImage) {
    return (
      <div className="container-FitnTry py-24">
        <EmptyState
          title="No look to show yet"
          description="Generate a virtual try-on first, then your result will appear here."
          actionLabel="Start a try-on"
          onAction={() => navigate("/try-on")}
        />
      </div>
    );
  }

  async function handleSave() {
    const look = await saveCurrentLook();
    if (look) {
      setSaved(true);
      push({ kind: "success", title: "Saved to My Looks", description: garment!.name });
    }
  }

  async function handleDownload() {
    if (!resultImage) return;
    setDownloading(true);
    try {
      const res = await fetch(resultImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FitnTry-${garment?.name?.replace(/\s+/g, "-").toLowerCase() ?? "look"}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Cross-origin images without permissive CORS headers can't be fetched
      // into a blob from the browser — fall back to opening it directly so
      // the person can still save it manually.
      window.open(resultImage, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  function handlePickBag(bag: Garment) {
    if (!resultImage) return;
    setShowBagPicker(false);
    setPendingBag(bag);
    setPreBagImage(resultImage);
    createTryOn({
      userImage: resultImage,
      garmentImage: bag.image,
      garmentCategory: "Bags",
      gender: bag.gender,
    })
      .then(({ jobId }) => setBagJobId(jobId))
      .catch(() => {
        setPendingBag(null);
        setPreBagImage(null);
        push({ kind: "error", title: "Couldn't add that bag", description: "Please try again." });
      });
  }

  function handleUploadOwnBag(file: File) {
    const validation = validateImageFile(file);
    if (validation) {
      push({ kind: "error", title: validation.message });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handlePickBag({
        id: `custom_bag_${Date.now()}`,
        name: "Your bag",
        category: "Bags",
        price: 0,
        image: reader.result as string,
        tag: "New",
      });
    };
    reader.readAsDataURL(file);
    setShowBagUpload(false);
  }

  function handleBagComplete(newResultImage: string) {
    setResultImage(newResultImage);
    setAddedBag(pendingBag);
    setBagJobId(null);
    setPendingBag(null);
    push({ kind: "success", title: "Bag added", description: pendingBag?.name });
  }

  function handleBagError(err: { message: string }) {
    setBagJobId(null);
    setPendingBag(null);
    setPreBagImage(null);
    push({ kind: "error", title: "Couldn't add that bag", description: err.message });
  }

  function handleRemoveBag() {
    if (preBagImage) setResultImage(preBagImage);
    setAddedBag(null);
    setPreBagImage(null);
  }

  function handleTryAnother() {
    resetWorkflow();
    navigate("/try-on");
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      push({ kind: "info", title: "Link copied", description: "Share your look with a friend." });
    } catch {
      push({ kind: "info", title: "Sharing isn't available on this device." });
    }
  }

  function handleRecommendationTryOn(item: RecommendationItem) {
    const full = garments.find((g) => g.id === item.id);
    if (full) setGarment(full);
    navigate("/try-on");
  }

  return (
    <div className="container-FitnTry py-10 sm:py-14">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Your result</p>
        <h1 className="font-display text-3xl sm:text-4xl">Your New Look</h1>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <div className="mx-auto w-full max-w-md animate-fade-up">
          <BeforeAfterSlider before={userImage} after={resultImage} />
          <p className="mt-3 text-center text-[12px] text-ink-faint">Drag to compare before and after</p>
        </div>

        <div className="animate-fade-up [animation-delay:100ms]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl">{garment.name}</h2>
              <p className="mt-1 text-[13px] text-ink-soft">
                {garment.category}
                {garment.colorway ? ` · ${garment.colorway}` : ""}
              </p>
            </div>
            {garment.price > 0 && (
              <span className="font-mono text-lg text-ink">{formatPrice(garment.price)}</span>
            )}
          </div>

          {style && (
            <div className="mt-3">
              <Badge variant="camel">{style}</Badge>
            </div>
          )}

          {addedBag && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="camel">+ {addedBag.name}</Badge>
              <button
                type="button"
                onClick={handleRemoveBag}
                className="text-[12px] text-ink-faint underline underline-offset-2 hover:text-ink"
              >
                Remove
              </button>
            </div>
          )}

          <div className="mt-7 grid grid-cols-2 gap-3">
            <Button onClick={handleSave} disabled={saved}>
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save Look"}
            </Button>
            <Button variant="secondary" onClick={handleTryAnother}>
              <RotateCcw className="h-4 w-4" /> Try Another
            </Button>
            <Button variant="ghost" onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4" /> {downloading ? "Downloading…" : "Download"}
            </Button>
            <Button variant="ghost" onClick={() => setShowBagPicker(true)}>
              <Layers className="h-4 w-4" /> {addedBag ? "Change Bag" : "Add a Bag"}
            </Button>
            <Button variant="ghost" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="ghost" onClick={() => navigate("/discover")}>
              <ShoppingBag className="h-4 w-4" /> Shop Similar
            </Button>
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <p className="mb-5 text-[13px] font-medium text-ink">Complete Your Look</p>
            <div className="grid grid-cols-2 gap-4">
              {recommendations.map((r) => (
                <RecommendationCard key={r.id} item={r} onTryOn={handleRecommendationTryOn} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showBagPicker && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowBagPicker(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-md bg-canvas p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl">Add a bag to this look</h3>
              <button type="button" onClick={() => setShowBagPicker(false)} aria-label="Close">
                <X className="h-5 w-5 text-ink-soft" />
              </button>
            </div>
            <GarmentGrid
              garments={bagCatalog}
              onSelect={handlePickBag}
              onUploadOwn={() => setShowBagUpload((v) => !v)}
            />
            {showBagUpload && (
              <div className="mt-6 max-w-md">
                <UploadDropzone onFile={handleUploadOwnBag} label="Upload your own bag photo" compact />
              </div>
            )}
          </div>
        </div>
      )}

      {bagJobId && pendingBag && (
        <ProcessingModal
          jobId={bagJobId}
          garmentImage={pendingBag.image}
          onComplete={handleBagComplete}
          onError={handleBagError}
        />
      )}
    </div>
  );
}
