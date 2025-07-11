import React from 'react';
import { AttackHitbox, Player } from '../types';

interface SwordAttackProps {
  hitbox: AttackHitbox;
  player: Player;
  showNumber?: boolean;
}

const SwordAttack: React.FC<SwordAttackProps> = ({ hitbox, player }) => {
  // The component now has no visual representation
  return null;
};

export default SwordAttack;