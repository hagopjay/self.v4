import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => (
  <div className="flex flex-col items-center justify-center w-full h-[700px] text-red-500">
    <AlertCircle className="w-12 h-12 mb-4" />
    <p className="text-lg font-medium">{message}</p>
  </div>
);