package com.example.ideaservice.Model.entities;

import com.example.ideaservice.Model.enums.IdeaStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "ideas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private Long creatorId;
    private Long organizationId;
    private Date creationDate;
    private IdeaStatus status = IdeaStatus.DRAFT;
    private Integer totalScore = 0;
    private Boolean budgetApproved = false;
    private List<Long> assignedTeamIds = new ArrayList<>();
    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Attachment> attachments = new ArrayList<>();
    private Integer voteCount;
    private Boolean isInTop10;
    public void addTeamMember(Long userId) {
        if (!this.assignedTeamIds.contains(userId)) {
            this.assignedTeamIds.add(userId);
        }
    }
    public void removeTeamMember(Long userId) {
        this.assignedTeamIds.remove(userId);
    }
    public boolean isTeamMember(Long userId) {
        return this.assignedTeamIds.contains(userId);
    }
    public List<Long> getAssignedTeam() {
        return new ArrayList<>(this.assignedTeamIds);
    }
    public void addAttachment(Attachment attachment) {
        this.attachments.add(attachment);
        attachment.setIdea(this);
    }
    public void removeAttachment(Attachment attachment) {
        this.attachments.remove(attachment);
        attachment.setIdea(null);
    }
    public boolean canBeSubmitted() {
        return this.status == IdeaStatus.DRAFT &&
                this.title != null && !this.title.isEmpty() &&
                this.description != null && !this.description.isEmpty();
    }
    public boolean canBeApproved() {
        return this.status == IdeaStatus.UNDER_REVIEW;
    }
    public boolean canBeRejected() {
        return this.status == IdeaStatus.UNDER_REVIEW ||
                this.status == IdeaStatus.SUBMITTED;
    }
    public boolean canAssignTeam() {
        return this.status == IdeaStatus.APPROVED ||
                this.status == IdeaStatus.ASSIGNING_TEAM;
    }
    public void approveBudget() {
        this.budgetApproved = true;
    }
    public void rejectBudget() {
        this.budgetApproved = false;
    }
}