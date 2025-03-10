"use client";

import { UploadDropzone } from "@/utils/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
    onUpload: (url: string) => void;
    value: string;
    endpoint: "imageUploader";
}

function UploadImage({ endpoint, onUpload, value }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40">
        <img src={value} alt="Upload" className="rounded-md size-36 object-cover" />
        <button
          onClick={() => onUpload("")}
          className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }
  
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onUpload(res?.[0].url);
      }}
      onUploadError={(error: Error) => {
        console.log(error);
      }}
    />
  );
}
export default UploadImage;
