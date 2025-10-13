import { ImagePuzzle } from '@/components/app/image-puzzle';

export default function GamePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-bold mb-8 text-primary">Image Scramble</h1>
      <ImagePuzzle />
    </div>
  );
}
