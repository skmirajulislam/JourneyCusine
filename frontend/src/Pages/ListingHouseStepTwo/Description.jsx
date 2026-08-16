import { useState, useEffect } from "react";
import { useListingFlow } from "../../context/ListingFlowContext";
import { Sparkles } from "lucide-react";
import { PulseLoader } from "react-spinners";
import api from "../../backend";
import { toast } from "react-hot-toast";

const TONES = [
  { id: "culinary", label: "🍲 Culinary & Authentic", desc: "Focuses on dining, cooking, and food culture" },
  { id: "luxury", label: "💎 Luxury & Boutique", desc: "Elegant, serene, premium sanctuary tone" },
  { id: "cozy", label: "🌿 Cozy & Homestyle", desc: "Warm, family-friendly, relaxing retreat" },
  { id: "modern", label: "⚡ Modern & Adventurous", desc: "Sleek, tech-friendly, explorer hub" },
];

const Description = () => {
  const { newHouse, currentListingHouse, setNewHouse } = useListingFlow();
  const initialDesc = newHouse?.description || currentListingHouse?.description || "";

  const [description, setDescription] = useState(initialDesc);
  const [characterCount, setCharacterCount] = useState(initialDesc.length);
  const [selectedTone, setSelectedTone] = useState("culinary");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (initialDesc && !description) {
      setDescription(initialDesc);
      setCharacterCount(initialDesc.length);
    }
  }, [initialDesc, description]);

  const updateDescriptionState = (newVal) => {
    setNewHouse((prev) => ({
      ...prev,
      description: newVal,
    }));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    setCharacterCount(val.length);
    updateDescriptionState(val);
  };

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true);
      const res = await api.post("/ai/generate_description", {
        title: newHouse?.title || currentListingHouse?.title || "",
        houseType: newHouse?.houseType || currentListingHouse?.houseType || "Hotel",
        location: newHouse?.location || currentListingHouse?.location || "",
        amenities: newHouse?.amenities || currentListingHouse?.amenities || [],
        cuisineOfferings: newHouse?.cuisineOfferings || currentListingHouse?.cuisineOfferings || [],
        tone: selectedTone,
      });

      if (res.data?.success === 1 && res.data.description) {
        const generated = res.data.description;
        setDescription(generated);
        setCharacterCount(generated.length);
        updateDescriptionState(generated);
        toast.success("AI description generated and applied!");
      } else {
        toast.error("Failed to generate description");
      }
    } catch (err) {
      console.error("AI generator error:", err);
      toast.error("Error generating AI description");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-screen-sm mx-auto my-6 min-h-[80vh]">
      <div>
        <h1 className="text-[#222222] dark:text-white text-xl sm:text-2xl md:text-[32px] font-medium">
          Create your description
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#717171] dark:text-neutral-400 mt-1">
          Share what makes your place special, nearby attractions, and amenities.
        </p>
      </div>

      {/* AI Description Generator Assistant Card */}
      <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 dark:from-[#201518] dark:via-[#191919] dark:to-[#1a1715] shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#ff385c] text-white">
              <Sparkles size={14} />
            </div>
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              AI Description Generator
            </span>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ff385c] hover:bg-[#d90b63] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {isGenerating ? (
              <>
                <PulseLoader size={5} color="#fff" />
                <span>Writing...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Tone Selector Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTone(t.id)}
              className={`p-2 rounded-xl text-left text-xs font-semibold transition border cursor-pointer ${
                selectedTone === t.id
                  ? "bg-white dark:bg-[#252525] border-[#ff385c] text-[#ff385c] shadow-xs"
                  : "bg-white/50 dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
              }`}
            >
              <span className="block truncate">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <textarea
          className="w-full p-3.5 border-[#b0b0b0] dark:border-neutral-700 bg-white dark:bg-[#1f1f1f] text-[#111827] dark:text-white border-[1.3px] rounded-2xl focus:outline-none focus:border-black dark:focus:border-white transition-all shadow-xs"
          rows="8"
          value={description}
          onChange={handleInputChange}
          onBlur={() => updateDescriptionState(description)}
          placeholder="Write your house and motel stay description here (minimum 10 characters)..."
          maxLength={1600}
        />
        <div className="mt-2 mb-3 flex items-center justify-between">
          <span className="text-xs text-rose-500 font-medium">
            {(!description?.trim() || description.trim().length < 10) &&
              "Description must be at least 10 characters to proceed"}
          </span>
          <p
            className={`text-xs font-semibold ${
              characterCount >= 1600
                ? "text-red-500"
                : "text-[#717171] dark:text-neutral-400"
            }`}
          >
            {characterCount}/1600 characters
          </p>
        </div>
      </div>
    </div>
  );
};

export default Description;
