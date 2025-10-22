

export interface DownloadLink {
  quality: string;
  url: string;
  size: string;
}

export interface VideoInfo {
  title: string;
  thumbnailUrl: string;
  downloadLinks: DownloadLink[];
}

export interface EditTurn {
  id: number;
  originalUrl: string; // The first image of this "turn chain"
  sourceUrl: string;   // The image right before this specific edit
  prompt: string;
  editedUrl: string;
  referenceImageUrls: string[];
}
