'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Eye } from 'lucide-react';

const GRID_SIZE = 3;
const TILE_SIZE = 120;

interface Tile {
  id: number;
  position: number;
  x: number;
  y: number;
}

const createTiles = (): Tile[] => {
  const tiles: Tile[] = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    tiles.push({
      id: i,
      position: i,
      x: (i % GRID_SIZE) * TILE_SIZE,
      y: Math.floor(i / GRID_SIZE) * TILE_SIZE,
    });
  }
  return tiles;
};

const shuffleTiles = (tiles: Tile[]): Tile[] => {
  const shuffled = [...tiles];
  // Don't shuffle the last tile to ensure the puzzle is always solvable
  for (let i = shuffled.length - 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i].position, shuffled[j].position] = [
      shuffled[j].position,
      shuffled[i].position,
    ];
  }
  return shuffled;
};

export function ImagePuzzle() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [isSolved, setIsSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [puzzleImages] = useState<ImagePlaceholder[]>(PlaceHolderImages);
  const [currentImage, setCurrentImage] = useState<ImagePlaceholder | null>(null);

  useEffect(() => {
    if (puzzleImages.length > 0 && !currentImage) {
      setCurrentImage(puzzleImages[0]);
    }
  }, [puzzleImages, currentImage]);

  useEffect(() => {
    if (currentImage) {
      resetGame();
    }
  }, [currentImage]);

  useEffect(() => {
    if (tiles.length > 0 && !isSolved && checkWin()) {
      setIsSolved(true);
    }
  }, [tiles, isSolved]);

  const resetGame = () => {
    setTiles(shuffleTiles(createTiles()));
    setSelectedTile(null);
    setIsSolved(false);
    setMoves(0);
  };
  
  const handleNewGameClick = () => {
    resetGame();
  }

  const checkWin = () => {
    return tiles.every(tile => tile.id === tile.position);
  };

  const handleTileClick = (tile: Tile) => {
    if (isSolved) return;

    if (selectedTile) {
      const newTiles = tiles.map(t => {
        if (t.id === selectedTile.id) return { ...t, position: tile.position };
        if (t.id === tile.id) return { ...t, position: selectedTile.position };
        return t;
      });
      setTiles(newTiles);
      setSelectedTile(null);
      setMoves(prev => prev + 1);
    } else {
      setSelectedTile(tile);
    }
  };

  const handleImageChange = (imageId: string) => {
    const newImage = puzzleImages.find(img => img.id === imageId);
    if (newImage) {
      setCurrentImage(newImage);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
       <div className="w-full max-w-sm">
        <Select onValueChange={handleImageChange} defaultValue={currentImage?.id}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a puzzle image" />
          </SelectTrigger>
          <SelectContent>
            {puzzleImages.map(image => (
              <SelectItem key={image.id} value={image.id}>
                {image.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-2">
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: GRID_SIZE * TILE_SIZE,
              height: GRID_SIZE * TILE_SIZE,
            }}
          >
            {currentImage && tiles
              .sort((a, b) => a.position - b.position)
              .map(tile => (
                <div
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className={cn(
                    'cursor-pointer transition-all duration-300 ease-in-out',
                    'hover:scale-105 hover:z-10',
                    selectedTile?.id === tile.id && 'ring-4 ring-primary ring-inset z-20 scale-105'
                  )}
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={currentImage.imageUrl}
                    alt={`Tile ${tile.id}`}
                    width={GRID_SIZE * TILE_SIZE}
                    height={GRID_SIZE * TILE_SIZE}
                    className="absolute max-w-none"
                    style={{
                      left: -tile.x,
                      top: -tile.y,
                    }}
                    priority
                    data-ai-hint={currentImage.imageHint}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-4">
        <p className="text-lg font-medium">Moves: <span className="font-bold text-primary">{moves}</span></p>
        <Button onClick={handleNewGameClick}>New Game</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Hint
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hint: The Solved Puzzle</AlertDialogTitle>
              <AlertDialogDescription>
                Here is what the final image should look like.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {currentImage && (
              <div className="flex justify-center items-center p-4">
                <Image
                  src={currentImage.imageUrl}
                  alt="Solved puzzle hint"
                  width={300}
                  height={300}
                  className="rounded-md border"
                  data-ai-hint={currentImage.imageHint}
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogAction>Got it!</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <AlertDialog open={isSolved} onOpenChange={(open) => !open && handleNewGameClick()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>
              You solved the puzzle in {moves} moves! That's amazing!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNewGameClick}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
