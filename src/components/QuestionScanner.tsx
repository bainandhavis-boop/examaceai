import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function QuestionScanner() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [subject, setSubject] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.examFunctions.generateUploadUrl);
  const analyzeQuestion = useAction(api.aiActions.analyzeScannedQuestion);

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English Language",
    "Economics", "Government", "Geography", "Literature", "Further Mathematics"
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload image
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await uploadResult.json();

      // Step 3: Analyze with AI
      const analysisResult = await analyzeQuestion({
        imageId: storageId,
        subject: subject || undefined,
      });

      setResult(analysisResult);
      toast.success("Question analyzed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze question. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Snap & Solve</h1>
        <p className="text-gray-600">
          Take a photo of any question and get instant AI-powered solutions
        </p>
      </div>

      {/* Image upload section */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8">
        <div className="text-center">
          {selectedImage ? (
            <div className="space-y-4">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected question"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-sm text-gray-600">
                {selectedImage.name} ({Math.round(selectedImage.size / 1024)}KB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">📸</div>
              <p className="text-lg text-gray-600">
                Upload or take a photo of your question
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={handleTakePhoto}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📷 Take Photo
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📁 Upload Image
          </button>
        </div>
      </div>

      {/* Subject selection */}
      {selectedImage && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Subject (Optional - helps improve accuracy)
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Auto-detect subject</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing Question...
              </div>
            ) : (
              "🤖 Analyze with AI"
            )}
          </button>
        </div>
      )}

      {/* Results section */}
      {result && (
        <div className="bg-white border rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Solution</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Question</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{result.extractedText}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Subject</h3>
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {result.subject}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Step-by-Step Solution</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap text-gray-700">{result.solution}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Final Answer</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-semibold">{result.finalAnswer}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Confidence: {Math.round(result.confidence * 100)}%</span>
              <span>Powered by ExamAce AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Tips section */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 Tips for Better Results</h3>
        <ul className="space-y-2 text-blue-800">
          <li>• Ensure the question text is clearly visible and well-lit</li>
          <li>• Include any diagrams or figures in the photo</li>
          <li>• Select the correct subject for more accurate solutions</li>
          <li>• For handwritten questions, write clearly</li>
        </ul>
      </div>
    </div>
  );
}
