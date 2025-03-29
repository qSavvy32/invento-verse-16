
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const LANGUAGE_OPTIONS = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "pol", label: "Polish" },
  { value: "tur", label: "Turkish" },
  { value: "rus", label: "Russian" },
  { value: "nld", label: "Dutch" },
  { value: "cze", label: "Czech" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
  { value: "jpn", label: "Japanese" },
  { value: "cmn", label: "Chinese" },
  { value: "kor", label: "Korean" },
];

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
