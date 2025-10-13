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
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const GRID_SIZE = 3;
const TILE_SIZE = 120;
const IMAGE_URL = 'https://picsum.photos/seed/puzzle/360/360';

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
  for (let i = shuffled.length - 1; i > 0; i--) {
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

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (tiles.length > 0 && checkWin()) {
      setIsSolved(true);
    }
  }, [tiles]);

  const resetGame = () => {
    setTiles(shuffleTiles(createTiles()));
    setSelectedTile(null);
    setIsSolved(false);
    setMoves(0);
  };

  const checkWin = () => {
    return tiles.every(tile => tile.id === tile.position);
  };

  const handleTileClick = (tile: Tile) => {
    if (isSolved) return;

    if (selectedTile) {
      // Swap positions
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

  return (
    <div className="flex flex-col items-center gap-6">
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
            {tiles
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
                    src={IMAGE_URL}
                    alt={`Tile ${tile.id}`}
                    width={GRID_SIZE * TILE_SIZE}
                    height={GRID_SIZE * TILE_SIZE}
                    className="absolute max-w-none"
                    style={{
                      left: -tile.x,
                      top: -tile.y,
                    }}
                    priority
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-4">
        <p className="text-lg font-medium">Moves: <span className="font-bold text-primary">{moves}</span></p>
        <Button onClick={resetGame}>New Game</Button>
      </div>
      
      <AlertDialog open={isSolved} onOpenChange={setIsSolved}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>
              You solved the puzzle in {moves} moves! That's amazing!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
