
import { useCallback } from 'react';
import { AnalysisResults, AudioTranscription, InventionAsset, InventionState, MostRecentGeneration } from './types';
import { saveInventionToDatabase, loadInventionFromDatabase } from './inventionUtils';

export const useInventionActions = (
  state: InventionState,
  setState: React.Dispatch<React.SetStateAction<InventionState>>
) => {
  const updateTitle = useCallback((title: string) => {
    setState((prevState) => ({ ...prevState, title }));
  }, [setState]);

  const updateDescription = useCallback((description: string | ((prev: string) => string)) => {
    setState((prevState) => {
      const newDescription = typeof description === 'function' 
        ? description(prevState.description)
        : description;
      return { ...prevState, description: newDescription };
    });
  }, [setState]);

  const updateSketchData = useCallback((sketchDataUrl: string | null) => {
    setState((prevState) => ({ ...prevState, sketchDataUrl }));
  }, [setState]);

  const addAsset = useCallback((asset: InventionAsset) => {
    setState((prevState) => ({
      ...prevState,
      assets: [...prevState.assets, asset],
    }));
  }, [setState]);

  const removeAsset = useCallback((assetId: string) => {
    setState((prevState) => ({
      ...prevState,
      assets: prevState.assets.filter((asset) => asset.id !== assetId),
    }));
  }, [setState]);

  const update3DVisualization = useCallback((visualization3dUrl: string | null) => {
    setState((prevState) => ({ ...prevState, visualization3dUrl }));
  }, [setState]);

  const updateVisualizationPrompts = useCallback(
    (visualizationPrompts: Record<string, string>) => {
      setState((prevState) => ({ ...prevState, visualizationPrompts }));
    },
    [setState]
  );

  const updateThreejsCode = useCallback((code: string | null) => {
    setState((prevState) => ({
      ...prevState,
      threejsVisualization: { ...prevState.threejsVisualization, code },
    }));
  }, [setState]);

  const updateThreejsHtml = useCallback((html: string | null) => {
    setState((prevState) => ({
      ...prevState,
      threejsVisualization: { ...prevState.threejsVisualization, html },
    }));
  }, [setState]);

  const setBusinessStrategySvg = useCallback((svg: string | null) => {
    setState((prevState) => ({ ...prevState, businessStrategySvg: svg }));
  }, [setState]);

  const setAnalysisResults = useCallback((results: AnalysisResults) => {
    setState((prevState) => ({
      ...prevState,
      analysisResults: results,
    }));
  }, [setState]);

  const addAnalysisResult = useCallback(
    (type: keyof AnalysisResults, result: string) => {
      setState((prevState) => ({
        ...prevState,
        analysisResults: {
          ...prevState.analysisResults,
          [type]: [...prevState.analysisResults[type], result],
        },
      }));
    },
    [setState]
  );

  const clearAnalysisResults = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      analysisResults: {
        technical: [],
        market: [],
        legal: [],
        business: [],
      },
    }));
  }, [setState]);

  const addAudioTranscription = useCallback((transcription: AudioTranscription) => {
    setState((prevState) => ({
      ...prevState,
      audioTranscriptions: [...prevState.audioTranscriptions, transcription],
    }));
  }, [setState]);
  
  // Update the state with the most recent generation
  const setMostRecentGeneration = useCallback((generation: MostRecentGeneration) => {
    setState(prevState => ({
      ...prevState,
      mostRecentGeneration: generation
    }));
  }, [setState]);
  
  // Update the most recent generation with new data
  const updateMostRecentGeneration = useCallback((generation: any) => {
    const newGeneration: MostRecentGeneration = {
      id: `generation-${Date.now()}`,
      type: generation.type || 'other',
      name: generation.name || 'Generated Content',
      createdAt: generation.timestamp || Date.now(),
      data: generation.data || null
    };
    
    setState(prevState => ({
      ...prevState,
      mostRecentGeneration: newGeneration
    }));
  }, [setState]);

  const resetState = useCallback((initialState: InventionState) => {
    setState(initialState);
  }, [setState]);

  // Function to save the invention to the database
  const saveToDatabase = useCallback(async (showToast: boolean = true): Promise<string | null> => {
    const inventionId = await saveInventionToDatabase(state, showToast);
    
    if (inventionId) {
      setState((prevState) => ({ 
        ...prevState, 
        savedToDatabase: true, 
        inventionId 
      }));
      return inventionId;
    }
    
    return null;
  }, [state, setState]);

  // Function to load an invention from the database
  const loadInvention = useCallback(async (id: string) => {
    const loadedState = await loadInventionFromDatabase(id);
    
    if (loadedState) {
      setState(loadedState);
    }
  }, [setState]);

  return {
    updateTitle,
    updateDescription,
    updateSketchData,
    addAsset,
    removeAsset,
    update3DVisualization,
    updateVisualizationPrompts,
    saveToDatabase,
    loadInvention,
    resetState,
    updateThreejsCode,
    updateThreejsHtml,
    setBusinessStrategySvg,
    setAnalysisResults,
    addAnalysisResult,
    clearAnalysisResults,
    addAudioTranscription,
    setMostRecentGeneration,
    updateMostRecentGeneration,
  };
};
