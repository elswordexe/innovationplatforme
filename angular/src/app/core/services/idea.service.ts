import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Idea, IdeaStatus } from '../models/idea.model';

@Injectable({
    providedIn: 'root'
})
export class IdeaService {
    private http = inject(HttpClient);
    private apiUrl = '/api/ideas'; // Uses proxy configured in proxy.conf.json
    private readonly ideaKeys = ['content', 'data', 'ideas', 'items', 'results', 'list'];
    private readonly statusOrder: IdeaStatus[] = [
        IdeaStatus.DRAFT,
        IdeaStatus.SUBMITTED,
        IdeaStatus.UNDER_REVIEW,
        IdeaStatus.APPROVED,
        IdeaStatus.REJECTED,
        IdeaStatus.ASSIGNING_TEAM,
        IdeaStatus.IN_PROGRESS,
        IdeaStatus.COMPLETED
    ];

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token'); // As specified by user
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    getAllIdeas(): Observable<Idea[]> {
        return this.http.get<unknown>(this.apiUrl, { headers: this.getHeaders() }).pipe(
            map((payload) => this.normalizeIdeas(this.unwrapIdeas(payload)))
        );
    }

    createIdea(payload: { title: string; description: string; organizationId?: number | null }, userId?: number): Observable<Idea> {
        let headers = this.getHeaders();
        if (userId !== undefined) {
            headers = headers.set('X-User-Id', String(userId));
        }
        return this.http.post<Idea>(this.apiUrl, payload, { headers });
    }

    // Future methods: getById, create, update, etc.

    private unwrapIdeas(payload: unknown): Idea[] {
        const list = this.findIdeaArray(payload, 0);
        return list ?? [];
    }

    private findIdeaArray(payload: unknown, depth: number): Idea[] | null {
        if (Array.isArray(payload)) {
            return payload as Idea[];
        }

        if (!payload || typeof payload !== 'object' || depth > 3) {
            return null;
        }

        const record = payload as Record<string, unknown>;
        for (const key of this.ideaKeys) {
            const value = record[key];
            if (Array.isArray(value)) {
                return value as Idea[];
            }
            const nested = this.findIdeaArray(value, depth + 1);
            if (nested) {
                return nested;
            }
        }

        const embedded = record['_embedded'];
        if (embedded && typeof embedded === 'object') {
            for (const value of Object.values(embedded as Record<string, unknown>)) {
                if (Array.isArray(value)) {
                    return value as Idea[];
                }
                const nested = this.findIdeaArray(value, depth + 1);
                if (nested) {
                    return nested;
                }
            }
        }

        for (const value of Object.values(record)) {
            if (Array.isArray(value) && this.looksLikeIdeaArray(value)) {
                return value as Idea[];
            }
            const nested = this.findIdeaArray(value, depth + 1);
            if (nested) {
                return nested;
            }
        }

        return null;
    }

    private looksLikeIdeaArray(items: unknown[]): boolean {
        if (items.length === 0) {
            return true;
        }
        const first = items[0];
        if (!first || typeof first !== 'object') {
            return false;
        }
        const record = first as Record<string, unknown>;
        return (
            'title' in record ||
            'description' in record ||
            'creatorId' in record ||
            'creator_id' in record ||
            'organizationId' in record ||
            'organization_id' in record
        );
    }

    private normalizeIdeas(items: Idea[]): Idea[] {
        return items.map((item) => this.normalizeIdea(item));
    }

    private normalizeIdea(item: Idea): Idea {
        if (!item || typeof item !== 'object') {
            return item;
        }
        const record = item as unknown as Record<string, unknown>;
        const normalizedStatus = this.normalizeStatus(
            record['status'] ?? record['ideaStatus'] ?? record['idea_status']
        );

        const base = record as unknown as Partial<Idea>;
        return {
            ...base,
            id: this.toNumber(record['id'] ?? record['ideaId'] ?? record['idea_id'], 0),
            title: (record['title'] ?? record['ideaTitle'] ?? record['idea_title'] ?? '') as string,
            description: (record['description'] ?? record['ideaDescription'] ?? record['idea_description'] ?? '') as string,
            creatorId: this.toNumber(record['creatorId'] ?? record['creator_id'] ?? record['userId'] ?? record['user_id'], 0),
            organizationId: this.toNumber(
                record['organizationId'] ?? record['organization_id'] ?? record['orgId'] ?? record['org_id'],
                0
            ),
            creationDate: (record['creationDate'] ?? record['creation_date'] ?? record['createdAt'] ?? record['created_at'] ?? '') as string,
            status: (normalizedStatus ?? record['status'] ?? IdeaStatus.DRAFT) as IdeaStatus,
            totalScore: this.toNumber(record['totalScore'] ?? record['total_score'], 0),
            voteCount: this.toNumber(record['voteCount'] ?? record['vote_count'], 0),
            budgetApproved: this.toBoolean(record['budgetApproved'] ?? record['budget_approved'], false),
            isInTop10: this.toBoolean(record['isInTop10'] ?? record['is_in_top10'] ?? record['inTop10'], false),
            creatorName: (record['creatorName'] ?? record['creator_name']) as string | undefined,
            organizationName: (record['organizationName'] ?? record['organization_name']) as string | undefined,
            feedbackCount: this.toNumber(record['feedbackCount'] ?? record['feedback_count'], 0),
            tags: (record['tags'] ?? record['tag_list']) as string[] | undefined
        };
    }

    private normalizeStatus(value: unknown): IdeaStatus | null {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if ((Object.values(IdeaStatus) as string[]).includes(trimmed)) {
                return trimmed as IdeaStatus;
            }
            if (/^\d+$/.test(trimmed)) {
                const index = Number(trimmed);
                return this.statusOrder[index] ?? null;
            }
            return null;
        }
        if (typeof value === 'number' && Number.isFinite(value)) {
            return this.statusOrder[value] ?? null;
        }
        return null;
    }

    private toNumber(value: unknown, fallback: number): number {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.length === 0) {
                return fallback;
            }
            const parsed = Number(trimmed);
            return Number.isNaN(parsed) ? fallback : parsed;
        }
        return fallback;
    }

    private toBoolean(value: unknown, fallback: boolean): boolean {
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (['true', '1', 'yes', 'y'].includes(normalized)) {
                return true;
            }
            if (['false', '0', 'no', 'n'].includes(normalized)) {
                return false;
            }
        }
        return fallback;
    }
}
