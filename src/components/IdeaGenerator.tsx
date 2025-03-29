
import { IdeaGenerator as BaseIdeaGenerator } from "./idea-generator/IdeaGenerator";
import { InventionContextProvider } from "@/contexts/InventionContext";

export const IdeaGenerator = (props: React.ComponentProps<typeof BaseIdeaGenerator>) => {
  return (
    <InventionContextProvider>
      <BaseIdeaGenerator {...props} />
    </InventionContextProvider>
  );
};
