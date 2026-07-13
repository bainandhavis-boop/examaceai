import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  AiLoadingButtonContent,
  AiLoadingState,
} from "./AiLoadingState";
import { useAiLoadingPhase } from "../hooks/useAiLoadingPhase";
import { InlineError } from "./InlineError";
import {
  type AppErrorContent,
  ERROR_MESSAGES,
  resolveLiteratureError,
  showErrorToast,
  showValidationToast,
} from "../lib/errors";

const LITERATURE_LOADING_LABELS = {
  analyzing: "Analyzing Text...",
  generating: "Generating Explanation...",
} as const;

export function LiteratureTutor() {
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [topic, setTopic] = useState("");
  const {
    phase: loadingPhase,
    isLoading: isGenerating,
    startAnalyzing,
    startGenerating,
    stop: stopGenerating,
  } = useAiLoadingPhase();
  const [explanation, setExplanation] = useState("");
  const [explanationError, setExplanationError] = useState<AppErrorContent | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const literatureContent = useQuery(api.examFunctions.getLiteratureContent);
  const generateExplanation = useAction(api.aiActions.generateLiteratureExplanation);

  // Popular JAMB, WAEC, and NECO literature books
  const popularBooks = [
    "The Life Changer - Khadija Abubakar Jalli",
    "Purple Hibiscus - Chimamanda Ngozi Adichie",
    "Things Fall Apart - Chinua Achebe",
    "The Concubine - Elechi Amadi",
    "Faceless - Amma Darko",
    "Unexpected Joy at Dawn - Alex Agyei-Agyiri",
    "Hamlet - William Shakespeare",
    "Macbeth - William Shakespeare",
    "Romeo and Juliet - William Shakespeare",
  ];

  const handleGenerateExplanation = async () => {
    if (!selectedBook) {
      showValidationToast({
        title: "No book selected.",
        body: "Please choose a literature text before generating an explanation.",
      });
      return;
    }

    startAnalyzing();
    setExplanationError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      startGenerating();
      const result = await generateExplanation({
        bookTitle: selectedBook,
        chapter: selectedChapter || undefined,
        topic: topic || undefined,
      });
      
      setExplanation(result || "");
      toast.success("Explanation generated successfully!");
    } catch (error) {
      const content = resolveLiteratureError(error);
      setExplanationError(content);
      showErrorToast(content);
      console.error(error);
    } finally {
      stopGenerating();
    }
  };

  const handlePlayAudio = () => {
    if (!explanation) {
      showValidationToast({
        title: "No explanation yet.",
        body: "Generate an AI explanation first, then play it as audio.",
      });
      return;
    }

    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(explanation);
      utterance.rate = playbackSpeed;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error(ERROR_MESSAGES.audioPlayback.title, {
          description: ERROR_MESSAGES.audioPlayback.body,
        });
      };

      speechSynthesis.speak(utterance);
    } else {
      showErrorToast({
        title: "Audio isn't supported here.",
        body: "Your browser can't play audio explanations. Please read the text on screen.",
      });
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Voice-Enabled Literature Tutor</h1>
        <p className="text-gray-600">
          Get AI explanations of prescribed texts with audio playback
        </p>
      </div>

      {/* Book selection */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Select Literature Text</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book/Text
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              disabled={isGenerating}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select a book...</option>
              {popularBooks.map((book) => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter (Optional)
              </label>
              <input
                type="text"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                placeholder="e.g., Chapter 1, Act 1 Scene 1"
                disabled={isGenerating}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Topic (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Character analysis, Themes"
                disabled={isGenerating}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {explanationError && (
            <InlineError
              {...explanationError}
              onRetry={handleGenerateExplanation}
            />
          )}

          {isGenerating && loadingPhase && (
            <AiLoadingState phase={loadingPhase} labels={LITERATURE_LOADING_LABELS} />
          )}

          <button
            onClick={handleGenerateExplanation}
            disabled={isGenerating || !selectedBook}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating && loadingPhase ? (
              <AiLoadingButtonContent
                label={
                  loadingPhase === "analyzing"
                    ? LITERATURE_LOADING_LABELS.analyzing
                    : LITERATURE_LOADING_LABELS.generating
                }
              />
            ) : (
              "📚 Generate AI Explanation"
            )}
          </button>
        </div>
      </div>

      {/* Audio controls */}
      {explanation && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Audio Controls</h2>
          
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              onClick={isPlaying ? handleStopAudio : handlePlayAudio}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                isPlaying 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isPlaying ? "⏹️ Stop" : "▶️ Play"}
            </button>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Speed:</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="animate-pulse">🔊</div>
                <span className="text-sm">Playing...</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 Tip: Use headphones for better audio quality. You can adjust playback speed to match your learning pace.
            </p>
          </div>
        </div>
      )}

      {/* Explanation content */}
      {explanation && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">AI Literature Explanation</h2>
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {explanation}
            </div>
          </div>
        </div>
      )}

      {/* Popular texts showcase */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 Popular JAMB, WAEC & NECO Literature Texts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularBooks.slice(0, 6).map((book) => (
            <div key={book} className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">{book.split(' - ')[0]}</h4>
              <p className="text-sm text-gray-600">{book.split(' - ')[1]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎧 Literature Tutor Features</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <div>
                <h4 className="font-medium">Chapter-by-Chapter Analysis</h4>
                <p className="text-sm text-gray-600">Detailed breakdown of each chapter with key points</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <div>
                <h4 className="font-medium">Character Analysis</h4>
                <p className="text-sm text-gray-600">In-depth character studies and relationships</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <div>
                <h4 className="font-medium">Theme Exploration</h4>
                <p className="text-sm text-gray-600">Major themes and their significance</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <div>
                <h4 className="font-medium">Audio Playback</h4>
                <p className="text-sm text-gray-600">Listen to explanations with adjustable speed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <div>
                <h4 className="font-medium">Exam-Focused Content</h4>
                <p className="text-sm text-gray-600">Tailored for JAMB, WAEC, and NECO requirements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600">✓</span>
              <div>
                <h4 className="font-medium">Simple Language</h4>
                <p className="text-sm text-gray-600">Easy-to-understand explanations for students</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
