
export interface BackgroundOption {
  id: string;
  type: 'gradient' | 'image';
  value: string;
}

export const backgroundOptions: BackgroundOption[] = [
  { id: 'default', type: 'gradient', value: 'animated-gradient-background' },
  { id: 'nebula', type: 'gradient', value: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950' },
  { id: 'sunset', type: 'gradient', value: 'bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900' },
  { id: 'forest', type: 'gradient', value: 'bg-gradient-to-br from-sky-950 via-cyan-950 to-slate-950' },
];
