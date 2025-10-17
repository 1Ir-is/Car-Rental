package com.example.car_rental_server.service.reply;

import com.example.car_rental_server.dto.ReplyDTO;
import com.example.car_rental_server.model.Reply;
import com.example.car_rental_server.model.Review;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IReplyRepository;
import com.example.car_rental_server.repository.IReviewRepository;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * ReplyService - improved tree building and replyTo avatar support.
 */
@Service
@RequiredArgsConstructor
public class ReplyService implements IReplyService {

    private final IReplyRepository replyRepository;
    private final IReviewRepository reviewRepository;
    private final IUserRepository userRepository;

    private ReplyDTO toDTO(Reply r) {
        if (r == null) return null;
        ReplyDTO dto = ReplyDTO.builder()
                .id(r.getId())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .parentId(r.getParent() != null ? r.getParent().getId() : null)
                .build();
        // children default initialized by DTO builder
        if (r.getUser() != null) {
            dto.setUserId(r.getUser().getId());
            dto.setUserName(r.getUser().getName());
            dto.setAvatar(r.getUser().getAvatar());
        }
        return dto;
    }

    @Override
    @Transactional
    public ReplyDTO createReply(Long reviewId, Long parentId, String content) {
        if (content == null || content.trim().length() < 1) {
            throw new IllegalArgumentException("Content required");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found: " + reviewId));

        User author = resolveCurrentUser();

        Reply reply = Reply.builder()
                .content(content.trim())
                .review(review)
                .user(author)
                .build();

        if (reply.getCreatedAt() == null) {
            reply.setCreatedAt(LocalDateTime.now());
        }

        if (parentId != null) {
            Reply parent = replyRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent reply not found: " + parentId));
            if (!Objects.equals(parent.getReview().getId(), review.getId())) {
                throw new IllegalArgumentException("Parent reply does not belong to the same review");
            }
            reply.setParent(parent);
        }

        Reply saved = replyRepository.save(reply);
        return toDTO(saved);
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            String principal = auth.getName();
            Optional<User> u = userRepository.findByEmail(principal);
            if (u.isPresent()) return u.get();
            u = userRepository.findByName(principal);
            return u.orElse(null);
        }
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReplyDTO> getRepliesTreeForReview(Long reviewId) {
        final int maxDisplayDepth = 3;

        // fetch replies with user and parent.user to avoid N+1
        List<Reply> all = replyRepository.findByReviewIdWithUser(reviewId);

        // build map id -> Reply
        Map<Long, Reply> replyMap = new HashMap<>();
        for (Reply r : all) replyMap.put(r.getId(), r);

        // compute depth per reply
        Map<Long, Integer> depthMap = new HashMap<>();
        for (Reply r : all) computeDepth(r, replyMap, depthMap);

        // build DTO map
        Map<Long, ReplyDTO> dtoMap = new LinkedHashMap<>();
        for (Reply r : all) dtoMap.put(r.getId(), toDTO(r));

        List<ReplyDTO> roots = new ArrayList<>();

        for (Reply r : all) {
            ReplyDTO dto = dtoMap.get(r.getId());
            int depth = depthMap.getOrDefault(r.getId(), 1);

            if (depth <= maxDisplayDepth) {
                // normal attach
                if (r.getParent() == null) {
                    roots.add(dto);
                } else {
                    ReplyDTO parentDto = dtoMap.get(r.getParent().getId());
                    if (parentDto != null) {
                        parentDto.getChildren().add(dto);
                        // Optionally set replyTo metadata for visible replies as well (so UI can show "Replying to X")
                        if (r.getParent().getUser() != null) {
                            dto.setReplyToId(r.getParent().getId());
                            dto.setReplyToUserName(r.getParent().getUser().getName());
                            dto.setReplyToAvatar(r.getParent().getUser().getAvatar()); // NEW: avatar
                        }
                    } else {
                        roots.add(dto);
                    }
                }
            } else {
                // depth > maxDisplayDepth: attach under ancestor at display depth
                Reply ancestor = r;
                int stepsUp = depth - maxDisplayDepth;
                for (int i = 0; i < stepsUp; i++) {
                    if (ancestor.getParent() == null) break;
                    Reply next = replyMap.get(ancestor.getParent().getId());
                    ancestor = (next == null) ? ancestor.getParent() : next;
                }
                ReplyDTO ancestorDto = dtoMap.get(ancestor.getId());
                if (ancestorDto != null) {
                    ancestorDto.getChildren().add(dto);
                    if (r.getParent() != null && r.getParent().getUser() != null) {
                        dto.setReplyToId(r.getParent().getId());
                        dto.setReplyToUserName(r.getParent().getUser().getName());
                        dto.setReplyToAvatar(r.getParent().getUser().getAvatar()); // NEW: avatar
                    }
                } else {
                    roots.add(dto);
                }
            }
        }

        return roots;
    }

    private int computeDepth(Reply r, Map<Long, Reply> replyMap, Map<Long, Integer> depthMap) {
        if (r == null) return 0;
        Long id = r.getId();
        if (depthMap.containsKey(id)) return depthMap.get(id);
        if (r.getParent() == null) {
            depthMap.put(id, 1);
            return 1;
        }
        Long pid = r.getParent().getId();
        Reply parent = replyMap.get(pid);
        int parentDepth = (parent == null) ? 1 : computeDepth(parent, replyMap, depthMap);
        int d = parentDepth + 1;
        depthMap.put(id, d);
        return d;
    }
}