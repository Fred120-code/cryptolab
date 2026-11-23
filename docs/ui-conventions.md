# Conventions d'interface utilisateur (UI) - CryptoLab

Ce document synthétise les règles d'architecture et d'implémentation de l'interface utilisateur pour CryptoLab, basées sur shadcn/ui et Tailwind CSS v4.

---

### 1. Ajout et intégrité des composants shadcn/ui

- Les composants shadcn s'ajoutent exclusivement via la CLI officielle :
  ```bash
  npx shadcn@latest add <nom>
  ```
- Le code source généré dans `src/components/ui/` ne doit **jamais être modifié manuellement**, à une exception stricte près :
  - **Internationalisation** : si un composant contient du texte visible ou accessible codé en dur (ex. `<span className="sr-only">Close</span>` dans `Dialog` ou `Sheet`), ce texte doit impérativement devenir une prop configurable ou être traduit via `useTranslation()`. Toute modification de ce type doit être explicitement signalée.

---

### 2. Typage strict des boutons

- Les boutons shadcn doivent toujours recevoir explicitement l'attribut `type="button"` (le composant ne définissant pas de type par défaut pour éviter les soumissions de formulaire inopinées) :
  ```tsx
  <Button type="button">...</Button>
  ```

---

### 3. Cibles tactiles et accessibilité (WCAG 2.x)

- Toutes les cibles tactiles interactives doivent respecter une taille minimale de **44 × 44 px** :
  - **Boutons icônes** (`size="icon"`) : la taille par défaut de shadcn étant de 36 px, ajouter impérativement `className="size-11"` pour atteindre 44 px (grâce à `tailwind-merge`, la classe surchargera les dimensions natives).
  - **Boutons textuels** : ajouter la classe `min-h-11` (ou `min-w-11 min-h-11`).

---

### 4. Contrôles natifs de formulaire

- Les contrôles natifs `<select>` et `<input type="range">` sont **conservés sous forme d'éléments HTML natifs** pour garantir l'accessibilité optimale, la fluidité sur appareils mobiles et la simplicité des tests.
- Ils sont stylisés pour s'harmoniser visuellement avec shadcn en utilisant les mêmes jetons que le composant `Input` (`border-input`, `bg-background`, `text-foreground`, `focus-visible:ring-2 focus-visible:ring-ring`, `accent-primary`).

---

### 5. Système de couleurs et jetons sémantiques

- Aucune couleur brute Tailwind (ex. `bg-gray-100`, `text-neutral-900`) ni code hexadécimal direct n'est autorisé dans les composants et pages.
- Seuls les **jetons sémantiques** de shadcn sont autorisés :
  - `bg-background`, `text-foreground`
  - `bg-card`, `text-card-foreground`
  - `bg-popover`, `text-popover-foreground`
  - `bg-primary`, `text-primary-foreground`
  - `bg-secondary`, `text-secondary-foreground`
  - `bg-muted`, `text-muted-foreground`
  - `bg-accent`, `text-accent-foreground`
  - `text-destructive`, `bg-destructive`
  - `border-border`, `border-input`, `ring-ring`
