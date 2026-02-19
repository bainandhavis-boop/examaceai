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

  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [pdfExamType, setPdfExamType] = useState<"JAMB" | "WAEC" | "ICAN" | "TRCN">("JAMB");
  const [pdfSubject, setPdfSubject] = useState("Mathematics");
  const [pdfYear, setPdfYear] = useState(new Date().getFullYear());
  const [useYearRange, setUseYearRange] = useState(false);
  const [pdfStartYear, setPdfStartYear] = useState(2000);
  const [pdfEndYear, setPdfEndYear] = useState(new Date().getFullYear());
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState<{ count: number } | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.examFunctions.generateUploadUrl);
  const analyzeQuestion = useAction(api.aiActions.analyzeScannedQuestion);
  const processPdf = useAction(api.aiActions.processPdfPastQuestions);

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

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("PDF size should be less than 10MB");
        return;
      }
      setSelectedPdf(file);
      setPdfResult(null);
    }
  };

  const handleProcessPdf = async () => {
    if (!selectedPdf) {
      toast.error("Please select a PDF first");
      return;
    }
    if (useYearRange) {
      if (pdfStartYear > pdfEndYear) {
        toast.error("Start year must be less than or equal to end year");
        return;
      }
      if (!pdfStartYear || !pdfEndYear) {
        toast.error("Please provide both start and end years");
        return;
      }
    } else {
      if (!pdfYear || pdfYear < 1980 || pdfYear > 2030) {
        toast.error("Please provide a valid year (1980-2030)");
        return;
      }
    }
    setIsProcessingPdf(true);
    setPdfResult(null);
    try {
      const uploadUrl = await generateUploadUrl();
      const uploadResult = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: selectedPdf,
      });
      if (!uploadResult.ok) throw new Error("Failed to upload PDF");
      const { storageId } = await uploadResult.json();
      const res = await processPdf({
        pdfStorageId: storageId,
        examType: pdfExamType,
        subject: pdfSubject,
        year: useYearRange ? undefined : pdfYear,
        startYear: useYearRange ? pdfStartYear : undefined,
        endYear: useYearRange ? pdfEndYear : undefined,
      });
      setPdfResult({ count: res.count });
      toast.success(`Added ${res.count} questions to the question bank!`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to process PDF");
    } finally {
      setIsProcessingPdf(false);
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

      {/* PDF upload for past questions */}
      <div className="border-t pt-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Past Questions (PDF)</h2>
        <p className="text-gray-600 mb-6">
          Upload a PDF of past questions (JAMB, WAEC, etc.) and we&apos;ll extract the questions into your question bank for mock exams.
        </p>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfSelect}
            className="hidden"
          />
          {selectedPdf ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-700">
                {selectedPdf.name} ({Math.round(selectedPdf.size / 1024)}KB)
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select
                      value={pdfExamType}
                      onChange={(e) => setPdfExamType(e.target.value as typeof pdfExamType)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="JAMB">JAMB</option>
                      <option value="WAEC">WAEC</option>
                      <option value="ICAN">ICAN</option>
                      <option value="TRCN">TRCN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={pdfSubject}
                      onChange={(e) => setPdfSubject(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useYearRange"
                    checked={useYearRange}
                    onChange={(e) => setUseYearRange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="useYearRange" className="text-sm font-medium text-gray-700">
                    This PDF contains questions from multiple years (e.g., 1983-2024)
                  </label>
                </div>

                {useYearRange ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                      <input
                        type="number"
                        value={pdfStartYear}
                        onChange={(e) => setPdfStartYear(parseInt(e.target.value, 10) || pdfStartYear)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        min={1980}
                        max={2030}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                      <input
                        type="number"
                        value={pdfEndYear}
                        onChange={(e) => setPdfEndYear(parseInt(e.target.value, 10) || pdfEndYear)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        min={1980}
                        max={2030}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      value={pdfYear}
                      onChange={(e) => setPdfYear(parseInt(e.target.value, 10) || pdfYear)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      min={1990}
                      max={2030}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleProcessPdf}
                  disabled={isProcessingPdf}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessingPdf ? "Processing…" : "Extract & Add Questions"}
                </button>
                <button
                  onClick={() => {
                    setSelectedPdf(null);
                    pdfInputRef.current?.value && (pdfInputRef.current.value = "");
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Change file
                </button>
              </div>
              {pdfResult && (
                <p className="text-green-700 font-medium">
                  ✓ {pdfResult.count} questions added to the bank. You can use them in Mock Exams.
                </p>
              )}
            </div>
          ) : (
            <div
              onClick={() => pdfInputRef.current?.click()}
              className="text-center py-8 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="text-5xl mb-2">📄</div>
              <p className="text-gray-600">Click or drag to upload a PDF</p>
              <p className="text-sm text-gray-500 mt-1">Max 10MB. Text-based PDFs work best.</p>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Works best with digital/text PDFs. Scanned PDFs may need conversion to images first (use Snap & Solve per page).
        </p>
      </div>
    </div>
  );
}
