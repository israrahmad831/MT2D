export class ExperienceSystem {
  // Function for gaining experience
  static gainExperience(player: any, exp: number): any {
    if (exp <= 0) return player;

    let currentExp = player.experience + exp;
    let expToNextLevel = player.experienceToNextLevel;
    let currentLevel = player.level;
    let statPoints = player.statPoints;
    let skillPoints = player.skillPoints || 0;
    let leveledUp = false;

    // Algorithm for level increase
    while (currentExp >= expToNextLevel && currentLevel < 99) {
      currentExp -= expToNextLevel;
      currentLevel += 1;
      statPoints += 1;
      
      // Add 20 Ancient Frozen Spellbook every 10 levels
      if (currentLevel % 10 === 0) {
        skillPoints += 20;
      }
      
      expToNextLevel = Math.floor(expToNextLevel * 1.1);
      leveledUp = true;
    }

    // Return updated player object
    return {
      ...player,
      level: currentLevel,
      experience: currentExp,
      experienceToNextLevel: expToNextLevel,
      statPoints: statPoints,
      skillPoints: skillPoints,
      health: leveledUp ? player.maxHealth : player.health,
      mana: leveledUp ? player.maxMana : player.mana,
      controlsDisabled: false,
      levelUpEffect: leveledUp ? {
        active: true,
        startTime: Date.now(),
        duration: 2000
      } : undefined
    };
  }

  // Function for calculating experience needed for a level
  static getExpForLevel(level: number): number {
    let expRequired = 100;
    for (let i = 2; i <= level; i++) {
      expRequired = Math.floor(expRequired * 1.1);
    }
    return expRequired;
  }
}