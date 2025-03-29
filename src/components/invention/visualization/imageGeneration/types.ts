
import { VisualizationRequest, VisualizationResult } from "../types";

export type ImageGenerationType = 'marketing' | 'realistic' | 'custom-marketing';

export interface ImageGenerationRequest extends VisualizationRequest {
  style?: string;
}

export interface ImageGenerationResult extends VisualizationResult {
  isFallback?: boolean;
}
