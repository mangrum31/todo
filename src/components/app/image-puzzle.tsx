'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

interface Tile {
  id: number;
  position: number;
  x: number;
  y: number;
}

const createTiles = (tileSize: number): Tile[] => {
  const tiles: Tile[] = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    tiles.push({
      id: i,
      position: i,
      x: (i % GRID_SIZE) * tileSize,
      y: Math.floor(i / GRID_SIZE) * tileSize,
    });
  }
  return tiles;
};

// Fischer-Yates shuffle algorithm
const shuffleTiles = (tiles: Tile[]): Tile[] => {
    const shuffled = [...tiles];
    let currentIndex = shuffled.length - 1; // Don't shuffle the last tile to ensure solvability
    
    while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
        
        if(randomIndex !== currentIndex) {
            // Swap positions
            [shuffled[currentIndex].position, shuffled[randomIndex].position] = [
            shuffled[randomIndex].position,
            shuffled[currentIndex].position,
            ];
        }
        
        currentIndex -= 1;
    }

    // Simple check for solvability for odd grid sizes
    let inversions = 0;
    for (let i = 0; i < shuffled.length - 1; i++) {
        for (let j = i + 1; j < shuffled.length; j++) {
            if (shuffled[i].position > shuffled[j].position) {
                inversions++;
            }
        }
    }

    if (inversions % 2 !== 0) {
        // If not solvable (odd number of inversions for an odd grid), perform one swap to make it solvable.
        if (shuffled.length >= 2) {
            [shuffled[0].position, shuffled[1].position] = [shuffled[1].position, shuffled[0].position];
        }
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
  const [containerWidth, setContainerWidth] = useState(300);

  const puzzleSize = useMemo(() => Math.min(containerWidth, 500), [containerWidth]);
  const tileSize = useMemo(() => puzzleSize / GRID_SIZE, [puzzleSize]);

  useEffect(() => {
    const handleResize = () => {
      const parent = document.getElementById('puzzle-container');
      if (parent) {
        setContainerWidth(parent.clientWidth);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

  useEffect(() => {
    if (puzzleImages.length > 0 && !currentImage) {
      setCurrentImage(puzzleImages[Math.floor(Math.random() * puzzleImages.length)]);
    }
  }, [puzzleImages, currentImage]);

  useEffect(() => {
    if (currentImage) {
      resetGame();
    }
  }, [currentImage, tileSize]);

  useEffect(() => {
    if (tiles.length > 0 && !isSolved && checkWin()) {
      setIsSolved(true);
    }
  }, [tiles, isSolved]);

  const resetGame = () => {
    setTiles(shuffleTiles(createTiles(tileSize)));
    setSelectedTile(null);
    setIsSolved(false);
    setMoves(0);
  };
  
  const handleNewGameClick = () => {
    let newImage = currentImage;
    if (puzzleImages.length > 1) {
      while (newImage?.id === currentImage?.id) {
        newImage = puzzleImages[Math.floor(Math.random() * puzzleImages.length)];
      }
    }
    setCurrentImage(newImage);
  }

  const checkWin = () => {
    if(tiles.length === 0) return false;
    return tiles.every(tile => tile.id === tile.position);
  };

  const handleTileClick = (tile: Tile) => {
    if (isSolved) return;

    if (selectedTile) {
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
        return;
      }
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
    <div id="puzzle-container" className="flex flex-col items-center gap-6 w-full px-4">
       <div className="w-full max-w-md">
        <Select onValueChange={handleImageChange} value={currentImage?.id || ''}>
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
        <CardContent className="p-1 sm:p-2">
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: puzzleSize,
              height: puzzleSize,
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
                    width: tileSize,
                    height: tileSize,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={currentImage.imageUrl.replace('/600/600', `/${puzzleSize}/${puzzleSize}`)}
                    alt={`Tile ${tile.id}`}
                    width={puzzleSize}
                    height={puzzleSize}
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
      <div className="flex items-center justify-center flex-wrap gap-4">
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
                  src={currentImage.imageUrl.replace('/600/600', '/300/300')}
                  alt="Solved puzzle hint"
                  width={300}
                  height={300}
                  className="rounded-md border max-w-full h-auto"
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
