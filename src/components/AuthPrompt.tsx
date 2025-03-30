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
import { motion } from "framer-motion";
import { fadeUp, pulse } from "@/lib/animation";

interface AuthPromptProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const AuthPrompt: React.FC<AuthPromptProps> = ({ onConfirm, onCancel }) => {
  return (
    <AlertDialog defaultOpen={true}>
      <AlertDialogContent className="max-w-md overflow-hidden">
        <AlertDialogHeader>
          <motion.div 
            className="mx-auto bg-invention-accent/10 p-3 rounded-full mb-2"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 15,
              delay: 0.2
            }}
          >
            <motion.div
              variants={pulse}
              animate="animate"
            >
              <LockIcon className="h-6 w-6 text-invention-accent" />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <AlertDialogTitle className="text-center text-xl">
              Sign in to unlock full potential
            </AlertDialogTitle>
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <AlertDialogDescription className="text-center">
              To process your idea and unlock all the amazing features of our invention studio, 
              you'll need to create an account or sign in. We'll save your progress so you can 
              continue right where you left off.
            </AlertDialogDescription>
          </motion.div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <AlertDialogCancel onClick={onCancel} className="mt-0 w-full">
              Continue without signing in
            </AlertDialogCancel>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <AlertDialogAction 
              onClick={onConfirm} 
              className="bg-invention-accent hover:bg-invention-accent/90 w-full"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Sign in / Create account
            </AlertDialogAction>
          </motion.div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
