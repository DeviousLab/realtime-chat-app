import { Skeleton } from "@chakra-ui/react";

type SkeletonLoaderProps = {
  count: number;
  height: string;
  width?: string;
}

const SkeletonLoader = ({ count, height, width }: SkeletonLoaderProps) => {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <Skeleton
          key={i}
          startColor="blackAlpha.400"
          endColor="whiteAlpha.300"
          height={height}
          width={{ base: "full" || width }}
          borderRadius={4}
        />
      ))}
    </>
  )
}

export default SkeletonLoader