package com.example.ideaservice.Repository;

import com.example.ideaservice.Model.entities.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachementRepository extends JpaRepository<Attachment, Long> {
}
