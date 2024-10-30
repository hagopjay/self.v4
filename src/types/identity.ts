export interface IdentityDetail {
  Strength: number;
  Title?: string;
  Beliefs?: string;
  Style?: string;
  [key: string]: string | number | undefined;
}

export interface IdentityData {
  [key: string]: IdentityDetail;
}

export interface ProcessedIdentityData {
  name: string;
  strength: number;
  details: IdentityDetail;
}