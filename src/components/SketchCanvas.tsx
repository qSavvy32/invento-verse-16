import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Pen, Eraser, UndoIcon, RedoIcon, Download, FileUp, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface SketchCanvasProps {
  onSketchSave?: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

// Animation variants for toolbar buttons
const toolbarIconVariants = {
  hover: { scale: 1.1, y: -2 },
  tap: { scale: 0.9 }
};

// Animation variants for the canvas container
const canvasContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const SketchCanvas = ({ onSketchSave, width = 800, height = 600 }: SketchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [drawingMode, setDrawingMode] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  // Track if canvas is ready for animations
  const [canvasReady, setCanvasReady] = useState(false);

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
    
    // Set canvas as ready for animations
    setTimeout(() => setCanvasReady(true), 100);
    
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
      setUnsavedChanges(true);
    };
    
    canvas.on("path:created", handlePathCreated);
    
    return () => {
      canvas.off("path:created", handlePathCreated);
    };
  }, [canvas, history, historyIndex]);
  
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
    setUnsavedChanges(true);
  };
  
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    loadCanvasState(history[newIndex]);
    setUnsavedChanges(true);
  };
  
  const loadCanvasState = (state: string) => {
    if (!canvas) return;
    
    fabric.Image.fromURL(state, (img) => {
      canvas.clear();
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width! / img.width!,
        scaleY: canvas.height! / img.height!,
      });
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
    setUnsavedChanges(true);
    
    toast.success("Canvas cleared");
  };
  
  // Save sketch explicitly
  const saveSketch = () => {
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1
    });
    
    if (onSketchSave) {
      onSketchSave(dataUrl);
      toast.success("Sketch saved!");
      setUnsavedChanges(false);
    } else {
      // Download if no save handler provided
      const link = document.createElement('a');
      link.download = 'invention-sketch.png';
      link.href = dataUrl;
      link.click();
      toast.success("Sketch downloaded!");
      setUnsavedChanges(false);
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
          setUnsavedChanges(true);
          
          toast.success("Image loaded");
        });
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };
  
  return (
    <motion.div
      className="flex flex-col border rounded-lg overflow-hidden bg-white shadow-sm"
      variants={canvasContainerVariants}
      initial="hidden"
      animate={canvasReady ? "visible" : "hidden"}
    >
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant={drawingMode === "pen" ? "default" : "outline"}
              onClick={() => toggleDrawingMode("pen")}
              className="h-9 w-9"
              title="Pen"
            >
              <motion.div variants={toolbarIconVariants}>
                <Pen className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant={drawingMode === "eraser" ? "default" : "outline"}
              onClick={() => toggleDrawingMode("eraser")}
              className="h-9 w-9"
              title="Eraser"
            >
              <motion.div variants={toolbarIconVariants}>
                <Eraser className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
          
          <Separator orientation="vertical" className="mx-1 h-8" />
          
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant="outline"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="h-9 w-9"
              title="Undo"
            >
              <motion.div variants={toolbarIconVariants}>
                <UndoIcon className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant="outline"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="h-9 w-9"
              title="Redo"
            >
              <motion.div variants={toolbarIconVariants}>
                <RedoIcon className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
        
        <div className="flex items-center space-x-1">
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant="outline"
              onClick={loadImage}
              className="h-9 w-9"
              title="Upload Image"
            >
              <motion.div variants={toolbarIconVariants}>
                <FileUp className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant="outline"
              onClick={saveSketch}
              className="h-9 w-9"
              title="Save"
            >
              <motion.div variants={toolbarIconVariants}>
                <Save className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div whileHover="hover" whileTap="tap">
            <Button
              size="icon"
              variant="outline"
              onClick={clearCanvas}
              className="h-9 w-9 text-destructive"
              title="Clear Canvas"
            >
              <motion.div variants={toolbarIconVariants}>
                <Trash2 className="h-4 w-4" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
      
      <div className="canvas-container p-4 flex justify-center items-center bg-background/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative shadow-md"
        >
          <canvas ref={canvasRef} />
          {unsavedChanges && (
            <motion.div 
              className="absolute top-2 right-2 h-2 w-2 rounded-full bg-invention-accent"
              animate={{ 
                scale: [1, 1.5, 1], 
                opacity: [0.5, 1, 0.5] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
