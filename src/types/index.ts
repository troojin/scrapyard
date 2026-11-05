export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
}

export interface Project {
  id: string;
  title: string;
  github_url: string;
  screenshot?: string;
  screenshots?: string[];
  reason_abandoned: string;
  salvageable_code: string;
  user: string;
  expand?: {
    user?: User;
  };
  tags?: string[];
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
}

export interface SubmitProjectInput {
  title: string;
  github_url: string;
  screenshots: File[];
  reason_abandoned: string;
  salvageable_code: string;
  tags?: string[];
}
