import { base64toBlob } from "@/lib/helpers";
import { Image, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function StateImage({ imageData }: { imageData?: string }) {
  const [preview, setPreview] = useState("preview");

  useEffect(() => {
    if (imageData && imageData !== "preview") {
      base64toBlob(imageData, (result) => {
        setPreview(result);
      });
    }
  }, [imageData]);

  return (
    <>
      {preview !== "preview" && (
        <Image
          src={preview}
          alt="Generated"
          w="100%"
          h="100%"
          objectFit="contain"
        />
      )}
      {preview === "preview" && <Skeleton w="100%" h="100%" />}
    </>
  );
}
