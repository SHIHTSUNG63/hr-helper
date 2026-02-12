
export interface Participant {
  id: string;
  name: string;
  department?: string;
}

export interface Group {
  id: string;
  name: string;
  theme?: string;
  members: Participant[];
}

export enum AppTab {
  INPUT = 'input',
  RAFFLE = 'raffle',
  GROUPING = 'grouping'
}

export interface RaffleWinner {
  participant: Participant;
  prizeName: string;
  timestamp: Date;
}
