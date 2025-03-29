
export interface VisualizationRequest {
  title?: string;
  description?: string;
  sketchDataUrl?: string | null;
  prompt?: string;
  userId?: string;
}

export interface VisualizationResult {
  dataUrl: string | null;
  storageUrl: string | null;
  type: string;
  error?: string;
  svg?: string | null;
  svgCode?: string | null;
}
