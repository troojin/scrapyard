export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
  avatar?: string;
  stripe_account_id?: string;
  stripe_onboarded?: boolean;
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
}

export interface FileTreeItem {
  path: string;
  size: number;
}

export interface Project {
  id: string;
  title: string;
  github_url?: string;
  screenshot?: string;
  screenshots?: string[];
  reason_abandoned: string;
  salvageable_code: string;
  user: string;
  expand?: {
    user?: User;
  };
  tags?: string[];
  is_for_sale?: boolean;
  price?: number;
  archive_file?: string;
  file_tree?: FileTreeItem[];
  sold?: boolean;
  license_type?: 'multiple_clones' | 'one_time_buyout';
  created?: string;
  updated?: string;
  collectionId?: string;
  collectionName?: string;
}

export interface SubmitProjectInput {
  title: string;
  listing_type: 'free' | 'sale';
  price?: number;
  github_url?: string;
  screenshots: File[];
  archive_file?: File | null;
  file_tree?: FileTreeItem[];
  reason_abandoned: string;
  salvageable_code: string;
  tags?: string[];
}

export interface Purchase {
  id: string;
  buyer: string;
  project: string;
  amount?: number;
  stripe_session_id?: string;
  license_type?: string;
  created?: string;
  updated?: string;
  expand?: {
    project?: Project;
    buyer?: User;
  };
}
