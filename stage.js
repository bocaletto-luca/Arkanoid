/*
 * stage.js - Level configuration for Arkanoid
 * Author: Bocaletto Luca
 *
 * For each level, we define:
 * - The number of rows/columns,
 * - The distribution (probability) of the various types of bricks,
 * - The ball speed multiplier, and
 * - The probability of gold bricks releasing power-up capsules.
 */
const stageConfig = [
  { 
    level: 1,  
    brickRowCount: 5,  
    brickColumnCount: 8,  
    probabilities: { 
      white: 0.30,    // rompe al primo colpo
      green: 0.30,
      blue: 0.20,
      purple: 0.10,
      brown: 0.10,
      copper: 0.00,   // 0% copper
      gray: 0.00,     // 0% indistruttibili
      gold: 0.00      // 0% gold
    },
    ballSpeedFactor: 1.0,
    goldCapsuleProbability: 0.0
  },
  { 
    level: 2,  
    brickRowCount: 5,  
    brickColumnCount: 8,  
    probabilities: { 
      white: 0.25, 
      green: 0.25, 
      blue: 0.20, 
      purple: 0.10, 
      brown: 0.10, 
      copper: 0.05, 
      gray: 0.05, 
      gold: 0.00
    },
    ballSpeedFactor: 1.05,
    goldCapsuleProbability: 0.0
  },
  { 
    level: 3,  
    brickRowCount: 6,  
    brickColumnCount: 9,  
    probabilities: { 
      white: 0.20, 
      green: 0.20, 
      blue: 0.20, 
      purple: 0.10, 
      brown: 0.10, 
      copper: 0.10, 
      gray: 0.00, 
      gold: 0.10
    },
    ballSpeedFactor: 1.1,
    goldCapsuleProbability: 0.5
  },
  { 
    level: 4,  
    brickRowCount: 6,  
    brickColumnCount: 9,  
    probabilities: { 
      white: 0.18, 
      green: 0.18, 
      blue: 0.18, 
      purple: 0.12, 
      brown: 0.12, 
      copper: 0.12, 
      gray: 0.05, 
      gold: 0.05
    },
    ballSpeedFactor: 1.15,
    goldCapsuleProbability: 0.5
  },
  { 
    level: 5,  
    brickRowCount: 6,  
    brickColumnCount: 10, 
    probabilities: { 
      white: 0.15, 
      green: 0.15, 
      blue: 0.15, 
      purple: 0.15, 
      brown: 0.15, 
      copper: 0.15, 
      gray: 0.05, 
      gold: 0.05
    },
    ballSpeedFactor: 1.2,
    goldCapsuleProbability: 0.6
  },
  { 
    level: 6,  
    brickRowCount: 7,  
    brickColumnCount: 10, 
    probabilities: { 
      white: 0.12, 
      green: 0.12, 
      blue: 0.12, 
      purple: 0.12, 
      brown: 0.12, 
      copper: 0.18, 
      gray: 0.10, 
      gold: 0.12
    },
    ballSpeedFactor: 1.25,
    goldCapsuleProbability: 0.6
  },
  { 
    level: 7,  
    brickRowCount: 7,  
    brickColumnCount: 11, 
    probabilities: { 
      white: 0.10, 
      green: 0.10, 
      blue: 0.10, 
      purple: 0.10, 
      brown: 0.10, 
      copper: 0.20, 
      gray: 0.15, 
      gold: 0.15
    },
    ballSpeedFactor: 1.3,
    goldCapsuleProbability: 0.7
  },
  { 
    level: 8,  
    brickRowCount: 7,  
    brickColumnCount: 11, 
    probabilities: { 
      white: 0.08, 
      green: 0.08, 
      blue: 0.08, 
      purple: 0.08, 
      brown: 0.08, 
      copper: 0.20, 
      gray: 0.18, 
      gold: 0.22
    },
    ballSpeedFactor: 1.35,
    goldCapsuleProbability: 0.7
  },
  { 
    level: 9,  
    brickRowCount: 8,  
    brickColumnCount: 12, 
    probabilities: { 
      white: 0.07, 
      green: 0.07, 
      blue: 0.07, 
      purple: 0.07, 
      brown: 0.07, 
      copper: 0.20, 
      gray: 0.20, 
      gold: 0.25
    },
    ballSpeedFactor: 1.4,
    goldCapsuleProbability: 0.8
  },
  { 
    level: 10, 
    brickRowCount: 8,  
    brickColumnCount: 12, 
    probabilities: { 
      white: 0.06, 
      green: 0.06, 
      blue: 0.06, 
      purple: 0.06, 
      brown: 0.06, 
      copper: 0.20, 
      gray: 0.20, 
      gold: 0.30
    },
    ballSpeedFactor: 1.5,
    goldCapsuleProbability: 0.8
  }
];
console.log("stage.js caricato:", stageConfig);
