
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pen, Eraser, UndoIcon, RedoIcon, Download, FileUp, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface SketchCanvasProps {
  onSketchSave?: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export const SketchCanvas = ({ onSketchSave, width = 800, height = 600 }: SketchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [drawingMode, setDrawingMode] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width,
      height,
      backgroundColor: "#F5F1E6",
    });
    
    // Set up drawing brush
    fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
    fabricCanvas.freeDrawingBrush.color = "#4A3C31";
    fabricCanvas.freeDrawingBrush.width = 3;
    
    // Track drawing state to ensure lines remain visible
    fabricCanvas.on('mouse:down', () => {
      setIsDrawing(true);
    });
    
    fabricCanvas.on('mouse:up', () => {
      setIsDrawing(false);
    });
    
    setCanvas(fabricCanvas);
    
    // Save initial state
    const initialState = fabricCanvas.toDataURL();
    setHistory([initialState]);
    setHistoryIndex(0);
    
    // Cleanup
    return () => {
      fabricCanvas.dispose();
    };
  }, [width, height]);
  
  // Save state after each object added and ensure paths remain visible
  useEffect(() => {
    if (!canvas) return;
    
    const handlePathCreated = (e: any) => {
      // Make sure the path stays visible on canvas
      const path = e.path;
      if (path) {
        path.selectable = false;
        path.evented = false;
      }
      
      const currentState = canvas.toDataURL();
      
      // If we're not at the end of history, truncate
      if (historyIndex < history.length - 1) {
        setHistory(prev => prev.slice(0, historyIndex + 1));
      }
      
      setHistory(prev => [...prev, currentState]);
      setHistoryIndex(prev => prev + 1);
      
      // Important: Save the sketch when a path is created
      if (onSketchSave) {
        onSketchSave(currentState);
      }
    };
    
    canvas.on("path:created", handlePathCreated);
    
    return () => {
      canvas.off("path:created", handlePathCreated);
    };
  }, [canvas, history, historyIndex, onSketchSave]);
  
  // Toggle between pen and eraser
  const toggleDrawingMode = (mode: "pen" | "eraser") => {
    if (!canvas) return;
    
    setDrawingMode(mode);
    
    if (mode === "pen") {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#4A3C31";
      canvas.freeDrawingBrush.width = 3;
    } else {
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush.width = 10;
    }
  };
  
  // Undo/Redo functions
  const undo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    loadCanvasState(history[newIndex]);
  };
  
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    loadCanvasState(history[newIndex]);
  };
  
  const loadCanvasState = (state: string) => {
    if (!canvas) return;
    
    fabric.Image.fromURL(state, (img) => {
      canvas.clear();
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
      });
      
      // Important: Save the sketch when state is loaded
      if (onSketchSave) {
        onSketchSave(state);
      }
    });
  };
  
  // Clear canvas
  const clearCanvas = () => {
    if (!canvas) return;
    
    canvas.clear();
    canvas.backgroundColor = "#F5F1E6";
    canvas.renderAll();
    
    const clearedState = canvas.toDataURL();
    setHistory(prev => [...prev, clearedState]);
    setHistoryIndex(prev => prev + 1);
    
    // Important: Save the cleared state
    if (onSketchSave) {
      onSketchSave(clearedState);
    }
    
    toast.success("Canvas cleared");
  };
  
  // Save sketch
  const saveSketch = () => {
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    if (onSketchSave) {
      onSketchSave(dataUrl);
      toast.success("Sketch saved!");
    } else {
      // Download if no save handler provided
      const link = document.createElement('a');
      link.download = 'invention-sketch.png';
      link.href = dataUrl;
      link.click();
      toast.success("Sketch downloaded!");
    }
  };
  
  // Load image
  const loadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !canvas) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        
        fabric.Image.fromURL(imgUrl, (img) => {
          // Scale image to fit canvas while maintaining aspect ratio
          const scaleFactor = Math.min(
            canvas.width! / img.width!,
            canvas.height! / img.height!
          ) * 0.8;
          
          img.scale(scaleFactor);
          img.set({
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center'
          });
          
          canvas.add(img);
          canvas.renderAll();
          
          const newState = canvas.toDataURL();
          setHistory(prev => [...prev, newState]);
          setHistoryIndex(prev => prev + 1);
          
          // Important: Save the state with the loaded image
          if (onSketchSave) {
            onSketchSave(newState);
          }
          
          toast.success("Image loaded");
        });
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        <Button
          variant={drawingMode === "pen" ? "default" : "outline"}
          size="icon"
          onClick={() => toggleDrawingMode("pen")}
          title="Pen Tool"
        >
          <Pen size={20} />
        </Button>
        <Button
          variant={drawingMode === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => toggleDrawingMode("eraser")}
          title="Eraser Tool"
        >
          <Eraser size={20} />
        </Button>
        
        <Separator orientation="vertical" className="h-10" />
        
        <Button
          variant="outline"
          size="icon"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          <UndoIcon size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          <RedoIcon size={20} />
        </Button>
        
        <Separator orientation="vertical" className="h-10" />
        
        <Button
          variant="outline"
          size="icon"
          onClick={loadImage}
          title="Import Image"
        >
          <FileUp size={20} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={saveSketch}
          title="Save Sketch"
        >
          <Download size={20} />
        </Button>
        
        <Separator orientation="vertical" className="h-10" />
        
        <Button
          variant="destructive"
          size="icon"
          onClick={clearCanvas}
          title="Clear Canvas"
        >
          <Trash2 size={20} />
        </Button>
      </div>
      
      <div className="sketch-canvas-container overflow-hidden rounded-md border border-gray-300">
        <canvas ref={canvasRef} className="sketch-canvas" />
      </div>
      
      {isDrawing && (
        <div className="text-xs text-muted-foreground text-center">
          Drawing in progress...
        </div>
      )}
    </div>
  );
};
