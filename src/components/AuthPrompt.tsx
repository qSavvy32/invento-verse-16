
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LockIcon, UserIcon } from "lucide-react";

interface AuthPromptProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ onConfirm, onCancel }) => {
  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto bg-invention-accent/10 p-3 rounded-full mb-2">
            <LockIcon className="h-6 w-6 text-invention-accent" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Sign in to unlock full potential
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            To process your idea and unlock all the amazing features of our invention studio, 
            you'll need to create an account or sign in. We'll save your progress so you can 
            continue right where you left off.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="mt-0">
            Continue without signing in
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-invention-accent hover:bg-invention-accent/90">
            <UserIcon className="h-4 w-4 mr-2" />
            Sign in / Create account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
