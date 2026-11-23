# graphle

A daily graphing game. Look at a graph, memorize it, and try to recreate it yourself.

**[Play Graphle](https://graphle-tan.vercel.app/)**

## How to play

1. **Study the graph.**
2. **Recreate it.**
3. **Get your score.**

That's it! The goal is to get as close to the original as possible, not necessarily to find the exact same equation(there's lots of cheese potential).

## Features

- **Daily puzzles:** A new graphing challenge every day.
- **Difficulty levels:** Easy, medium and hard.
- **Practice mode:** Go back and attempt previous puzzles.
- **Interactive graph editor:** Plot and manipulate functions to recreate the target.
- **Scoring system:** Your graph is evaluated on multiple properties, including its shape, turning points, intercepts and slices.
- **Streak tracking:** Keep track of your current and best streaks.
- **Local progress:** Your progress is saved locally.

## Scoring System

I realised that we couldn't directly compare equations, since different equations can produce the same graph, so comparing expressions directly wouldn't make much sense.

Instead, my scoring system looks at properties of the resulting graphs.

Some of the things it evaluates include:

- **Shape:** How closely the overall curves match.
- **Turning points:** Whether the important maxima and minima line up.
- **Intercepts:** How closely the graphs match at their intercepts.
- **Slices:** How closely the graphs match at sampled positions.

These contribute to an overall score out of 100.

## Built with

- React
- TypeScript
- Vite
- JSXGraph
- math.js
- Vitest

Built for W5 for hackclub terra
