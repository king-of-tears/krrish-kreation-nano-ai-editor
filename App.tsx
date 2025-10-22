import React, { useState, useCallback, useRef, useEffect } from 'react';
import { editImage, fileToGenerativePart } from './services/geminiService';
import { ImageUploader, ImageUploaderRef } from './components/ImageUploader';
import { ResultView } from './components/ResultView';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { GithubIcon } from './components/icons/GithubIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { HomePage } from './components/HomePage';
import { DropdownMenu } from './components/DropdownMenu';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { PaintBrushIcon } from './components/icons/PaintBrushIcon';
import { backgroundOptions } from './assets/backgroundImages';
import { ReferenceImages } from './components/ReferenceImages';
import { Modal } from './components/Modal';
import { LockIcon } from './components/icons/LockIcon';
import * as historyService from './services/historyService';
import type { EditTurn } from './types';
import { PlusCircleIcon } from './components/icons/PlusCircleIcon';
import { ChatIcon } from './components/icons/ChatIcon';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import { MailIcon } from './components/icons/MailIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { PaperAirplaneIcon } from './components/icons/PaperAirplaneIcon';
import { SparkleEffect } from './components/SparkleEffect';
import { FullscreenIcon } from './components/icons/FullscreenIcon';


interface ReferenceImage {
    id: number;
    file: File;
    url: string;
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const mimeType = blob.type || 'image/png';
  return new File([blob], fileName, { type: mimeType });
}

const App: React.FC = () => {
  const [page, setPage] = useState<'home' | 'editor' | 'generator'>('home');
  const [history, setHistory] = useState<EditTurn[]>(() => historyService.getHistory());
  const [prompt, setPrompt] = useState<string>('');
  const [initialImageForSession, setInitialImageForSession] = useState<{ file: File; url: string } | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFeatureInDevModalOpen, setIsFeatureInDevModalOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [backgroundId, setBackgroundId] = useState<string>('default');
  const [isRequestingNewImage, setIsRequestingNewImage] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageUploaderRef = useRef<ImageUploaderRef>(null);
  
  useEffect(() => {
    historyService.saveHistory(history);
  }, [history]);

  useEffect(() => {
    // Restore session on initial load if history exists
    if (history.length > 0 && !initialImageForSession) {
      const lastTurn = history[history.length - 1];
      // A simple heuristic to guess the mode. If sourceUrl and editedUrl are same, it was likely a generation task.
      const restoredPage = lastTurn.sourceUrl === lastTurn.editedUrl && !lastTurn.referenceImageUrls.length ? 'generator' : 'editor';
      
      const restoreSession = async () => {
        try {
          // In editor mode, we restore the original session image
          if (restoredPage === 'editor') {
            const file = await dataUrlToFile(lastTurn.originalUrl, `restored-session-image.png`);
            setInitialImageForSession({ file, url: lastTurn.originalUrl });
          }
          setPage(restoredPage); 
        } catch (err) {
          console.error("Failed to restore session image:", err);
          handleResetSession();
        }
      };
      restoreSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (page === 'editor' && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [history, isLoading, page, initialImageForSession]);

  useEffect(() => {
    if (isRequestingNewImage && imageUploaderRef.current) {
      imageUploaderRef.current.open();
      setIsRequestingNewImage(false);
    }
  }, [isRequestingNewImage]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setInitialImageForSession({ file, url: dataUrl });
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmitPrompt = async () => {
    if (!prompt) {
      setError("Please provide a prompt.");
      return;
    }
    
    if (page === 'editor' && !initialImageForSession) {
      setError("Something went wrong, the main image is missing.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let sourceImage: { file: File; url: string } | null = null;
      const lastTurn = history.length > 0 ? history[history.length - 1] : null;
      
      if (page === 'editor' && initialImageForSession) {
        if (!lastTurn || lastTurn.originalUrl !== initialImageForSession.url) {
            sourceImage = initialImageForSession;
        } else {
            const file = await dataUrlToFile(lastTurn.editedUrl, `edited-image-${history.length}.png`);
            sourceImage = { file: file, url: lastTurn.editedUrl };
        }
      } else if (page === 'generator' && lastTurn) {
        const file = await dataUrlToFile(lastTurn.editedUrl, `edited-image-${history.length}.png`);
        sourceImage = { file: file, url: lastTurn.editedUrl };
      }

      const imageFiles = [
        ...(sourceImage ? [sourceImage.file] : []),
        ...referenceImages.map(img => img.file)
      ];
      const imageParts = await Promise.all(imageFiles.map(fileToGenerativePart));

      const resultBase64 = await editImage(imageParts, prompt);
      const editedUrl = `data:image/png;base64,${resultBase64}`;

      const newTurn: EditTurn = {
        id: Date.now(),
        originalUrl: page === 'editor' ? initialImageForSession!.url : (lastTurn ? lastTurn.originalUrl : editedUrl),
        sourceUrl: sourceImage ? sourceImage.url : editedUrl, // If no source, source is the same as result
        prompt: prompt,
        editedUrl: editedUrl,
        referenceImageUrls: referenceImages.map(img => img.url),
      };

      setHistory(prev => [...prev, newTurn]);
      setReferenceImages([]);
      setPrompt('');

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddReferenceImages = (files: FileList) => {
    const filesArray = Array.from(files);
    if (filesArray.length === 0) return;

    const newImages: ReferenceImage[] = [];
    let processedCount = 0;

    filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            newImages.push({
                id: Date.now() + Math.random(),
                file,
                url: dataUrl
            });
            processedCount++;
            if (processedCount === filesArray.length) {
                setReferenceImages(prev => [...prev, ...newImages]);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const handleRemoveReferenceImage = (id: number) => {
      setReferenceImages(prev => prev.filter(image => image.id !== id));
  };

  const handleResetSession = () => {
    setHistory([]);
    setInitialImageForSession(null);
    setReferenceImages([]);
    setPrompt('');
    setIsLoading(false);
    setError(null);
    resultRefs.current = [];
    historyService.clearHistory();
  };

  const handleStartNew = () => {
    handleResetSession();
    setPage('home');
  };
  
  const handleStartEditing = () => {
    handleResetSession();
    setPage('editor');
  };

  const handleStartGenerating = () => {
    handleResetSession();
    setPage('generator');
  };

  const handleNewImageTurn = () => {
    setInitialImageForSession(null);
    setReferenceImages([]);
    setPrompt('');
    setIsLoading(false);
    setError(null);
    setIsRequestingNewImage(true);
  };

  const handleCycleBackground = () => {
    const currentIndex = backgroundOptions.findIndex(opt => opt.id === backgroundId);
    const nextIndex = (currentIndex + 1) % backgroundOptions.length;
    setBackgroundId(backgroundOptions[nextIndex].id);
    setIsMenuOpen(false);
  };
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('Krrish123a@gmail.com').then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderContent = () => {
    const groupedTurns: { originalUrl: string, turns: EditTurn[] }[] = [];
    history.forEach(turn => {
        const lastGroup = groupedTurns[groupedTurns.length - 1];
        if (!lastGroup || lastGroup.originalUrl !== turn.originalUrl) {
            groupedTurns.push({ originalUrl: turn.originalUrl, turns: [turn] });
        } else {
            lastGroup.turns.push(turn);
        }
    });

    const lastGroup = groupedTurns.length > 0 ? groupedTurns[groupedTurns.length - 1] : null;
    const isCurrentSessionImageAlreadyDisplayed = lastGroup && initialImageForSession && lastGroup.originalUrl === initialImageForSession.url;

    return (
      <>
        {groupedTurns.map((group) => (
            <React.Fragment key={group.originalUrl}>
                {page === 'editor' && (
                  <div className="w-full max-w-2xl mx-auto bg-gray-800/20 backdrop-blur-lg border border-gray-700 rounded-xl p-4 shadow-xl relative group">
                      <div className="text-sm font-semibold text-gray-400 mb-2">Main Image</div>
                      <img src={group.originalUrl} alt="Initial image for session" className="w-full h-auto object-contain rounded-lg" />
                  </div>
                )}
                {group.turns.map((turn) => {
                    const globalIndex = history.findIndex(h => h.id === turn.id);
                    return (
                        <ResultView
                            ref={el => resultRefs.current[globalIndex] = el}
                            key={turn.id}
                            original={turn.sourceUrl}
                            edited={turn.editedUrl} 
                            prompt={turn.prompt}
                            isLast={globalIndex === history.length - 1}
                            referenceImageUrls={turn.referenceImageUrls}
                            onAddNewMainImage={page === 'editor' ? handleNewImageTurn : undefined}
                        />
                    );
                })}
            </React.Fragment>
        ))}

        {page === 'editor' && initialImageForSession && !isCurrentSessionImageAlreadyDisplayed && (
            <div className="w-full max-w-2xl mx-auto bg-gray-800/20 backdrop-blur-lg border border-gray-700 rounded-xl p-4 shadow-xl relative group animate-fade-in">
                <div className="text-sm font-semibold text-gray-400 mb-2">Main Image</div>
                <img src={initialImageForSession.url} alt="Initial image for session" className="w-full h-auto object-contain rounded-lg" />
            </div>
        )}

        {page === 'editor' && !initialImageForSession && (
          <div className="flex-grow flex items-center justify-center relative">
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] max-w-2xl max-h-2xl -z-10 opacity-30 blur-3xl"
                style={{
                  backgroundImage: 'radial-gradient(circle at 15% 50%, #2dd4bf 0%, transparent 40%), radial-gradient(circle at 85% 30%, #38bdf8 0%, transparent 40%), radial-gradient(circle at 50% 80%, #a78bfa 0%, transparent 40%)'
                }}
            ></div>
            <ImageUploader ref={imageUploaderRef} onImageUpload={handleImageUpload} />
          </div>
        )}

        {page === 'generator' && history.length === 0 && !isLoading && (
          <div className="flex-grow flex items-center justify-center text-center text-gray-400">
            <div className="max-w-md p-4">
              <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-200 mb-2">Image Generation Chat</h2>
              <p>
                Use the input below to generate an image from a text prompt. You can also add reference images to guide the AI.
              </p>
            </div>
          </div>
        )}

        {isLoading && <Loader message={history.length === 0 && page === 'generator' ? "Generating your image..." : "AI is editing your image..."} />}
        {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-md self-center">{error}</p>}
      </>
    );
  };
  
  const showInputArea = (page === 'editor' && !!initialImageForSession) || page === 'generator';
  const currentBackground = backgroundOptions.find(opt => opt.id === backgroundId) || backgroundOptions[0];
  const isImageBg = currentBackground.type === 'image';
  const backgroundClass = !isImageBg ? currentBackground.value : '';
  const backgroundStyle = isImageBg ? { 
      backgroundImage: `url(${currentBackground.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
  } : {};

  return (
    <div className="relative h-screen font-sans">
      <SparkleEffect />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950/20 to-gray-900 -z-20"></div>
      <Modal
          isOpen={isFeatureInDevModalOpen}
          onClose={() => setIsFeatureInDevModalOpen(false)}
          title="Feature In Development"
        >
          <p>This feature is still in development.</p>
      </Modal>
      <Modal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          title="Get Help & Share Feedback"
        >
          <div className="space-y-6">
            <p className="text-gray-400">
              If you encounter any issues, have questions, or want to provide feedback, please feel free to reach out. We're here to help!
            </p>
            <div>
              <p className="text-sm font-semibold text-gray-300 mb-2">Contact Support</p>
              <div className="relative bg-gray-900/50 rounded-lg border border-gray-700 p-3 flex items-center justify-between">
                <span className="font-mono text-teal-400">Krrish123a@gmail.com</span>
                <button
                    onClick={handleCopyEmail}
                    className="p-2 rounded-md hover:bg-gray-700/70 transition-colors text-gray-400 hover:text-white"
                    aria-label="Copy email"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                </button>
              </div>
              <a
                href="mailto:Krrish123a@gmail.com"
                className="mt-3 w-full flex items-center justify-center gap-3 p-3 text-center rounded-lg transition-all duration-300 text-white font-semibold bg-purple-600 hover:bg-purple-700 transform hover:scale-105"
              >
                <MailIcon className="w-5 h-5" />
                <span>Compose an Email</span>
              </a>
            </div>

            <div className="my-6 border-t border-gray-700/60"></div>

            <div>
              <p className="text-sm font-semibold text-gray-300 mb-2">Share Feedback</p>
              <p className="text-xs text-gray-500 mb-3">Your feedback is valuable for improving this application.</p>
              <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you think..."
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                  rows={4}
              />
              <a
                  href={`mailto:Krrish123a@gmail.com?subject=Feedback for AI Image Editor&body=${encodeURIComponent(feedbackText)}`}
                  onClick={(e) => {
                      if (!feedbackText) {
                          e.preventDefault();
                      }
                  }}
                  className={`mt-3 w-full flex items-center justify-center gap-3 p-3 text-center rounded-lg transition-all duration-300 text-white font-semibold transform hover:scale-105 ${
                      !feedbackText
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-700'
                  }`}
                  aria-disabled={!feedbackText}
              >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Send Feedback</span>
              </a>
            </div>
          </div>
        </Modal>
      <div className="h-full flex flex-col">
        <header className="relative flex-shrink-0 p-4 flex justify-between items-center bg-gray-900/60 backdrop-blur-md border-b border-purple-500/20 z-20">
          <div className="flex items-center gap-2">
              <button 
                  onClick={handleToggleFullscreen}
                  className="p-2 rounded-full hover:bg-purple-500/20 transition-colors"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                  <FullscreenIcon isFullscreen={isFullscreen} className="w-6 h-6 text-gray-400" />
              </button>
              {page === 'home' && (
                  <button
                      onClick={() => setIsHelpModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg transition-all text-gray-300 hover:bg-white/20 hover:border-white/30"
                      aria-label="Get help and feedback"
                  >
                      <ChatIcon className="w-6 h-6" />
                      <span className="text-sm font-semibold">Get Help/Feedback</span>
                  </button>
              )}
              {(page === 'editor' || page === 'generator') && (
                <div className="relative">
                  <button 
                      onClick={() => setIsMenuOpen(prev => !prev)}
                      className="p-2 rounded-full hover:bg-purple-500/20 transition-colors"
                      aria-label="Open menu"
                  >
                      <MenuIcon className="w-6 h-6 text-gray-400" />
                  </button>
                  <DropdownMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
                    <li>
                      <button
                        onClick={() => { handleStartNew(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-gray-700/70 transition-colors text-gray-300 hover:text-white"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Start New Chat</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => { setIsFeatureInDevModalOpen(true); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 p-2 text-left rounded-md text-gray-500 cursor-not-allowed"
                      >
                        <HistoryIcon className="w-5 h-5" />
                        <span className="flex-grow">View History</span>
                        <LockIcon className="w-4 h-4 text-white" />
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleCycleBackground}
                        className="w-full flex items-center gap-3 p-2 text-left rounded-md hover:bg-gray-700/70 transition-colors text-gray-300 hover:text-white"
                      >
                        <PaintBrushIcon className="w-5 h-5" />
                        <span>Change Background</span>
                      </button>
                    </li>
                  </DropdownMenu>
                </div>
              )}
          </div>

          <div className="flex items-center gap-4">
              {(page === 'editor' || page === 'generator') && (
                <button onClick={handleStartNew} className="text-gray-400 hover:text-pink-300 transition-colors text-sm font-semibold">
                    Start New
                </button>
              )}
              <a href="https://github.com/google/aistudio-apps" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <GithubIcon className="w-6 h-6" />
              </a>
          </div>
        </header>
        
        {page === 'home' && <HomePage onStartEditing={handleStartEditing} onStartGenerating={handleStartGenerating} />}
        
        {(page === 'editor' || page === 'generator') && (
            <main 
                ref={chatContainerRef}
                style={backgroundStyle}
                className={`flex-1 min-h-0 flex flex-col w-full overflow-y-auto p-4 space-y-8 transition-colors duration-500 ${backgroundClass} ${isImageBg ? 'bg-black/40 bg-blend-multiply' : ''}`}
            >
                {renderContent()}
            </main>
        )}

        {showInputArea && (
          <div className="flex-shrink-0 p-4 bg-gray-950/70 backdrop-blur-md border-t border-purple-500/20 z-10">
              <div className="w-full max-w-2xl mx-auto">
                  <ReferenceImages 
                    images={referenceImages} 
                    onAddImages={handleAddReferenceImages} 
                    onRemoveImage={handleRemoveReferenceImage}
                  />
                  <div className="relative">
                      <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder={history.length === 0 ? "Describe the image you want to generate..." : "Describe an edit..."}
                          className="w-full p-3 pr-28 bg-gray-800 border border-purple-500/40 rounded-md focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                          rows={2}
                          onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  if(!isLoading) handleSubmitPrompt();
                              }
                          }}
                      />
                      <button
                          onClick={handleSubmitPrompt}
                          disabled={isLoading || !prompt}
                          className="absolute right-2 top-1/2 -translate-y-1/2 group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-100 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed disabled:scale-100"
                          >
                          <SparklesIcon className="w-5 h-5" />
                          {history.length === 0 ? 'Generate' : 'Edit'}
                      </button>
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add fade-in animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  @keyframes rainbow-glow {
    0% { filter: drop-shadow(0 0 5px hsl(0, 100%, 70%)) drop-shadow(0 0 10px hsl(0, 100%, 70%)); }
    16% { filter: drop-shadow(0 0 5px hsl(60, 100%, 70%)) drop-shadow(0 0 10px hsl(60, 100%, 70%)); }
    33% { filter: drop-shadow(0 0 5px hsl(120, 100%, 70%)) drop-shadow(0 0 10px hsl(120, 100%, 70%)); }
    50% { filter: drop-shadow(0 0 5px hsl(180, 100%, 70%)) drop-shadow(0 0 10px hsl(180, 100%, 70%)); }
    66% { filter: drop-shadow(0 0 5px hsl(240, 100%, 70%)) drop-shadow(0 0 10px hsl(240, 100%, 70%)); }
    83% { filter: drop-shadow(0 0 5px hsl(300, 100%, 70%)) drop-shadow(0 0 10px hsl(300, 100%, 70%)); }
    100% { filter: drop-shadow(0 0 5px hsl(360, 100%, 70%)) drop-shadow(0 0 10px hsl(360, 100%, 70%)); }
  }
  .logo-rainbow-glow {
      animation: rainbow-glow 5s linear infinite;
  }
  @keyframes rainbow-text-glow-anim {
    0% { text-shadow: 0 0 5px hsl(204, 96%, 54%), 0 0 10px hsl(204, 96%, 54%), 0 0 15px hsl(204, 96%, 54%); }
    33% { text-shadow: 0 0 5px hsl(217, 91%, 60%), 0 0 10px hsl(217, 91%, 60%), 0 0 15px hsl(217, 91%, 60%); }
    66% { text-shadow: 0 0 5px hsl(190, 78%, 52%), 0 0 10px hsl(190, 78%, 52%), 0 0 15px hsl(190, 78%, 52%); }
    100% { text-shadow: 0 0 5px hsl(204, 96%, 54%), 0 0 10px hsl(204, 96%, 54%), 0 0 15px hsl(204, 96%, 54%); }
  }
  .rainbow-text-glow {
      animation: rainbow-text-glow-anim 5s linear infinite;
  }
  @keyframes animated-gradient {
    0% { background-position: 0% 50%; }
    25% { background-position: 50% 0%; }
    50% { background-position: 100% 50%; }
    75% { background-position: 50% 100%; }
    100% { background-position: 0% 50%; }
  }
  .animated-gradient-background {
    background: linear-gradient(135deg, #020617, #1e3a8a, #3b82f6);
    background-size: 400% 400%;
    animation: animated-gradient 15s ease infinite;
  }
  /* NEW CSS FOR LOADER */
  @keyframes simple-spin-anim {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { filter: drop-shadow(0 0 3px #c084fc) drop-shadow(0 0 6px #c084fc); }
    50% { filter: drop-shadow(0 0 6px #c084fc) drop-shadow(0 0 12px #c084fc); }
  }
  .simple-spinner {
    border: 4px solid rgba(192, 132, 252, 0.2);
    border-top-color: #c084fc;
    border-radius: 50%;
    animation: simple-spin-anim 1s linear infinite, pulse-glow 2s ease-in-out infinite;
  }
  .rainbow-text {
    background: linear-gradient(90deg, #38bdf8, #60a5fa, #93c5fd, #60a5fa, #38bdf8);
    background-size: 400% 400%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: animated-gradient 6s linear infinite;
  }
  .loader-rainbow-glow {
    animation: rainbow-glow 4s linear infinite;
  }
  /* NEW ICON ANIMATION */
  @keyframes icon-gradient-anim {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-icon-gradient {
    background-size: 200% 200%;
    animation: icon-gradient-anim 3s ease-in-out infinite;
  }
  /* NEW SPARKLE CSS */
  @keyframes sparkle-fly {
    0% {
      transform: scale(0) rotate(0deg);
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      transform: scale(1.5) rotate(120deg);
      opacity: 0;
    }
  }
  .sparkle-anim {
    animation: sparkle-fly 0.7s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default App;
