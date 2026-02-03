export interface Idea {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  organizationId?: number;
  creationDate: string; 
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  totalScore: number;
  voteCount: number;
  budgetApproved: boolean;
  isInTop10: boolean;
  attachments?: any[];
  coverImageUrl?: string;
  voteType?: 'UPVOTE' | 'DOWNVOTE';
}