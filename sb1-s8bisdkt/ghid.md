# MT2D - Ghid Complet al Codului

## Cuprins
1. [Structura Generală](#structura-generală)
2. [Fișiere de Configurare](#fișiere-de-configurare)
3. [Componente React](#componente-react)
4. [Sisteme de Joc](#sisteme-de-joc)
5. [Tipuri și Interfețe](#tipuri-și-interfețe)
6. [Utilități](#utilități)
7. [Stiluri și Animații](#stiluri-și-animații)
8. [Resurse Media](#resurse-media)
9. [Fluxul de Date](#fluxul-de-date)
10. [Arhitectura Aplicației](#arhitectura-aplicației)

---

## Structura Generală

```
MT2D/
├── public/                     # Fișiere publice statice
├── src/                        # Codul sursă principal
│   ├── components/            # Componente React
│   ├── systems/               # Sisteme de joc
│   ├── skills/                # Sistemul de abilități
│   ├── items/                 # Sistemul de iteme
│   ├── attacks/               # Sistemul de atacuri
│   ├── effects/               # Efecte vizuale și de status
│   ├── hooks/                 # React hooks personalizate
│   ├── styles/                # Stiluri CSS
│   ├── sounds/                # Fișiere audio
│   └── utils/                 # Funcții utilitare
├── package.json               # Dependințe și scripturi
└── configurări...             # Fișiere de configurare
```

---

## Fișiere de Configurare

### `package.json`
**Scop**: Definește dependințele proiectului și scripturile de build
**Dependințe principale**:
- `react` & `react-dom`: Framework-ul UI
- `lucide-react`: Iconițe
- `tailwindcss`: Framework CSS
- `vite`: Build tool și dev server

### `vite.config.ts`
**Scop**: Configurarea Vite pentru development și build
**Optimizări**: Exclude `lucide-react` din pre-bundling pentru performanță

### `tailwind.config.js`
**Scop**: Configurarea Tailwind CSS pentru stilizare
**Conținut**: Include toate fișierele pentru purging CSS-ului neutilizat

### `tsconfig.*.json`
**Scop**: Configurarea TypeScript pentru type checking și compilation
- `tsconfig.json`: Configurația principală
- `tsconfig.app.json`: Pentru codul aplicației
- `tsconfig.node.json`: Pentru tooling-ul Node.js

### `eslint.config.js`
**Scop**: Configurarea ESLint pentru code quality și standards
**Reguli**: React hooks, TypeScript, și best practices

### `postcss.config.js`
**Scop**: Configurarea PostCSS pentru procesarea CSS-ului
**Plugin-uri**: Tailwind CSS și Autoprefixer

---

## Componente React

### Componente Principale

#### `src/App.tsx`
**Scop**: Componenta root a aplicației
**Responsabilități**:
- Gestionarea stării globale a jocului
- Routing între ecrane (intro, character selection, game)
- Managementul audio-ului (muzică de fundal, efecte sonore)
- Autosave pentru progresul jucătorului
- Gestionarea modului offline

**State Management**:
```typescript
const [currentMap, setCurrentMap] = useState('map1');
const [gameStarted, setGameStarted] = useState(false);
const [player, setPlayer] = useState<Player | null>(null);
const [isOfflineMode, setIsOfflineMode] = useState(false);
```

**Conexiuni**:
- `GameWorld`: Componenta principală de joc
- `CharacterSelection`: Selecția personajului
- `Intro`: Ecranul de intro
- `SoundManager`: Pentru managementul audio-ului

#### `src/components/GameWorld.tsx`
**Scop**: Componenta principală care orchestrează întregul joc
**Responsabilități**:
- Renderarea hărții și a tuturor entităților
- Gestionarea input-ului de la tastatură
- Managementul sistemelor de joc (combat, movement, inventory)
- Camera și zoom control
- Spawn-ul și managementul inamicilor

**Sisteme Integrate**:
- Movement system
- Combat system
- Inventory system
- Enemy management
- Map rendering

### Componente de Joc

#### `src/components/game/Player.tsx`
**Scop**: Renderarea și animația jucătorului
**Funcționalități**:
- Animații pentru idle, mișcare, atac
- Suport pentru mount (călărie)
- Efecte vizuale (shadow, glow, snow trail)
- Layered sprite system pentru atacuri

**Animații**:
- Idle: `https://i.imgur.com/NtGwERq.gif`
- Attack: `https://i.imgur.com/sGRAaBX.gif`
- Mounted idle: `https://i.imgur.com/mdlONHf.gif`
- Mounted moving: `https://i.imgur.com/w1NBTZT.gif`

#### `src/components/game/GameMap.tsx`
**Scop**: Renderarea hărții de joc
**Funcționalități**:
- Sistem de tile-uri pentru performanță
- Preîncărcarea imaginilor
- Efecte de overlay pentru atmosferă
- Suport pentru multiple hărți

**Hărți Disponibile**:
- `map1`: Seungryong Valley
- `sohan`: Mount Sohan
- `yogbi`: Yogbi Desert
- `village`: Village (cu building system)

#### `src/components/game/Minimap.tsx`
**Scop**: Minimap-ul și full map-ul
**Funcționalități**:
- Minimap circular cu mask
- Full map draggable
- Afișarea jucătorului și inamicilor
- Zoom și navigare

#### `src/components/game/AbilityBar.tsx`
**Scop**: Bara de abilități și skill-uri
**Funcționalități**:
- 8 sloturi pentru skill-uri (1-4, F1-F4)
- Drag & drop pentru reorganizare
- Cooldown indicators
- Mount management (Ctrl+G)
- Tooltip-uri pentru skill-uri

### Componente de Inventar

#### `src/components/inventory/Inventory.tsx`
**Scop**: Sistemul principal de inventar
**Funcționalități**:
- Grid de 45 sloturi (9x5)
- Equipment slots (weapon, armor, accessories)
- Drag & drop pentru iteme
- Stacking pentru iteme stackable
- Upgrade și gem system integration

**Hooks Utilizate**:
- `useInventoryState`: Gestionarea stării
- `useInventoryDragDrop`: Drag & drop logic
- `useInventoryHandlers`: Event handlers

#### `src/components/inventory/slots/InventorySlot.tsx`
**Scop**: Slot individual de inventar
**Funcționalități**:
- Right-click pentru auto-equip
- Chest opening
- Item tooltips
- Stack size display
- Gem slot visualization

### Componente de Combat

#### `src/components/enemies/`
**Structură**:
- `MetinStone.tsx`: Metin stones principale
- `MetinStoneDesert.tsx`: Varianta pentru desert
- `StoneOfMetin.tsx`: Stone of Metin
- `StoneMap1.tsx`: Pietre pentru Map1
- `WhiteTiger.tsx`: White tigers

**Funcționalități Comune**:
- Health bars
- Damage numbers
- Hit effects
- Collision detection
- Loot dropping

#### `src/attacks/AttackManager.ts`
**Scop**: Gestionarea sistemului de atacuri
**Funcționalități**:
- Calcularea hitbox-urilor pentru atacuri
- Damage calculation cu bonusuri
- Knockback effects
- Attack sequence management

### Componente UI

#### `src/components/stats/StatsWindow.tsx`
**Scop**: Fereastra de statistici a jucătorului
**Funcționalități**:
- Afișarea stats-urilor de bază (VIT, STR, INT, DEX)
- Distribuirea punctelor de stat
- Afișarea bonusurilor de la echipament
- Animații pentru schimbări

#### `src/components/skills/SkillTreeWindow.tsx`
**Scop**: Fereastra de skill tree
**Funcționalități**:
- Afișarea tuturor skill-urilor
- Upgrade skill-uri cu skill points
- Tooltips cu informații detaliate
- Success/failure notifications

---

## Sisteme de Joc

### Sistemul de Combat

#### `src/attacks/AttackManager.ts`
**Scop**: Core-ul sistemului de combat
**Funcționalități**:
- Calcularea hitbox-urilor circulare cu unghi
- Damage calculation cu scaling
- Equipment bonuses application
- Critical hits și monster damage

#### `src/attacks/SwordAttack.tsx`
**Scop**: Componenta pentru atacurile cu sabia
**Funcționalități**:
- Visual feedback pentru atacuri
- Layered sprite system
- Attack sequence management

### Sistemul de Experiență

#### `src/systems/experience/ExperienceSystem.ts`
**Scop**: Gestionarea experienței și level-ului
**Funcționalități**:
- Calcularea experienței necesare pentru next level
- Level up cu stat points
- Health și mana restore la level up
- Level up effects

### Sistemul de Echipament

#### `src/systems/equipment/EquipmentStatsSystem.ts`
**Scop**: Calcularea și aplicarea bonusurilor de la echipament
**Funcționalități**:
- Calcularea stats-urilor totale
- Aplicarea bonusurilor de la iteme
- Gem bonuses integration
- Equipment stats display

### Sistemul de Upgrade

#### `src/systems/upgrade/UpgradeSystem.ts`
**Scop**: Sistemul de upgrade pentru iteme
**Funcționalități**:
- Success rates bazate pe nivel
- Cost calculation
- Requirements pentru upgrade-uri avansate
- Bonus generation pentru iteme

### Sistemul de Gems

#### `src/systems/gems/GemSlotSystem.ts`
**Scop**: Sistemul de gem slots și gems
**Funcționalități**:
- Adăugarea de gem slots cu diamante
- Inserarea gems-urilor în sloturi
- Bonus calculation de la gems
- Type checking pentru compatibilitate

### Sistemul de Bonus

#### `src/systems/bonus/BonusSystem.ts`
**Scop**: Sistemul de bonusuri pentru iteme
**Funcționalități**:
- Generarea de bonusuri random
- Reroll bonuses cu Enchant Item
- Bonus ranges și hard caps
- Description updates

### Sistemul de Chest

#### `src/systems/chest/ChestManager.ts`
**Scop**: Gestionarea chest-urilor și loot-ului
**Funcționalități**:
- Loot tables pentru diferite chest-uri
- Drop rate calculation
- Yang rewards pentru Gold Piece
- Item generation cu proper stacking

### Sistemul de Monstre

#### `src/systems/monster/MetinStoneManager.ts`
**Scop**: Managementul Metin stones-urilor
**Funcționalități**:
- Spawn positions optimization
- Respawn timing
- Death handling
- Spatial optimization cu cache

### Sistemul de Performance

#### `src/systems/performance/`
**Structură**:
- `PerformanceOptimizer.ts`: FPS monitoring
- `GameOptimizer.ts`: Spatial partitioning
- `RenderOptimizer.ts`: Render queue management
- `MemoryManager.ts`: Asset caching
- `ParticleManager.ts`: Particle pooling

---

## Sistemul de Skill-uri

### Structura Skill-urilor

#### `src/skills/SkillManager.ts`
**Scop**: Manager-ul principal pentru skill-uri
**Funcționalități**:
- Skill registration și management
- Cooldown tracking
- Mana cost validation
- Skill execution

#### `src/skills/physical/`
**Skill-uri Fizice**:

##### `SwordAura.ts`
- **Efect**: Damage multiplier bazat pe STR
- **Durată**: 120 secunde
- **Scaling**: 20-40% damage bonus

##### `SwordSpin.ts`
- **Efect**: AOE damage în jurul jucătorului
- **Scaling**: Bazat pe DEX
- **Funcționalități**: Movement în timpul cast-ului

##### `ThreeWayCut.ts`
- **Efect**: Continuous damage în față
- **Scaling**: Bazat pe VIT și INT
- **Funcționalități**: Knockback și multiple hits

##### `Dash.ts`
- **Efect**: Dash către cel mai apropiat inamic
- **Scaling**: Bazat pe INT
- **Funcționalități**: Stun și knockback

##### `Berserker.ts`
- **Efect**: Movement speed increase
- **Scaling**: Bazat pe INT
- **Durată**: 120 secunde

##### `RedPotion.ts`
- **Efect**: Instant health restore
- **Scaling**: Bazat pe skill level
- **Cooldown**: 0.2 secunde

---

## Sistemul de Iteme

### Structura Itemelor

#### `src/items/GameItems.ts`
**Scop**: Registry central pentru toate itemele
**Funcționalități**:
- Item definitions
- Category organization
- Item lookup by ID

#### `src/items/categories/`
**Categorii de Iteme**:

##### `WeaponItems.ts`
- Sword+0: Basic weapon
- Full Moon Sword+0: Advanced weapon cu bonusuri

##### `ArmorItems.ts`
- Monk Plate Armor: Basic armor
- Lethal Plate Armor: Advanced armor
- Accessories: Helmet, earrings, bracelet, necklace

##### `ChestItems.ts`
- Moonlight Chest: Bonus items
- Jewelry Chest: Accessories și gems
- Warrior's Chest: Weapons și armor
- Gold Piece: Yang rewards
- Upgrade Chest: Upgrade materials

##### `GemItems.ts`
- Diamond: Pentru gem slots
- Weapon gems: Monster damage, critical, attack
- Armor gems: Movement speed, vitality, DEX

##### `BonusItems.ts`
- Improve Item: Adaugă bonusuri
- Enchant Item: Reroll bonusuri
- Power Additive: Pentru accessories
- Orison: Reroll pentru accessories

##### `ScrollItems.ts`
- Blessing Scroll: Protecție la upgrade

##### `UpgradeItems.ts`
- Bear Gall: Pentru armor upgrades
- Bear Foot Skin: Pentru weapon upgrades

##### `TeleportItems.ts`
- Teleport Ring: Pentru teleportare între hărți

##### `BuildingItems.ts`
- Building Material: Pentru building system în village

---

## Hooks Personalizate

### `src/hooks/useKeyboardControls.ts`
**Scop**: Gestionarea input-ului de la tastatură
**Funcționalități**:
- Key state tracking
- Movement input processing
- Attack input handling
- UI toggle prevention

### `src/hooks/usePlayerMovement.ts`
**Scop**: Sistemul de mișcare a jucătorului
**Funcționalități**:
- Movement calculation cu collision
- Attack processing
- Camera following
- Speed modifiers (mount, berserker, equipment)
- Building tile collision pentru village

---

## Utilități

### `src/utils.ts`
**Funcții Utilitare**:
- `generateId()`: Generarea de ID-uri unice
- `calculateDistance()`: Calcularea distanței între puncte
- `normalizeVector()`: Normalizarea vectorilor

### `src/utils/SoundManager.ts`
**Scop**: Managementul audio-ului
**Funcționalități**:
- Sound preloading și caching
- Volume control separat pentru muzică și efecte
- Mute functionality
- Background music management
- Sound effects pentru acțiuni specifice

---

## Stiluri și Animații

### `src/styles/`
**Structura**:
- `base.css`: Stiluri de bază și font loading
- `animations.css`: Animații pentru atacuri și efecte
- `effects.css`: Efecte vizuale (snow, mount effects)
- `ui.css`: Stiluri pentru UI elements
- `world.css`: Stiluri pentru game world

### `src/index.css`
**Scop**: Entry point pentru toate stilurile
**Include**: Tailwind CSS și toate stilurile custom

---

## Resurse Media

### `src/sounds/`
**Categorii de Sunete**:
- **Combat**: `su_swing_1-4.wav` pentru atacuri
- **UI**: `window_open.wav`, `window_close.wav`
- **Items**: `pickup_item.wav`, `equip_metal_weapon.wav`
- **Movement**: `walk_ground_h_1.wav`, `walk_ground_n_1.wav`
- **Effects**: `teleport.wav`, `succes.wav`, `fail.wav`
- **Building**: `arm.wav` pentru building placement

### `src/components/assets/`
**Resurse Grafice**:
- `font.ttf`: Font-ul custom al jocului
- `warrior/`: Sprite-uri pentru atacuri layered

---

## Fluxul de Date

### Starea Globală
```typescript
// În App.tsx
const [player, setPlayer] = useState<Player | null>(null);
const [currentMap, setCurrentMap] = useState('map1');
const [gameStarted, setGameStarted] = useState(false);
```

### Starea Jucătorului
```typescript
interface Player {
  // Informații de bază
  id: string;
  name: string;
  class: 'Warrior';
  level: number;
  
  // Poziție și mișcare
  position: { x: number; y: number };
  direction: { x: number; y: number };
  
  // Stats
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  
  // Combat
  attackSequence: number;
  isAttacking: boolean;
  targetEnemy?: string;
  
  // Inventory și echipament
  inventory: InventoryItem[];
  yang: number;
  
  // Buffs și efecte
  buffs?: {
    swordAura?: BuffState;
    berserker?: BuffState;
  };
}
```

### Fluxul de Combat
1. **Input Detection**: `useKeyboardControls` detectează space
2. **Attack Processing**: `usePlayerMovement` procesează atacul
3. **Hitbox Calculation**: `AttackManager` calculează hitbox-ul
4. **Enemy Hit Detection**: Verifică ce inamici sunt loviți
5. **Damage Application**: Aplică damage-ul cu bonusuri
6. **Visual Feedback**: Afișează damage numbers și efecte

### Fluxul de Inventar
1. **Item Interaction**: Click sau drag pe item
2. **Validation**: Verifică dacă acțiunea este validă
3. **State Update**: Actualizează inventarul
4. **Equipment Stats**: Recalculează stats-urile
5. **Visual Update**: Actualizează UI-ul

---

## Arhitectura Aplicației

### Layered Architecture

#### **Presentation Layer** (Components)
- React components pentru UI
- Event handling
- Visual feedback
- User interactions

#### **Business Logic Layer** (Systems)
- Game mechanics
- Combat calculations
- Inventory management
- Skill processing

#### **Data Layer** (Types & Utils)
- Type definitions
- Data structures
- Utility functions
- State management

### Design Patterns Utilizate

#### **Component Pattern**
- Componente reutilizabile
- Props pentru configurare
- State local pentru UI

#### **System Pattern**
- Sisteme independente
- Clear interfaces
- Separation of concerns

#### **Manager Pattern**
- Manageri pentru resurse complexe
- Centralized control
- Resource optimization

#### **Hook Pattern**
- Custom hooks pentru logic reuse
- State management
- Side effects handling

### Performance Optimizations

#### **Rendering**
- React.memo pentru componente
- useCallback pentru funcții
- Spatial partitioning pentru entități
- View culling pentru off-screen objects

#### **Memory**
- Object pooling pentru particles
- Asset caching
- Cleanup pentru unused resources
- WeakMap pentru temporary references

#### **Network**
- Asset preloading
- Compressed textures
- Progressive loading
- Cache strategies

---

## Conexiuni între Componente

### Fluxul Principal de Date
```
App.tsx
├── GameWorld.tsx
│   ├── Player.tsx
│   ├── GameMap.tsx
│   ├── Minimap.tsx
│   ├── AbilityBar.tsx
│   ├── Inventory.tsx
│   └── Enemies/
├── CharacterSelection.tsx
└── Intro.tsx
```

### Sistemele de Joc
```
GameWorld.tsx
├── usePlayerMovement (hook)
│   ├── AttackManager (system)
│   ├── MovementSystem (logic)
│   └── CollisionDetection (logic)
├── EnemyManager (system)
│   ├── MetinStoneManager
│   ├── SpawnSystem
│   └── AISystem
└── InventorySystem
    ├── EquipmentStatsSystem
    ├── UpgradeSystem
    ├── GemSlotSystem
    └── BonusSystem
```

### Managerii de Resurse
```
SoundManager
├── Audio preloading
├── Volume control
└── Effect triggering

PerformanceManager
├── FPS monitoring
├── Memory management
└── Render optimization
```

---

## Concluzie

Acest ghid oferă o vedere completă asupra arhitecturii MT2D. Codul este organizat în mod modular, cu separarea clară a responsabilităților și o arhitectură scalabilă care permite adăugarea facilă de noi funcționalități.

Punctele cheie ale arhitecturii:
- **Modularitate**: Fiecare sistem este independent
- **Reutilizabilitate**: Componente și hook-uri reutilizabile
- **Performanță**: Optimizări la toate nivelurile
- **Mentenabilitate**: Cod curat și bine organizat
- **Extensibilitate**: Ușor de extins cu noi funcționalități

Pentru dezvoltarea viitoare, arhitectura actuală suportă:
- Adăugarea de noi hărți și zone
- Implementarea de noi clase de personaje
- Extinderea sistemului de skill-uri
- Adăugarea de noi tipuri de iteme
- Implementarea de noi sisteme de joc