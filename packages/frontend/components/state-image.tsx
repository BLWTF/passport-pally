import { base64toBlob } from "@/lib/helpers";
import useIndexedDB from "@/lib/hooks/useIndexedDB";
import { Image, Skeleton } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function StateImage({
  image,
}: {
  image?: { id: string; data: string };
}) {
  const { setValue, getValue } = useIndexedDB();
  const [preview, setPreview] = useState("preview");

  useEffect(() => {
    const getCachedImage = async () => {
      if (image && image.data === "preview") {
        const cachedImage = await getValue<string>(image!.id);

        if (cachedImage) {
          setPreview(cachedImage);
        }
      }
    };

    if (image && image.data !== "preview") {
      base64toBlob(image.data, async (result) => {
        setPreview(result);
        const cachedImage = await getValue<string>(image!.id);

        if (!cachedImage) {
          await setValue(image.id, result);
        }
      });
    }

    getCachedImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

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
