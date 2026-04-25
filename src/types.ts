export interface GameScenario {
  imageAnalysis: {
    guloFactor: number; // 1-10
    environmentalStressors: string[];
    keyCharacters: {
      name: string;
      description: string;
      vibe: string;
    }[];
  };
  randomEvent: {
    title: string;
    description: string;
    target: string; // e.g. "Marshall", "Crowd", "Line"
  };
  playerActions: {
    action: string;
    success: string;
    fail: string;
    successChance: number; // 0-1 (derived from guloFactor logic)
  }[];
}
