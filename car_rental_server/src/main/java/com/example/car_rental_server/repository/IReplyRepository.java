package com.example.car_rental_server.repository;

import com.example.car_rental_server.model.Reply;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IReplyRepository extends JpaRepository<Reply, Long> {

    List<Reply> findByReview_IdOrderByCreatedAtAsc(java.lang.Long reviewId);
    List<Reply> findByParent_IdOrderByCreatedAtAsc(Long parentId);

    /**
     * Fetch replies for a review and also fetch:
     *  - reply.user
     *  - reply.parent
     *  - reply.parent.user
     *
     * This ensures parent's user.avatar is available without extra lazy loads.
     */
    @EntityGraph(attributePaths = {"user", "parent", "parent.user"})
    @Query("SELECT r FROM Reply r WHERE r.review.id = :reviewId ORDER BY r.createdAt ASC")
    List<Reply> findByReviewIdWithUser(@Param("reviewId") Long reviewId);
}