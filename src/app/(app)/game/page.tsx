import { ImagePuzzle } from '@/components/app/image-puzzle';
import { AnimatedTitle } from '@/components/app/animated-title';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AnimatedTitle />
      <ImagePuzzle />
    </div>
  );
}
