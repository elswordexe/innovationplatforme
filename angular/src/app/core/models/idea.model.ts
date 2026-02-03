export enum IdeaStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ASSIGNING_TEAM = 'ASSIGNING_TEAM',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED'
}

export type VoteKind = 'UPVOTE' | 'DOWNVOTE';

export interface Idea {
    id: number;
    title: string;
    description: string;
    creatorId: number;
    organizationId: number;
    creationDate: string;
    status: IdeaStatus;
    totalScore: number;
    voteCount: number;
    budgetApproved: boolean;
    isInTop10: boolean;

    // Optional UI fields (if provided by backend DTO or mapped)
    creatorName?: string;
    organizationName?: string;
    feedbackCount?: number;
    tags?: string[];
    hasVoted?: boolean;
    votedType?: VoteKind;
    isBookmarked?: boolean;
    canEdit?: boolean;
    canView?: boolean;
    showStatusBadge?: boolean;
}
